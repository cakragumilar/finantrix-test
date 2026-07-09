"use client";

import { TrophyIcon } from "@phosphor-icons/react";
import { Card } from "@/components/ui";

const players = [
  { rank: 1, name: "Sinta W.", xp: 1240, tone: "streak" as const },
  { rank: 2, name: "Bagus P.", xp: 1180, tone: "ink" as const },
  { rank: 3, name: "Rendra A.", xp: 1050, tone: "danger" as const },
  { rank: 4, name: "Kamu", xp: 940, tone: "accent" as const, isYou: true },
  { rank: 5, name: "Wulan D.", xp: 860, tone: "ink" as const },
];

const toneClass: Record<string, string> = {
  streak: "bg-streak text-on-accent",
  danger: "bg-danger-strong text-on-accent",
  ink: "bg-sunken text-ink-soft",
  accent: "bg-accent text-on-accent",
};

export function LeagueMockup() {
  return (
    <Card className="w-full max-w-[380px]">
      <div className="flex items-center gap-2 border-b-2 border-line pb-3">
        <TrophyIcon size={22} weight="fill" className="text-streak" />
        <p className="font-bold">Liga Emerald, Minggu ini</p>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {players.map((p) => (
          <div
            key={p.rank}
            className={`flex items-center gap-3 rounded-[var(--radius-input)] px-3 py-2.5 ${
              p.isYou ? "bg-accent-soft" : ""
            }`}
          >
            <span
              className={`num flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${toneClass[p.tone]}`}
            >
              {p.rank}
            </span>
            <span
              className={`text-sm ${p.isYou ? "font-bold text-accent" : "font-semibold text-ink"}`}
            >
              {p.name}
            </span>
            <span className="num ml-auto text-sm font-bold text-ink-soft">
              {p.xp} XP
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
