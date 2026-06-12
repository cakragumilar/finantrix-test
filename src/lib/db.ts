"use client";

import { useEffect, useMemo, useState } from "react";
import { DEMO_MODE } from "./demo";
import {
  DEMO_MODULES,
  DEMO_TOPICS,
  DEMO_LESSONS,
  DEMO_QUESTIONS,
  DEMO_CONFIG,
} from "./mock-data";
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
      DEMO_MODE
        ? null
        : query(
            collection(db(), "modules"),
            where("published", "==", true),
            orderBy("order")
          ),
    []
  );
  const live = useCol<ModuleDoc>(q);
  if (DEMO_MODE) return { data: DEMO_MODULES, error: null, loading: false };
  return live;
}

export function useTopics(moduleId: string | null) {
  const q = useMemo(
    () =>
      DEMO_MODE || !moduleId
        ? null
        : query(
            collection(db(), "topics"),
            where("moduleId", "==", moduleId),
            where("published", "==", true),
            orderBy("order")
          ),
    [moduleId]
  );
  const live = useCol<TopicDoc>(q);
  if (DEMO_MODE)
    return {
      data: moduleId ? DEMO_TOPICS.filter((t) => t.moduleId === moduleId) : [],
      error: null,
      loading: false,
    };
  return live;
}

export function useAllTopics() {
  const q = useMemo(
    () =>
      DEMO_MODE
        ? null
        : query(
            collection(db(), "topics"),
            where("published", "==", true),
            orderBy("order")
          ),
    []
  );
  const live = useCol<TopicDoc>(q);
  if (DEMO_MODE) return { data: DEMO_TOPICS, error: null, loading: false };
  return live;
}

export function useLessons(topicId: string | null) {
  const q = useMemo(
    () =>
      DEMO_MODE || !topicId
        ? null
        : query(
            collection(db(), "lessons"),
            where("topicId", "==", topicId),
            where("published", "==", true),
            orderBy("order")
          ),
    [topicId]
  );
  const live = useCol<LessonDoc>(q);
  if (DEMO_MODE)
    return {
      data: topicId ? DEMO_LESSONS.filter((l) => l.topicId === topicId) : [],
      error: null,
      loading: false,
    };
  return live;
}

export function useAllLessons() {
  const q = useMemo(
    () =>
      DEMO_MODE
        ? null
        : query(
            collection(db(), "lessons"),
            where("published", "==", true),
            orderBy("order")
          ),
    []
  );
  const live = useCol<LessonDoc>(q);
  if (DEMO_MODE) return { data: DEMO_LESSONS, error: null, loading: false };
  return live;
}

/** Fetch a lesson's questions preserving questionIds order (chunked `in` queries). */
export async function getQuestionsByIds(
  ids: string[]
): Promise<WithId<QuestionDoc>[]> {
  if (DEMO_MODE) {
    return ids
      .map((id) => DEMO_QUESTIONS.find((q) => q.id === id))
      .filter(Boolean) as unknown as WithId<QuestionDoc>[];
  }
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
  if (DEMO_MODE) return DEMO_QUESTIONS.filter((q) => q.topicId === topicId) as unknown as WithId<QuestionDoc>[];
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
    if (DEMO_MODE) return;
    return onSnapshot(doc(db(), "config", "app"), (snap) => {
      if (snap.exists()) setCfg({ ...DEFAULT_CONFIG, ...(snap.data() as Partial<AppConfigDoc>) });
    });
  }, []);
  if (DEMO_MODE) return DEMO_CONFIG;
  return cfg;
}
