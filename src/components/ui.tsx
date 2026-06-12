"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { HeartIcon, FlameIcon, DiamondIcon } from "@phosphor-icons/react";
import { sfx } from "@/lib/sound";

/* ---------- Button: pressable 3px edge, full-pill shape ---------- */

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent shadow-[0_3px_0_var(--accent-strong)] active:shadow-none",
  secondary:
    "bg-raised text-ink border-2 border-line shadow-[0_3px_0_var(--line)] active:shadow-none",
  danger:
    "bg-danger text-on-accent shadow-[0_3px_0_var(--danger-strong)] active:shadow-none",
  ghost: "bg-transparent text-ink-soft active:bg-sunken",
};

export function Button({
  variant = "primary",
  full,
  className = "",
  onClick,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  full?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        sfx.click();
        onClick?.(e);
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold uppercase tracking-wide text-sm transition-transform active:translate-y-[3px] disabled:opacity-40 disabled:pointer-events-none ${variantClass[variant]} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Card ---------- */

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`bg-raised border-2 border-line rounded-[var(--radius-card)] p-4 ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Progress bar ---------- */

export function ProgressBar({
  value,
  color = "var(--accent)",
}: {
  value: number; // 0..1
  color?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="h-4 w-full rounded-full bg-sunken overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={false}
        animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        transition={
          reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 24 }
        }
      />
    </div>
  );
}

/* ---------- Stat pills (hearts / streak / gems) ---------- */

export function StatPills({
  hearts,
  vip,
  streak,
  gems,
}: {
  hearts: number;
  vip: boolean;
  streak: number;
  gems: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5 text-danger font-bold">
        <HeartIcon weight="fill" size={20} />
        <span className="num text-sm">{vip ? "∞" : hearts}</span>
      </span>
      <span className="flex items-center gap-1.5 text-streak font-bold">
        <FlameIcon weight="fill" size={20} />
        <span className="num text-sm">{streak}</span>
      </span>
      <span className="flex items-center gap-1.5 text-gem font-bold">
        <DiamondIcon weight="fill" size={20} />
        <span className="num text-sm">{gems}</span>
      </span>
    </div>
  );
}

/* ---------- Skeleton / Empty / Error ---------- */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-[var(--radius-card)] bg-sunken ${className}`} />
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-6">
      <div className="text-ink-faint">{icon}</div>
      <p className="font-bold text-lg">{title}</p>
      <p className="text-ink-soft text-sm max-w-[28ch]">{body}</p>
      {action}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="bg-danger-soft text-danger rounded-[var(--radius-card)] px-4 py-3 text-sm font-semibold">
      {message}
    </div>
  );
}

/* ---------- Bottom sheet ---------- */

export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Tutup"
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            className="fixed bottom-0 inset-x-0 z-50 mx-auto max-w-md bg-raised rounded-t-[var(--radius-card)] border-t-2 border-x-2 border-line p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
