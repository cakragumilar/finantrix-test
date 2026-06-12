"use client";

import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FlameIcon, DiamondIcon, LightningIcon } from "@phosphor-icons/react";
import type { LessonOutcome } from "@/lib/game";
import { LOTTIE } from "@/lib/constants";
import { Button, Card } from "@/components/ui";
import { AdBanner } from "@/components/ads";
import { sfx } from "@/lib/sound";

export function LessonComplete({
  outcome,
  correct,
  total,
  vip,
  onDone,
}: {
  outcome: LessonOutcome;
  correct: number;
  total: number;
  vip: boolean;
  onDone: () => void;
}) {
  const reduce = useReducedMotion();
  const [xpShown, setXpShown] = useState(0);

  useEffect(() => {
    sfx.complete();
    if (outcome.streak.milestone) sfx.streak();
    const controls = animate(0, outcome.xpEarned, {
      duration: reduce ? 0 : 1.1,
      ease: "easeOut",
      onUpdate: (v) => setXpShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [outcome, reduce]);

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col px-6 py-10 gap-6">
      <motion.div
        className="flex flex-col items-center text-center gap-2"
        initial={reduce ? false : { scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        {outcome.streak.milestone ? (
          <div className="h-36 w-36">
            <DotLottieReact src={LOTTIE.streakFire} autoplay loop={false} />
          </div>
        ) : (
          <span className="bg-accent-soft text-accent rounded-full p-6">
            <LightningIcon size={48} weight="fill" />
          </span>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight mt-2">
          Pelajaran selesai!
        </h1>
        {outcome.streak.milestone && (
          <p className="text-streak font-bold">
            Runtutan {outcome.streak.milestone} hari! Luar biasa.
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="num text-2xl font-bold text-accent">+{xpShown}</p>
          <p className="text-xs font-bold text-ink-soft mt-1">XP</p>
        </Card>
        <Card className="text-center">
          <p className="num text-2xl font-bold">{accuracy}%</p>
          <p className="text-xs font-bold text-ink-soft mt-1">Akurasi</p>
        </Card>
        <Card className="text-center">
          <p className="num text-2xl font-bold text-streak flex items-center justify-center gap-1">
            <FlameIcon size={20} weight="fill" />
            {outcome.streak.current}
          </p>
          <p className="text-xs font-bold text-ink-soft mt-1">Runtutan</p>
        </Card>
      </div>

      {outcome.gemsEarned > 0 && (
        <Card className="flex items-center gap-3">
          <DiamondIcon size={28} weight="fill" className="text-gem shrink-0" />
          <p className="font-bold text-sm">
            Sempurna! Kamu dapat{" "}
            <span className="num text-gem">{outcome.gemsEarned}</span> permata.
          </p>
        </Card>
      )}

      <AdBanner vip={vip} />

      <div className="mt-auto">
        <Button full onClick={onDone}>
          Lanjut
        </Button>
      </div>
    </div>
  );
}
