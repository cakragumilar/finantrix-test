"use client";

import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { LEAGUE_CAPACITY } from "./constants";
import { wibWeekStart } from "./dates";
import type { UserDoc } from "./types";

/**
 * Ensure the user belongs to a league for the current WIB week.
 * Finds an open league of the user's tier with capacity, creates one if none,
 * then joins. Weekly closing/promotion runs in Cloud Functions.
 */
export async function ensureLeagueMembership(uid: string, user: UserDoc) {
  const weekStart = wibWeekStart();
  const tier = user.league.tier;

  // Already in a league for this week? Verify via stored id pattern.
  if (user.league.leagueId?.startsWith(`${weekStart}_${tier}`)) return user.league.leagueId;

  const open = await getDocs(
    query(
      collection(db(), "leagues"),
      where("tier", "==", tier),
      where("closed", "==", false),
      where("weekStart", "==", weekStart),
      limit(5)
    )
  );
  let leagueId: string | null = null;
  for (const d of open.docs) {
    if ((d.data().memberCount as number) < LEAGUE_CAPACITY) {
      leagueId = d.id;
      break;
    }
  }
  if (!leagueId) {
    // id is prefixed with week+tier so membership checks need no extra read
    leagueId = `${weekStart}_${tier}_${Math.random().toString(36).slice(2, 8)}`;
    const batchCreate = writeBatch(db());
    batchCreate.set(doc(db(), "leagues", leagueId), {
      tier,
      weekStart,
      capacity: LEAGUE_CAPACITY,
      memberCount: 0,
      closed: false,
    });
    await batchCreate.commit();
  }

  const batch = writeBatch(db());
  batch.set(doc(db(), "leagues", leagueId, "members", uid), {
    displayName: user.displayName,
    photoURL: user.photoURL,
    weeklyXp: 0,
    joinedAt: serverTimestamp(),
  });
  batch.update(doc(db(), "leagues", leagueId), { memberCount: increment(1) });
  await batch.commit();

  await updateDoc(doc(db(), "users", uid), {
    "league.leagueId": leagueId,
    xpWeekly: 0,
  });
  return leagueId;
}
