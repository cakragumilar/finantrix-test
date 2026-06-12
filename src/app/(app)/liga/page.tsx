"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { collection, orderBy, query } from "firebase/firestore";
import { motion, useReducedMotion } from "motion/react";
import {
  TrophyIcon,
  CaretUpIcon,
  CaretDownIcon,
  MedalIcon,
} from "@phosphor-icons/react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { useAppConfig, useCol } from "@/lib/db";
import { LEAGUE_LABELS, LEAGUE_TIERS } from "@/lib/constants";
import { formatDuration, msUntilWeekEnd } from "@/lib/dates";
import type { LeagueMemberDoc } from "@/lib/types";
import { Card, EmptyState, Skeleton } from "@/components/ui";

const TIER_COLOR: Record<string, string> = {
  bronze: "text-streak-strong",
  silver: "text-ink-faint",
  gold: "text-streak",
  platinum: "text-gem",
  diamond: "text-accent",
};

export default function LigaPage() {
  const { user, profile } = useAuth();
  const cfg = useAppConfig();
  const reduce = useReducedMotion();
  const [countdown, setCountdown] = useState("");

  const leagueId = profile?.league.leagueId ?? null;
  const membersQuery = useMemo(
    () =>
      leagueId
        ? query(
            collection(db(), "leagues", leagueId, "members"),
            orderBy("weeklyXp", "desc")
          )
        : null,
    [leagueId]
  );
  const members = useCol<LeagueMemberDoc>(membersQuery);

  useEffect(() => {
    const tick = () => setCountdown(formatDuration(msUntilWeekEnd()));
    const t = setInterval(tick, 60_000);
    tick();
    return () => clearInterval(t);
  }, []);

  if (!profile) return null;
  const tier = profile.league.tier;

  return (
    <div className="flex-1 px-4 pt-6 flex flex-col gap-5">
      <header className="text-center flex flex-col items-center gap-2">
        <span className={TIER_COLOR[tier]}>
          <TrophyIcon size={56} weight="fill" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Liga {LEAGUE_LABELS[tier]}
        </h1>
        <p className="text-sm text-ink-soft">
          Sisa waktu minggu ini: <span className="num">{countdown}</span>
        </p>
      </header>

      <div className="flex justify-center gap-3">
        {LEAGUE_TIERS.map((t) => (
          <span
            key={t}
            className={`${
              LEAGUE_TIERS.indexOf(t) <= LEAGUE_TIERS.indexOf(tier)
                ? TIER_COLOR[t]
                : "text-ink-faint opacity-40"
            }`}
            title={LEAGUE_LABELS[t]}
          >
            <MedalIcon size={28} weight="fill" />
          </span>
        ))}
      </div>

      <Card className="flex items-center justify-between text-sm font-bold">
        <span className="flex items-center gap-1.5 text-accent">
          <CaretUpIcon size={16} weight="bold" />
          {cfg.leaguePromoteN} teratas naik
        </span>
        <span className="flex items-center gap-1.5 text-danger">
          <CaretDownIcon size={16} weight="bold" />
          {cfg.leagueDemoteN} terbawah turun
        </span>
      </Card>

      {!leagueId || members.loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : !members.data || members.data.length === 0 ? (
        <EmptyState
          icon={<TrophyIcon size={48} weight="bold" />}
          title="Liga baru dimulai"
          body="Selesaikan satu pelajaran untuk masuk papan peringkat minggu ini."
        />
      ) : (
        <ol className="flex flex-col gap-2 pb-6">
          {members.data.map((m, i) => {
            const me = m.id === user?.uid;
            const inPromo = i < cfg.leaguePromoteN;
            const inDemo = i >= members.data!.length - cfg.leagueDemoteN;
            return (
              <motion.li
                key={m.id}
                layout={!reduce}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`flex items-center gap-3 rounded-[var(--radius-card)] border-2 px-3 py-2.5 ${
                  me
                    ? "border-accent bg-accent-soft"
                    : "border-line bg-raised"
                }`}
              >
                <span
                  className={`num w-6 text-center font-bold text-sm ${
                    inPromo
                      ? "text-accent"
                      : inDemo && members.data!.length > cfg.leaguePromoteN + cfg.leagueDemoteN
                        ? "text-danger"
                        : "text-ink-faint"
                  }`}
                >
                  {i + 1}
                </span>
                {m.photoURL ? (
                  <Image
                    src={m.photoURL}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-full"
                    unoptimized
                  />
                ) : (
                  <span className="h-9 w-9 rounded-full bg-sunken" />
                )}
                <span className="flex-1 font-bold text-sm truncate">
                  {m.displayName}
                  {me && <span className="text-accent"> (kamu)</span>}
                </span>
                <span className="num text-sm font-bold text-ink-soft">
                  {m.weeklyXp} XP
                </span>
              </motion.li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
