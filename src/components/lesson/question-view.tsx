"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import type { QuestionDoc } from "@/lib/types";
import type { WithId } from "@/lib/db";
import { Button } from "@/components/ui";
import { sfx } from "@/lib/sound";

type Phase = "answering" | "correct" | "wrong";

export interface QuestionViewProps {
  q: WithId<QuestionDoc>;
  /** fires once when the answer is checked */
  onChecked: (correct: boolean) => void;
  /** fires when the user advances to the next card */
  onNext: () => void;
  /** drill mode: bump this number to force-check with the current selection */
  forceCheckToken?: number;
}

function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function QuestionView({
  q,
  onChecked,
  onNext,
  forceCheckToken = 0,
}: QuestionViewProps) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("answering");

  // per-type answer state
  const [mcChoice, setMcChoice] = useState<number | null>(null);
  const [tfChoice, setTfChoice] = useState<boolean | null>(null);
  const [fillText, setFillText] = useState("");

  // match state
  const rights = useMemo(
    () => (q.type === "match" ? seededShuffle(q.pairs.map((p) => p.right), q.id) : []),
    [q]
  );
  const [leftSel, setLeftSel] = useState<string | null>(null);
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [matchMistakes, setMatchMistakes] = useState(0);
  const [shakeRight, setShakeRight] = useState<string | null>(null);

  const canCheck =
    (q.type === "mc" && mcChoice !== null) ||
    (q.type === "tf" && tfChoice !== null) ||
    (q.type === "fill" && fillText.trim().length > 0);

  function isCorrect(): boolean {
    if (q.type === "mc") return mcChoice === q.correctIndex;
    if (q.type === "tf") return tfChoice === q.answerBool;
    if (q.type === "fill") {
      return (
        fillText.trim().toLowerCase().replace(/\s+/g, " ") ===
        q.answerText.trim().toLowerCase().replace(/\s+/g, " ")
      );
    }
    return matchMistakes === 0;
  }

  function check(force = false) {
    if (phase !== "answering") return;
    if (!force && !canCheck) return;
    const ok = !force && isCorrect();
    setPhase(ok ? "correct" : "wrong");
    if (ok) sfx.correct();
    else sfx.wrong();
    onChecked(ok);
  }

  // drill timeout forces a check (counts as wrong if unanswered)
  useEffect(() => {
    if (forceCheckToken > 0 && phase === "answering") {
      const id = setTimeout(() => (canCheck ? check() : check(true)), 0);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceCheckToken]);

  function tapRight(right: string) {
    if (!leftSel || locked.has(right) || phase !== "answering") return;
    const pair = q.pairs.find((p) => p.left === leftSel);
    if (pair?.right === right) {
      const next = new Set(locked);
      next.add(right);
      next.add(`L:${leftSel}`);
      setLocked(next);
      setLeftSel(null);
      sfx.click();
      if (next.size === q.pairs.length * 2) {
        const ok = matchMistakes === 0;
        setPhase(ok ? "correct" : "wrong");
        if (ok) sfx.correct();
        else sfx.wrong();
        onChecked(ok);
      }
    } else {
      setMatchMistakes((m) => m + 1);
      setShakeRight(right);
      sfx.wrong();
      setTimeout(() => setShakeRight(null), 350);
    }
  }

  const optionBase =
    "w-full text-left rounded-[var(--radius-input)] border-2 px-4 py-3.5 font-semibold transition-colors";

  return (
    <div className="flex-1 flex flex-col gap-5">
      <h2 className="text-xl font-extrabold tracking-tight">{q.prompt}</h2>

      {q.type === "mc" && (
        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => {
            const selected = mcChoice === i;
            const showState =
              phase !== "answering" && (i === q.correctIndex || selected);
            const stateClass =
              phase === "answering"
                ? selected
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-raised"
                : showState
                  ? i === q.correctIndex
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-danger bg-danger-soft text-danger"
                  : "border-line bg-raised opacity-50";
            return (
              <button
                key={i}
                disabled={phase !== "answering"}
                onClick={() => {
                  sfx.click();
                  setMcChoice(i);
                }}
                className={`${optionBase} ${stateClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {q.type === "tf" && (
        <div className="grid grid-cols-2 gap-3">
          {([true, false] as const).map((v) => {
            const selected = tfChoice === v;
            const stateClass =
              phase === "answering"
                ? selected
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-raised"
                : v === q.answerBool
                  ? "border-accent bg-accent-soft text-accent"
                  : selected
                    ? "border-danger bg-danger-soft text-danger"
                    : "border-line bg-raised opacity-50";
            return (
              <button
                key={String(v)}
                disabled={phase !== "answering"}
                onClick={() => {
                  sfx.click();
                  setTfChoice(v);
                }}
                className={`${optionBase} text-center ${stateClass}`}
              >
                {v ? "Benar" : "Salah"}
              </button>
            );
          })}
        </div>
      )}

      {q.type === "fill" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="fill-answer" className="text-sm font-bold text-ink-soft">
            Jawaban kamu
          </label>
          <input
            id="fill-answer"
            type="text"
            inputMode="text"
            autoComplete="off"
            disabled={phase !== "answering"}
            value={fillText}
            onChange={(e) => setFillText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            className="rounded-[var(--radius-input)] border-2 border-line bg-raised px-4 py-3.5 font-semibold text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            placeholder="Ketik di sini"
          />
          {phase === "wrong" && (
            <p className="text-sm font-semibold text-ink-soft">
              Jawaban benar: <span className="text-accent">{q.answerText}</span>
            </p>
          )}
        </div>
      )}

      {q.type === "match" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">
            {q.pairs.map((p) => {
              const done = locked.has(`L:${p.left}`);
              const selected = leftSel === p.left;
              return (
                <button
                  key={p.left}
                  disabled={done || phase !== "answering"}
                  onClick={() => {
                    sfx.click();
                    setLeftSel(selected ? null : p.left);
                  }}
                  className={`${optionBase} text-sm ${
                    done
                      ? "border-line bg-sunken text-ink-faint"
                      : selected
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line bg-raised"
                  }`}
                >
                  {p.left}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            {rights.map((r) => {
              const done = locked.has(r);
              return (
                <motion.button
                  key={r}
                  disabled={done || phase !== "answering"}
                  onClick={() => tapRight(r)}
                  animate={
                    shakeRight === r && !reduce ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }
                  }
                  transition={{ duration: 0.35 }}
                  className={`${optionBase} text-sm ${
                    done
                      ? "border-line bg-sunken text-ink-faint"
                      : "border-line bg-raised"
                  }`}
                >
                  {r}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-3 pb-6">
        <AnimatePresence>
          {phase !== "answering" && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className={`rounded-[var(--radius-card)] px-4 py-3 flex gap-3 items-start ${
                phase === "correct"
                  ? "bg-accent-soft text-accent"
                  : "bg-danger-soft text-danger"
              }`}
            >
              {phase === "correct" ? (
                <CheckCircleIcon size={24} weight="fill" className="shrink-0" />
              ) : (
                <XCircleIcon size={24} weight="fill" className="shrink-0" />
              )}
              <div>
                <p className="font-extrabold">
                  {phase === "correct" ? "Tepat sekali!" : "Belum tepat."}
                </p>
                {q.explanation && (
                  <p className="text-sm font-medium mt-0.5">{q.explanation}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "answering" && q.type !== "match" ? (
          <Button full disabled={!canCheck} onClick={() => check()}>
            Periksa
          </Button>
        ) : phase !== "answering" ? (
          <Button
            full
            variant={phase === "wrong" ? "danger" : "primary"}
            onClick={onNext}
          >
            Lanjut
          </Button>
        ) : null}
      </div>
    </div>
  );
}
