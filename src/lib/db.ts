"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  documentId,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type Query,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  AppConfigDoc,
  LessonDoc,
  ModuleDoc,
  QuestionDoc,
  TopicDoc,
} from "./types";
import {
  DEFAULT_HEART_REGEN_MINUTES,
  GEM_PRICE_PER_HEART,
  GEM_PRICE_STREAK_FREEZE,
  LEAGUE_DEMOTE_N,
  LEAGUE_PROMOTE_N,
} from "./constants";

export type WithId<T> = T & { id: string };

export function useCol<T = DocumentData>(q: Query | null) {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!q) return;
    const unsub = onSnapshot(
      q,
      (snap) =>
        setData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }))),
      (e) => setError(e.message)
    );
    return () => {
      unsub();
      setData(null);
    };
  }, [q]);
  return { data, error, loading: data === null && !error };
}

export function useModules() {
  const q = useMemo(
    () =>
      query(
        collection(db(), "modules"),
        where("published", "==", true),
        orderBy("order")
      ),
    []
  );
  return useCol<ModuleDoc>(q);
}

export function useTopics(moduleId: string | null) {
  const q = useMemo(
    () =>
      moduleId
        ? query(
            collection(db(), "topics"),
            where("moduleId", "==", moduleId),
            where("published", "==", true),
            orderBy("order")
          )
        : null,
    [moduleId]
  );
  return useCol<TopicDoc>(q);
}

export function useAllTopics() {
  const q = useMemo(
    () =>
      query(
        collection(db(), "topics"),
        where("published", "==", true),
        orderBy("order")
      ),
    []
  );
  return useCol<TopicDoc>(q);
}

export function useLessons(topicId: string | null) {
  const q = useMemo(
    () =>
      topicId
        ? query(
            collection(db(), "lessons"),
            where("topicId", "==", topicId),
            where("published", "==", true),
            orderBy("order")
          )
        : null,
    [topicId]
  );
  return useCol<LessonDoc>(q);
}

export function useAllLessons() {
  const q = useMemo(
    () =>
      query(
        collection(db(), "lessons"),
        where("published", "==", true),
        orderBy("order")
      ),
    []
  );
  return useCol<LessonDoc>(q);
}

/** Fetch a lesson's questions preserving questionIds order (chunked `in` queries). */
export async function getQuestionsByIds(
  ids: string[]
): Promise<WithId<QuestionDoc>[]> {
  const out = new Map<string, WithId<QuestionDoc>>();
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    const snap = await getDocs(
      query(collection(db(), "questions"), where(documentId(), "in", chunk))
    );
    snap.docs.forEach((d) =>
      out.set(d.id, { id: d.id, ...(d.data() as QuestionDoc) })
    );
  }
  return ids.map((id) => out.get(id)).filter(Boolean) as WithId<QuestionDoc>[];
}

export async function getTopicQuestions(
  topicId: string
): Promise<WithId<QuestionDoc>[]> {
  const snap = await getDocs(
    query(collection(db(), "questions"), where("topicId", "==", topicId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as QuestionDoc) }));
}

export const DEFAULT_CONFIG: AppConfigDoc = {
  heartRegenMinutes: DEFAULT_HEART_REGEN_MINUTES,
  heartsPerRewardedAd: 1,
  gemPricePerHeart: GEM_PRICE_PER_HEART,
  gemPriceStreakFreeze: GEM_PRICE_STREAK_FREEZE,
  leaguePromoteN: LEAGUE_PROMOTE_N,
  leagueDemoteN: LEAGUE_DEMOTE_N,
};

export function useAppConfig(): AppConfigDoc {
  const [cfg, setCfg] = useState<AppConfigDoc>(DEFAULT_CONFIG);
  useEffect(() => {
    return onSnapshot(doc(db(), "config", "app"), (snap) => {
      if (snap.exists()) setCfg({ ...DEFAULT_CONFIG, ...(snap.data() as Partial<AppConfigDoc>) });
    });
  }, []);
  return cfg;
}
