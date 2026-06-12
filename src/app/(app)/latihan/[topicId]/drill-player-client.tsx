"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { TimerIcon, XIcon, TargetIcon } from "@phosphor-icons/react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { getTopicQuestions, type WithId } from "@/lib/db";
import { DEFAULT_DRILL_TIMER_SEC } from "@/lib/constants";
import type { QuestionDoc, TopicDoc } from "@/lib/types";
import { recordDrill } from "@/lib/game";
import { QuestionView } from "@/components/lesson/question-view";
import { Button, Card, ProgressBar, Skeleton, EmptyState } from "@/components/ui";

const DRILL_SIZE = 10;

export default function DrillPlayerClient() {
  const { topicId } = useParams<{ topicId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const reduce = useReducedMotion();

  const [topic, setTopic] = useState<TopicDoc | null>(null);
  const [questions, setQuestions] = useState<WithId<QuestionDoc>[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrongTags, setWrongTags] = useState<string[]>([]);
  const [times, setTimes] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_DRILL_TIMER_SEC);
  const [forceToken, setForceToken] = useState(0);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const startRef = useRef(0);

  const timerSec = topic?.drillTimerSec || DEFAULT_DRILL_TIMER_SEC;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [topicSnap, qs] = await Promise.all([
          getDoc(doc(db(), "topics", topicId)),
          getTopicQuestions(topicId),
        ]);
        if (!alive) return;
        if (!topicSnap.exists() || qs.length === 0) {
          setLoadError(true);
          return;
        }
        const t = topicSnap.data() as TopicDoc;
        setTopic(t);
        setSecondsLeft(t.drillTimerSec || DEFAULT_DRILL_TIMER_SEC);
        setQuestions(qs.sort(() => Math.random() - 0.5).slice(0, DRILL_SIZE));
        startRef.current = Date.now();
      } catch {
        if (alive) setLoadError(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [topicId]);

  // countdown; pauses once the answer is checked
  useEffect(() => {
    if (!questions || done || checked || secondsLeft <= 0) return;
    const t = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
      if (secondsLeft === 1) setForceToken((tk) => tk + 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, questions, done, checked]);

  const avgTimeMs = useMemo(
    () =>
      times.length
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        : 0,
    [times]
  );

  if (loadError) {
    return (
      <EmptyState
        icon={<TargetIcon size={48} weight="bold" />}
        title="Belum ada soal"
        body="Topik ini belum punya soal latihan. Pilih topik lain dulu."
        action={<Button onClick={() => router.replace("/latihan")}>Kembali</Button>}
      />
    );
  }

  if (!questions || !topic) {
    return (
      <div className="flex-1 px-4 py-6 flex flex-col gap-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (done) {
    const accuracy = Math.round((correct / questions.length) * 100);
    const weak = [...new Set(wrongTags)].slice(0, 5);
    return (
      <div className="flex-1 flex flex-col px-6 py-10 gap-6">
        <motion.div
          className="flex flex-col items-center text-center gap-2"
          initial={reduce ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <span className="bg-accent-soft text-accent rounded-full p-6">
            <TargetIcon size={48} weight="fill" />
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">
            Latihan selesai!
          </h1>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <p className="num text-2xl font-bold text-accent">{accuracy}%</p>
            <p className="text-xs font-bold text-ink-soft mt-1">Akurasi</p>
          </Card>
          <Card className="text-center">
            <p className="num text-2xl font-bold">
              {(avgTimeMs / 1000).toFixed(1)}d
            </p>
            <p className="text-xs font-bold text-ink-soft mt-1">
              Rata-rata per soal
            </p>
          </Card>
        </div>

        {weak.length > 0 && (
          <Card>
            <p className="font-bold text-sm mb-2">Perlu diasah lagi</p>
            <div className="flex flex-wrap gap-2">
              {weak.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-danger-soft text-danger text-xs font-bold px-3 py-1.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <Button full onClick={() => router.replace("/latihan")}>
            Selesai
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[idx];

  function handleChecked(ok: boolean) {
    setChecked(true);
    setTimes((t) => [...t, Date.now() - startRef.current]);
    if (ok) setCorrect((c) => c + 1);
    else setWrongTags((w) => [...w, ...(q.tags.length ? q.tags : [topic!.title])]);
  }

  async function handleNext() {
    if (idx + 1 < questions!.length) {
      setIdx(idx + 1);
      setChecked(false);
      setForceToken(0); // fresh card must not inherit the timeout signal
      setSecondsLeft(timerSec);
      startRef.current = Date.now();
    } else {
      setDone(true);
      if (user) {
        void recordDrill(user.uid, {
          topicId,
          total: questions!.length,
          correct,
          avgTimeMs,
          weakTags: [...new Set(wrongTags)],
        });
      }
    }
  }

  const urgent = secondsLeft <= 5;

  return (
    <div className="flex-1 flex flex-col px-4 pt-4 min-h-[100dvh]">
      <header className="flex items-center gap-3 pb-4">
        <Link href="/latihan" aria-label="Keluar dari latihan" className="text-ink-faint p-1">
          <XIcon size={24} weight="bold" />
        </Link>
        <div className="flex-1">
          <ProgressBar value={idx / questions.length} />
        </div>
        <span
          className={`flex items-center gap-1 font-bold ${
            urgent ? "text-danger" : "text-ink-soft"
          }`}
        >
          <TimerIcon size={20} weight="fill" />
          <span className="num text-sm">{secondsLeft}</span>
        </span>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          className="flex-1 flex flex-col"
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 64 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -64 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <QuestionView
            q={q}
            onChecked={handleChecked}
            onNext={handleNext}
            forceCheckToken={forceToken}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
