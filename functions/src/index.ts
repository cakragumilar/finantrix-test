/*
  Finantrix Cloud Functions: every write the client must not own.
  Region: asia-southeast2 (Jakarta). Deploy with `firebase deploy --only functions`.
  Secrets: MIDTRANS_SERVER_KEY (firebase functions:secrets:set MIDTRANS_SERVER_KEY)
*/

import { setGlobalOptions } from "firebase-functions/v2";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";
import { createHash } from "node:crypto";

setGlobalOptions({ region: "asia-southeast2", maxInstances: 10 });
initializeApp();
const db = getFirestore();

const TIERS = ["bronze", "silver", "gold", "platinum", "diamond"] as const;
const PROMOTE_N = 5;
const DEMOTE_N = 5;

const MIDTRANS_SERVER_KEY = defineSecret("MIDTRANS_SERVER_KEY");
const MIDTRANS_API = "https://app.sandbox.midtrans.com/snap/v1/transactions";

const VIP_PRICES = { monthly: 49_000, yearly: 399_000 } as const;
const GEM_PACKS: Record<number, number> = { 200: 15_000, 550: 35_000, 1200: 69_000 };

/* ---------- Weekly league reset: Monday 00:00 WIB ---------- */

export const leagueWeeklyReset = onSchedule(
  { schedule: "0 0 * * 1", timeZone: "Asia/Jakarta" },
  async () => {
    const open = await db.collection("leagues").where("closed", "==", false).get();
    for (const league of open.docs) {
      const tier = league.data().tier as (typeof TIERS)[number];
      const tierIdx = TIERS.indexOf(tier);
      const members = await league.ref
        .collection("members")
        .orderBy("weeklyXp", "desc")
        .get();

      const batch = db.batch();
      members.docs.forEach((m, rank) => {
        const uid = m.id;
        const userRef = db.doc(`users/${uid}`);
        let nextTier = tier;
        const earned = (m.data().weeklyXp as number) > 0;
        if (earned && rank < PROMOTE_N && tierIdx < TIERS.length - 1) {
          nextTier = TIERS[tierIdx + 1];
          batch.update(userRef, {
            badges: FieldValue.arrayUnion(`league-${nextTier}`),
          });
        } else if (
          rank >= members.size - DEMOTE_N &&
          members.size > PROMOTE_N + DEMOTE_N &&
          tierIdx > 0
        ) {
          nextTier = TIERS[tierIdx - 1];
        }
        batch.update(userRef, {
          "league.tier": nextTier,
          "league.leagueId": null,
          xpWeekly: 0,
        });
      });
      batch.update(league.ref, { closed: true });
      await batch.commit();
    }
  }
);

/* ---------- Daily actives rollup (admin dashboard) ---------- */

export const aggregateDailyActives = onSchedule(
  { schedule: "15 0 * * *", timeZone: "Asia/Jakarta" },
  async () => {
    const yesterday = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
    }).format(new Date(Date.now() - 86_400_000));
    const snap = await db
      .collectionGroup("activity")
      .where("date", "==", yesterday)
      .count()
      .get();
    await db.doc(`stats/daily-${yesterday}`).set({
      date: yesterday,
      activeUsers: snap.data().count,
    });
  }
);

/* ---------- Streak reminder push (hourly, WIB) ---------- */

export const sendStreakReminders = onSchedule(
  { schedule: "0 * * * *", timeZone: "Asia/Jakarta" },
  async () => {
    const hour = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      hour12: false,
    }).format(new Date());
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
    }).format(new Date());
    const users = await db
      .collection("users")
      .where("reminderTime", ">=", `${hour}:00`)
      .where("reminderTime", "<=", `${hour}:59`)
      .get();
    const messaging = getMessaging();
    for (const u of users.docs) {
      const d = u.data();
      if (!d.fcmToken || d.streak?.lastActiveDate === today) continue;
      try {
        await messaging.send({
          token: d.fcmToken,
          notification: {
            title: "Jangan putus runtutanmu!",
            body: `Runtutan ${d.streak?.current ?? 0} hari menunggu. Satu pelajaran saja hari ini.`,
          },
          webpush: { fcmOptions: { link: "/belajar" } },
        });
      } catch {
        // token expired; clear it
        await u.ref.update({ fcmToken: null });
      }
    }
  }
);

