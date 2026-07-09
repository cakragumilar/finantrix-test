"use client";

import { motion, useReducedMotion } from "motion/react";
import { CheckIcon, LockSimpleIcon, StarIcon } from "@phosphor-icons/react";
import { StatPills, ProgressBar } from "@/components/ui";

const nodes = [
  { label: "Debit & Kredit", state: "done" as const },
  { label: "Neraca Saldo", state: "done" as const },
  { label: "Laporan Laba Rugi", state: "current" as const },
  { label: "Pajak Dasar", state: "locked" as const },
];

export function HeroMockup() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="relative mx-auto w-full max-w-[300px] lg:mx-0"
      initial={reduce ? false : { opacity: 0, scale: 0.94, rotate: 0 }}
      animate={{ opacity: 1, scale: 1, rotate: reduce ? 0 : -2 }}
      transition={{ type: "spring", stiffness: 110, damping: 16 }}
    >
      <div className="rounded-[28px] border-2 border-line bg-raised p-3 shadow-[0_18px_0_-6px_var(--line)]">
        <div className="flex flex-col gap-5 rounded-[20px] bg-surface p-4">
          <div className="flex items-center justify-between">
            <StatPills hearts={5} vip={false} streak={12} gems={340} />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-ink-soft">
              <span>Level 4</span>
              <span className="num">65%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={0.65} />
            </div>
          </div>

          <div className="relative flex flex-col gap-4 pl-[2px]">
            <span
              className="absolute left-[17px] top-4 bottom-4 w-px bg-line"
              aria-hidden
            />
            {nodes.map((node) => (
              <div key={node.label} className="relative flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                    node.state === "done"
                      ? "border-accent bg-accent text-on-accent"
                      : node.state === "current"
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line bg-sunken text-ink-faint"
                  }`}
                >
                  {node.state === "done" && <CheckIcon size={16} weight="bold" />}
                  {node.state === "current" && <StarIcon size={16} weight="fill" />}
                  {node.state === "locked" && <LockSimpleIcon size={14} weight="bold" />}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    node.state === "locked" ? "text-ink-faint" : "text-ink"
                  }`}
                >
                  {node.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
