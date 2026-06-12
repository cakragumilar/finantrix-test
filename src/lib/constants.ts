import type { LeagueTier } from "./types";

export const XP_PER_CORRECT = 10;
export const MAX_HEARTS = 5;
export const DEFAULT_HEART_REGEN_MINUTES = 30;
export const DEFAULT_DRILL_TIMER_SEC = 20;

export const GEM_PRICE_PER_HEART = 30;
export const GEM_PRICE_STREAK_FREEZE = 100;
export const GEMS_PER_LESSON_PERFECT = 5;

export const LEAGUE_TIERS: LeagueTier[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
];

export const LEAGUE_LABELS: Record<LeagueTier, string> = {
  bronze: "Perunggu",
  silver: "Perak",
  gold: "Emas",
  platinum: "Platinum",
  diamond: "Berlian",
};

export const LEAGUE_CAPACITY = 30;
export const LEAGUE_PROMOTE_N = 5;
export const LEAGUE_DEMOTE_N = 5;

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];

export const VIP_PRICE_MONTHLY_IDR = 49_000;
export const VIP_PRICE_YEARLY_IDR = 399_000;

export const GEM_PACKS = [
  { gems: 200, priceIDR: 15_000 },
  { gems: 550, priceIDR: 35_000 },
  { gems: 1200, priceIDR: 69_000 },
] as const;

/** Remote Lottie celebration animations (LottieFiles CDN). Swappable in config later. */
export const LOTTIE = {
  streakFire: "https://assets-v2.lottiefiles.com/a/61b4bc16-1178-11ee-b5fc-d3d3d3ff8aa2/p2qBoDqdaR.lottie",
  levelUp: "https://assets-v2.lottiefiles.com/a/30877dee-1162-11ee-91e6-b39286b34dd5/aFJduWaJEN.lottie",
  leagueUp: "https://assets-v2.lottiefiles.com/a/dd96c662-117d-11ee-b6dd-4f1ad37f80f9/8eDLEjJsNn.lottie",
} as const;