/* ---------- Admin role claims ---------- */

export const setAdminRole = onCall(async (req) => {
  if (req.auth?.token?.superadmin !== true) {
    throw new HttpsError("permission-denied", "Superadmin only");
  }
  const { uid, role } = req.data as { uid: string; role: "editor" | "superadmin" | null };
  if (!uid) throw new HttpsError("invalid-argument", "uid required");
  const claims =
    role === "superadmin"
      ? { admin: true, superadmin: true }
      : role === "editor"
        ? { admin: true, superadmin: false }
        : { admin: false, superadmin: false };
  await getAuth().setCustomUserClaims(uid, claims);
  return { ok: true };
});

/* ---------- Midtrans checkout + webhook ---------- */

export const createMidtransTransaction = onCall(
  { secrets: [MIDTRANS_SERVER_KEY] },
  async (req) => {
    if (!req.auth) throw new HttpsError("unauthenticated", "Sign in first");
    const uid = req.auth.uid;
    const item = req.data as
      | { kind: "vip"; plan: "monthly" | "yearly" }
      | { kind: "gems"; gems: number; priceIDR: number };

    let amount: number;
    let kind: string;
    if (item.kind === "vip") {
      amount = VIP_PRICES[item.plan];
      kind = "vip";
    } else {
      const expected = GEM_PACKS[item.gems];
      if (!expected) throw new HttpsError("invalid-argument", "Unknown gem pack");
      amount = expected;
      kind = "gems";
    }

    const txnRef = db.collection("transactions").doc();
    const orderId = txnRef.id;
    await txnRef.set({
      uid,
      kind,
      provider: "midtrans",
      amountIDR: amount,
      gemsSpent: 0,
      meta: item,
      status: "pending",
      providerOrderId: orderId,
      createdAt: FieldValue.serverTimestamp(),
    });

    const res = await fetch(MIDTRANS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${MIDTRANS_SERVER_KEY.value()}:`).toString("base64"),
      },
      body: JSON.stringify({
        transaction_details: { order_id: orderId, gross_amount: amount },
      }),
    });
    if (!res.ok) throw new HttpsError("internal", "Midtrans rejected the order");
    const json = (await res.json()) as { token: string };
    return { token: json.token };
  }
);

export const midtransWebhook = onRequest(
  { secrets: [MIDTRANS_SERVER_KEY] },
  async (req, res) => {
    const b = req.body as {
      order_id: string;
      status_code: string;
      gross_amount: string;
      signature_key: string;
      transaction_status: string;
    };
    const expected = createHash("sha512")
      .update(b.order_id + b.status_code + b.gross_amount + MIDTRANS_SERVER_KEY.value())
      .digest("hex");
    if (expected !== b.signature_key) {
      res.status(403).send("bad signature");
      return;
    }

    const txnRef = db.doc(`transactions/${b.order_id}`);
    const txn = await txnRef.get();
    if (!txn.exists) {
      res.status(404).send("unknown order");
      return;
    }
    const data = txn.data()!;

    const paid = ["settlement", "capture"].includes(b.transaction_status);
    const failed = ["deny", "cancel", "expire"].includes(b.transaction_status);
    if (!paid && !failed) {
      res.status(200).send("ok");
      return;
    }
    if (data.status === "paid") {
      res.status(200).send("already fulfilled");
      return;
    }

    if (failed) {
      await txnRef.update({ status: "failed" });
      res.status(200).send("ok");
      return;
    }

    const userRef = db.doc(`users/${data.uid}`);
    const meta = data.meta as { kind: string; plan?: string; gems?: number };
    if (meta.kind === "vip") {
      const days = meta.plan === "yearly" ? 365 : 30;
      await userRef.update({
        "vip.active": true,
        "vip.plan": meta.plan,
        "vip.expiresAt": new Date(Date.now() + days * 86_400_000),
        badges: FieldValue.arrayUnion("vip"),
      });
    } else if (meta.kind === "gems" && meta.gems) {
      await userRef.update({ gems: FieldValue.increment(meta.gems) });
    }
    await txnRef.update({ status: "paid" });
    res.status(200).send("ok");
  }
);
