"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { XIcon, HeartIcon, HeartBreakIcon } from "@phosphor-icons/react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { getQuestionsByIds, useAppConfig, type WithId } from "@/lib/db";
import type { LessonDoc, QuestionDoc } from "@/lib/types";
import {
  bumpQuestionStats,
  buyWithGems,
  completeLesson,
  effectiveHearts,
  addHearts,
  spendHeart,
  type LessonOutcome,
} from "@/lib/game";
import { QuestionView } from "@/components/lesson/question-view";
import { LessonComplete } from "@/components/lesson/complete";
import { RewardedAd } from "@/components/ads";
import { Button, ProgressBar, Skeleton, EmptyState } from "@/components/ui";

export default function LessonPlayerClient() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();
  const cfg = useAppConfig();
  const reduce = useReducedMotion();

  const [lesson, setLesson] = useState<LessonDoc | null>(null);
  const [questions, setQuestions] = useState<WithId<QuestionDoc>[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [heartsLost, setHeartsLost] = useState(0);
  const [outcome, setOutcome] = useState<LessonOutcome | null>(null);
  const [adOpen, setAdOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db(), "lessons", lessonId));
        if (!snap.exists()) throw new Error("not found");
        const l = snap.data() as LessonDoc;
        const qs = await getQuestionsByIds(l.questionIds);
        if (!alive) return;
        setLesson(l);
        setQuestions(qs);
      } catch {
        if (alive) setLoadError(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lessonId]);

  if (!user || !profile) return null;

  const { hearts } = effectiveHearts(profile, cfg);

  if (loadError || (questions && questions.length === 0)) {
    return (
      <EmptyState
        icon={<HeartBreakIcon size={48} weight="bold" />}
        title="Pelajaran tidak ditemukan"
        body="Materi ini belum tersedia. Coba pelajaran lain dulu."
        action={
          <Button onClick={() => router.replace("/belajar")}>Kembali</Button>
        }
      />
    );
  }

  if (!lesson || !questions) {
    return (
      <div className="flex-1 px-4 py-6 flex flex-col gap-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (outcome) {
    return (
      <LessonComplete
        outcome={outcome}
        correct={correctCount}
        total={questions.length}
        vip={profile.vip.active}
        onDone={() => router.replace("/belajar")}
      />
    );
  }

  // out of hearts mid-lesson
  if (!profile.vip.active && hearts <= 0) {
    return (
      <div className="flex-1 flex flex-col px-6 py-10 gap-6 items-center text-center justify-center">
        <span className="text-danger">
          <HeartBreakIcon size={64} weight="fill" />
        </span>
        <h1 className="text-2xl font-extrabold">Hati kamu habis</h1>
        <p className="text-ink-soft text-sm max-w-[32ch]">
          Tunggu hati pulih, tonton iklan, atau tukar permata untuk lanjut
          belajar.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <Button full onClick={() => setAdOpen(true)}>
            Tonton iklan (+1 hati)
          </Button>
          <Button
            full
            variant="secondary"
            disabled={profile.gems < cfg.gemPricePerHeart}
            onClick={() => buyWithGems(user.uid, profile, cfg, "hearts")}
          >
            Tukar {cfg.gemPricePerHeart} permata (+1 hati)
          </Button>
          <Button full variant="ghost" onClick={() => router.replace("/belajar")}>
            Keluar
          </Button>
        </div>
        <RewardedAd
          open={adOpen}
          onClose={() => setAdOpen(false)}
          onReward={() => addHearts(user.uid, profile, cfg, cfg.heartsPerRewardedAd)}
        />
      </div>
    );
  }

  const q = questions[idx];

  async function handleChecked(correct: boolean) {
    if (!user || !profile) return;
    void bumpQuestionStats(q.id, !correct);
    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setHeartsLost((h) => h + 1);
      await spendHeart(user.uid, profile, cfg);
    }
  }

  async function handleNext() {
    if (!user || !profile || !lesson || !questions) return;
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
    } else {
      const result = await completeLesson(user.uid, profile, {
        lessonId,
        correct: correctCount,
        total: questions.length,
        xpReward: lesson.xpReward,
      });
      setOutcome(result);
    }
  }

  return (
    <div className="flex-1 flex flex-col px-4 pt-4 min-h-[100dvh]">
      <header className="flex items-center gap-3 pb-4">
        <Link
          href="/belajar"
          aria-label="Keluar dari pelajaran"
          className="text-ink-faint p-1"
        >
          <XIcon size={24} weight="bold" />
        </Link>
        <div className="flex-1">
          <ProgressBar value={idx / questions.length} />
        </div>
        <motion.span
          key={heartsLost}
          className="flex items-center gap-1 text-danger font-bold"
          animate={
            heartsLost > 0 && !reduce ? { x: [0, -8, 8, -6, 6, 0] } : undefined
          }
          transition={{ duration: 0.4 }}
        >
          <HeartIcon size={20} weight="fill" />
          <span className="num text-sm">
            {profile.vip.active ? "∞" : hearts}
          </span>
        </motion.span>
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
          <QuestionView q={q} onChecked={handleChecked} onNext={handleNext} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
