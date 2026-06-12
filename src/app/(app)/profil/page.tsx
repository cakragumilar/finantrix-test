"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { collection, doc, updateDoc } from "firebase/firestore";
import {
  BellIcon,
  CrownIcon,
  FlameIcon,
  LightningIcon,
  MedalIcon,
  MoonIcon,
  SealCheckIcon,
  SignOutIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  SunIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import { db } from "@/lib/firebase";
import { signOut, useAuth } from "@/lib/auth";
import { useCol } from "@/lib/db";
import { LEAGUE_LABELS } from "@/lib/constants";
import type { ActivityDoc } from "@/lib/types";
import { Button, Card } from "@/components/ui";

const WEEKS = 16;

// Date grid anchored at module load; pure during render
const HEATMAP_DATES: string[] = (() => {
  if (typeof window === "undefined") return [];
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" });
  const now = Date.now();
  const out: string[] = [];
  for (let i = WEEKS * 7 - 1; i >= 0; i--) {
    out.push(fmt.format(new Date(now - i * 86400000)));
  }
  return out;
})();

function badgeLabel(id: string): string {
  if (id.startsWith("streak-")) return `Runtutan ${id.slice(7)} hari`;
  if (id === "perfeksionis") return "Perfeksionis";
  if (id.startsWith("league-")) return `Liga ${id.slice(7)}`;
  return id;
}

export default function ProfilPage() {
  const { user, profile } = useAuth();
  const [theme, setTheme] = useState<string>(() =>
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme") ?? "light"
      : "light"
  );

  const activityQuery = useMemo(
    () => (user ? collection(db(), "users", user.uid, "activity") : null),
    [user]
  );
  const activity = useCol<ActivityDoc>(activityQuery);

  const heatmap = useMemo(() => {
    const byDate = new Map(
      (activity.data ?? []).map((a) => [a.id, a.lessonsCompleted])
    );
    return HEATMAP_DATES.map((date) => ({
      date,
      count: byDate.get(date) ?? 0,
    }));
  }, [activity.data]);

  if (!user || !profile) return null;

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("fx-theme", next);
    setTheme(next);
  }

  async function toggleSound() {
    await updateDoc(doc(db(), "users", user!.uid), {
      soundOn: !profile!.soundOn,
    });
  }

  async function setReminder(value: string) {
    await updateDoc(doc(db(), "users", user!.uid), {
      reminderTime: value || null,
    });
    if (value && "Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }

  return (
    <div className="flex-1 px-4 pt-6 flex flex-col gap-5 pb-6">
      <header className="flex items-center gap-4">
        {profile.photoURL ? (
          <Image
            src={profile.photoURL}
            alt="Foto profil"
            width={64}
            height={64}
            className="rounded-full border-2 border-line"
            unoptimized
          />
        ) : (
          <span className="h-16 w-16 rounded-full bg-sunken" />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight truncate flex items-center gap-2">
            {profile.displayName}
            {profile.vip.active && (
              <CrownIcon size={20} weight="fill" className="text-streak shrink-0" />
            )}
          </h1>
          <p className="text-sm text-ink-soft truncate">{profile.email}</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="num text-xl font-bold text-accent flex items-center justify-center gap-1">
            <LightningIcon size={18} weight="fill" />
            {profile.xpTotal}
          </p>
          <p className="text-xs font-bold text-ink-soft mt-1">Total XP</p>
        </Card>
        <Card className="text-center">
          <p className="num text-xl font-bold text-streak flex items-center justify-center gap-1">
            <FlameIcon size={18} weight="fill" />
            {profile.streak.current}
          </p>
          <p className="text-xs font-bold text-ink-soft mt-1">Runtutan</p>
        </Card>
        <Card className="text-center">
          <p className="text-xl font-bold text-gem flex items-center justify-center gap-1">
            <TrophyIcon size={18} weight="fill" />
          </p>
          <p className="text-xs font-bold text-ink-soft mt-1">
            {LEAGUE_LABELS[profile.league.tier]}
          </p>
        </Card>
      </div>

      <Card>
        <p className="font-bold text-sm mb-3">Aktivitas belajar</p>
        <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
          {heatmap.map((d) => (
            <span
              key={d.date}
              title={`${d.date}: ${d.count} pelajaran`}
              className={`h-3.5 w-3.5 rounded-[3px] ${
                d.count === 0
                  ? "bg-sunken"
                  : d.count === 1
                    ? "bg-accent/40"
                    : d.count <= 3
                      ? "bg-accent/70"
                      : "bg-accent"
              }`}
            />
          ))}
        </div>
      </Card>

      <Card>
        <p className="font-bold text-sm mb-3">Lencana</p>
        {profile.badges.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Belum ada lencana. Selesaikan pelajaran tiap hari untuk meraihnya.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((b) => (
              <span
                key={b}
                className="flex items-center gap-1.5 rounded-full bg-streak-soft text-streak-strong text-xs font-bold px-3 py-1.5"
              >
                {b === "perfeksionis" ? (
                  <SealCheckIcon size={14} weight="fill" />
                ) : (
                  <MedalIcon size={14} weight="fill" />
                )}
                {badgeLabel(b)}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="font-bold text-sm">Pengaturan</p>

        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <BellIcon size={20} weight="bold" className="text-ink-soft" />
            Pengingat harian (WIB)
          </span>
          <input
            type="time"
            defaultValue={profile.reminderTime ?? ""}
            onChange={(e) => setReminder(e.target.value)}
            className="rounded-[var(--radius-input)] border-2 border-line bg-raised px-3 py-1.5 num text-sm focus:border-accent focus:outline-none"
          />
        </div>

        <button
          onClick={toggleSound}
          className="flex items-center justify-between gap-3 text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            {profile.soundOn ? (
              <SpeakerHighIcon size={20} weight="bold" className="text-ink-soft" />
            ) : (
              <SpeakerSlashIcon size={20} weight="bold" className="text-ink-soft" />
            )}
            Efek suara
          </span>
          <span className={profile.soundOn ? "text-accent" : "text-ink-faint"}>
            {profile.soundOn ? "Aktif" : "Mati"}
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="flex items-center justify-between gap-3 text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? (
              <MoonIcon size={20} weight="bold" className="text-ink-soft" />
            ) : (
              <SunIcon size={20} weight="bold" className="text-ink-soft" />
            )}
            Tema
          </span>
          <span className="text-ink-soft">
            {theme === "dark" ? "Gelap" : "Terang"}
          </span>
        </button>
      </Card>

      <Button variant="ghost" full onClick={() => signOut()}>
        <SignOutIcon size={18} weight="bold" />
        Keluar akun
      </Button>
    </div>
  );
}
