/** All streak/league date math happens in WIB (Asia/Jakarta, UTC+7). */

const WIB = "Asia/Jakarta";

const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: WIB,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** YYYY-MM-DD in WIB */
export function wibToday(d: Date = new Date()): string {
  return fmt.format(d);
}

export function wibYesterday(): string {
  return fmt.format(new Date(Date.now() - 24 * 60 * 60 * 1000));
}

/** Monday of the current WIB week, as YYYY-MM-DD (league week key) */
export function wibWeekStart(d: Date = new Date()): string {
  // Shift to WIB wall-clock, then walk back to Monday
  const wib = new Date(d.getTime() + 7 * 3600 * 1000);
  const dow = wib.getUTCDay(); // 0=Sun
  const back = (dow + 6) % 7;
  const monday = new Date(wib.getTime() - back * 24 * 3600 * 1000);
  return monday.toISOString().slice(0, 10);
}

/** Millis until next Monday 00:00 WIB (league countdown) */
export function msUntilWeekEnd(now: Date = new Date()): number {
  const wib = new Date(now.getTime() + 7 * 3600 * 1000);
  const dow = wib.getUTCDay();
  const daysLeft = dow === 0 ? 1 : 8 - dow;
  const nextMondayWib = Date.UTC(
    wib.getUTCFullYear(),
    wib.getUTCMonth(),
    wib.getUTCDate() + daysLeft
  );
  return nextMondayWib - 7 * 3600 * 1000 - now.getTime();
}

export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}h ${h}j`;
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m ${s % 60}d`;
}
