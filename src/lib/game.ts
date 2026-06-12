"use client";

import {
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  GEMS_PER_LESSON_PERFECT,
  MAX_HEARTS,
  STREAK_MILESTONES,
} from "./constants";
import { wibToday, wibYesterday } from "./dates";
import type { AppConfigDoc, UserDoc } from "./types";

/* ---------------- Hearts ---------------- */

/** Hearts as of now, derived from last stored value + elapsed regen time. */
export function effectiveHearts(
  user: UserDoc,
  cfg: AppConfigDoc
): { hearts: number; nextRegenMs: number } {
  if (user.vip.active) return { hearts: MAX_HEARTS, nextRegenMs: 0 };
  const { current, max, lastRegenAt } = user.hearts;
  if (current >= max || !lastRegenAt) return { hearts: current, nextRegenMs: 0 };
  const regenMs = cfg.heartRegenMinutes * 60_000;
  const elapsed = Date.now() - lastRegenAt.toMillis();
  const regenerated = Math.floor(elapsed / regenMs);
  const hearts = Math.min(max, current + regenerated);
  const nextRegenMs = hearts >= max ? 0 : regenMs - (elapsed % regenMs);
  return { hearts, nextRegenMs };
}

export async function spendHeart(uid: string, user: UserDoc, cfg: AppConfigDoc) {
  if (user.vip.active) return;
  const { hearts } = effectiveHearts(user, cfg);
  const next = Math.max(0, hearts - 1);
  await updateDoc(doc(db(), "users", uid), {
    "hearts.current": next,
    "hearts.lastRegenAt": serverTimestamp(),
  });
}

export async function addHearts(uid: string, user: UserDoc, cfg: AppConfigDoc, n: number) {
  const { hearts } = effectiveHearts(user, cfg);
  await updateDoc(doc(db(), "users", uid), {
    "hearts.current": Math.min(user.hearts.max, hearts + n),
    "hearts.lastRegenAt": serverTimestamp(),
  });
}

/* ---------------- Streak ---------------- */

export interface StreakResult {
  current: number;
  increased: boolean;
  usedFreeze: boolean;
  milestone: number | null;
}

export function nextStreak(user: UserDoc): StreakResult {
  const today = wibToday();
  const yesterday = wibYesterday();
  const s = user.streak;
  if (s.lastActiveDate === today) {
    return { current: s.current, increased: false, usedFreeze: false, milestone: null };
  }
  let current: number;
  let usedFreeze = false;
  if (s.lastActiveDate === yesterday || s.current === 0) {
    current = s.current + 1;
  } else if (s.freezes > 0) {
    current = s.current + 1;
    usedFreeze = true;
  } else {
    current = 1;
  }
  const milestone = STREAK_MILESTONES.includes(current) ? current : null;
  return { current, increased: true, usedFreeze, milestone };
}

/* ---------------- Lesson completion ---------------- */

export interface LessonOutcome {
  xpEarned: number;
  streak: StreakResult;
  gemsEarned: number;
  newBadges: string[];
}

export async function completeLesson(
  uid: string,
  user: UserDoc,
  args: { lessonId: string; correct: number; total: number; xpReward: number }
): Promise<LessonOutcome> {
  const { lessonId, correct, total, xpReward } = args;
  const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const xpEarned = xpReward + correct; // base reward + 1 bonus per correct
  const perfect = correct === total && total > 0;
  const gemsEarned = perfect ? GEMS_PER_LESSON_PERFECT : 0;
  const streak = nextStreak(user);
  const today = wibToday();

  const newBadges: string[] = [];
  if (streak.milestone && !user.badges.includes(`streak-${streak.milestone}`)) {
    newBadges.push(`streak-${streak.milestone}`);
  }
  if (perfect && !user.badges.includes("perfeksionis")) {
    newBadges.push("perfeksionis");
  }

  const batch = writeBatch(db());
  const userRef = doc(db(), "users", uid);
  batch.update(userRef, {
    xpTotal: increment(xpEarned),
    xpWeekly: increment(xpEarned),
    gems: increment(gemsEarned),
    "streak.current": streak.current,
    "streak.longest": Math.max(user.streak.longest, streak.current),
    "streak.lastActiveDate": streak.increased ? today : user.streak.lastActiveDate,
    "streak.freezes": streak.usedFreeze
      ? Math.max(0, user.streak.freezes - 1)
      : user.streak.freezes,
    ...(newBadges.length
      ? { badges: [...user.badges, ...newBadges] }
      : {}),
  });

  const progRef = doc(db(), "users", uid, "lessonProgress", lessonId);
  batch.set(
    progRef,
    {
      status: "completed",
      bestScorePct: scorePct,
      attempts: increment(1),
      completedAt: serverTimestamp(),
    },
    { merge: true }
  );

  const actRef = doc(db(), "users", uid, "activity", today);
  batch.set(
    actRef,
    // `date` mirrors the doc id so collectionGroup rollups can filter on it
    { date: today, lessonsCompleted: increment(1), xpEarned: increment(xpEarned) },
    { merge: true }
  );

  if (user.league.leagueId) {
    const memberRef = doc(
      db(),
      "leagues",
      user.league.leagueId,
      "members",
      uid
    );
    batch.update(memberRef, { weeklyXp: increment(xpEarned) });
  }

  await batch.commit();
  return { xpEarned, streak, gemsEarned, newBadges };
}

/* ---------------- Drill ---------------- */

export async function recordDrill(
  uid: string,
  args: {
    topicId: string;
    total: number;
    correct: number;
    avgTimeMs: number;
    weakTags: string[];
  }
) {
  const ref = doc(collection(db(), "users", uid, "drillResults"));
  await setDoc(ref, {
    ...args,
    accuracyPct:
      args.total > 0 ? Math.round((args.correct / args.total) * 100) : 0,
    at: serverTimestamp(),
  });
}

/* ---------------- Question stats ---------------- */

export async function bumpQuestionStats(questionId: string, wrong: boolean) {
  try {
    await updateDoc(doc(db(), "questions", questionId), {
      "stats.attempts": increment(1),
      ...(wrong ? { "stats.wrong": increment(1) } : {}),
    });
  } catch {
    // stats are best-effort; never block the lesson on them
  }
}

/* ---------------- Gem spending ---------------- */

export async function buyWithGems(
  uid: string,
  user: UserDoc,
  cfg: AppConfigDoc,
  kind: "hearts" | "streak_freeze"
) {
  const price =
    kind === "hearts" ? cfg.gemPricePerHeart : cfg.gemPriceStreakFreeze;
  if (user.gems < price) throw new Error("Permata tidak cukup");
  const batch = writeBatch(db());
  const userRef = doc(db(), "users", uid);
  if (kind === "hearts") {
    const { hearts } = effectiveHearts(user, cfg);
    batch.update(userRef, {
      gems: increment(-price),
      "hearts.current": Math.min(user.hearts.max, hearts + 1),
      "hearts.lastRegenAt": serverTimestamp(),
    });
  } else {
    batch.update(userRef, {
      gems: increment(-price),
      "streak.freezes": increment(1),
    });
  }
  const txnRef = doc(collection(db(), "transactions"));
  batch.set(txnRef, {
    uid,
    kind,
    provider: "gems",
    amountIDR: 0,
    gemsSpent: price,
    status: "paid",
    providerOrderId: null,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export { Timestamp };
