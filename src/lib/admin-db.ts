"use client";

/* Admin-side data access: includes unpublished docs (requires admin claim). */

import { useMemo } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { useCol } from "./db";
import type { LessonDoc, ModuleDoc, QuestionDoc, TopicDoc } from "./types";

export function useAdminModules() {
  const q = useMemo(() => query(collection(db(), "modules"), orderBy("order")), []);
  return useCol<ModuleDoc>(q);
}

export function useAdminTopics(moduleId: string | null) {
  const q = useMemo(
    () =>
      moduleId
        ? query(
            collection(db(), "topics"),
            where("moduleId", "==", moduleId),
            orderBy("order")
          )
        : null,
    [moduleId]
  );
  return useCol<TopicDoc>(q);
}

export function useAdminAllTopics() {
  const q = useMemo(() => query(collection(db(), "topics"), orderBy("order")), []);
  return useCol<TopicDoc>(q);
}

export function useAdminLessons(topicId: string | null) {
  const q = useMemo(
    () =>
      topicId
        ? query(
            collection(db(), "lessons"),
            where("topicId", "==", topicId),
            orderBy("order")
          )
        : null,
    [topicId]
  );
  return useCol<LessonDoc>(q);
}

export function useAdminQuestions(topicId: string | null) {
  const q = useMemo(
    () =>
      topicId
        ? query(collection(db(), "questions"), where("topicId", "==", topicId))
        : null,
    [topicId]
  );
  return useCol<QuestionDoc>(q);
}

export const createDoc = (col: string, data: Record<string, unknown>) =>
  addDoc(collection(db(), col), data);
export const patchDoc = (col: string, id: string, data: Record<string, unknown>) =>
  updateDoc(doc(db(), col, id), data);
export const removeDoc = (col: string, id: string) => deleteDoc(doc(db(), col, id));

export function emptyQuestion(topicId: string): QuestionDoc {
  return {
    topicId,
    type: "mc",
    prompt: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    answerBool: true,
    answerText: "",
    pairs: [
      { left: "", right: "" },
      { left: "", right: "" },
    ],
    explanation: "",
    difficulty: 2,
    tags: [],
    stats: { attempts: 0, wrong: 0 },
  };
}
