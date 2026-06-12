"use client";

import { useState } from "react";
import {
  CrownIcon,
  DiamondIcon,
  HeartIcon,
  SnowflakeIcon,
  PlayCircleIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth";
import { useAppConfig } from "@/lib/db";
import { addHearts, buyWithGems, effectiveHearts } from "@/lib/game";
import { checkout, paymentsConfigured } from "@/lib/payments";
import {
  GEM_PACKS,
  VIP_PRICE_MONTHLY_IDR,
  VIP_PRICE_YEARLY_IDR,
} from "@/lib/constants";
import { Button, Card, ErrorNote, StatPills } from "@/components/ui";
import { RewardedAd, AdBanner } from "@/components/ads";

const idr = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

const VIP_PERKS = [
  "Hati tak terbatas",
  "Bebas iklan",
  "Lencana liga eksklusif",
  "Akses awal modul baru",
];

export default function TokoPage() {
  const { user, profile } = useAuth();
  const cfg = useAppConfig();
  const [adOpen, setAdOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user || !profile) return null;
  const { hearts } = effectiveHearts(profile, cfg);
  const vip = profile.vip.active;

  async function pay(item: Parameters<typeof checkout>[0]) {
    setNote(null);
    if (!paymentsConfigured()) {
      setNote(
        "Pembayaran belum aktif di lingkungan ini. Hubungi tim Finantrix."
      );
      return;
    }
    setBusy(true);
    try {
      const r = await checkout(item);
      if (r === "pending")
        setNote("Pembayaran diproses. Status VIP/permata menyusul otomatis.");
    } catch {
      setNote("Pembayaran gagal dibuka. Coba lagi nanti.");
    } finally {
      setBusy(false);
    }
  }

  async function spendGems(kind: "hearts" | "streak_freeze") {
    setNote(null);
    try {
      await buyWithGems(user!.uid, profile!, cfg, kind);
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Gagal menukar permata.");
    }
  }

  return (
    <div className="flex-1 px-4 pt-6 flex flex-col gap-5 pb-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Toko</h1>
        <StatPills
          hearts={hearts}
          vip={vip}
          streak={profile.streak.current}
          gems={profile.gems}
        />
      </header>

      {note && <ErrorNote message={note} />}

      {/* VIP */}
      <Card className="border-streak/50 bg-streak-soft">
        <div className="flex items-center gap-3 mb-3">
          <CrownIcon size={32} weight="fill" className="text-streak shrink-0" />
          <div>
            <p className="font-extrabold text-lg leading-tight">
              Finantrix VIP
            </p>
            {vip && (
              <p className="text-xs font-bold text-streak">
                Aktif ({profile.vip.plan === "yearly" ? "tahunan" : "bulanan"})
              </p>
            )}
          </div>
        </div>
        <ul className="flex flex-col gap-1.5 mb-4">
          {VIP_PERKS.map((p) => (
            <li key={p} className="flex items-center gap-2 text-sm font-semibold">
              <CheckIcon size={16} weight="bold" className="text-streak shrink-0" />
              {p}
            </li>
          ))}
        </ul>
        {!vip && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => pay({ kind: "vip", plan: "monthly" })}
            >
              <span className="num normal-case">{idr(VIP_PRICE_MONTHLY_IDR)}</span>
              /bln
            </Button>
            <Button
              disabled={busy}
              onClick={() => pay({ kind: "vip", plan: "yearly" })}
            >
              <span className="num normal-case">{idr(VIP_PRICE_YEARLY_IDR)}</span>
              /thn
            </Button>
          </div>
        )}
      </Card>

      {/* Hearts */}
      <section className="flex flex-col gap-3">
        <h2 className="font-extrabold">Hati</h2>
        <Card className="flex items-center gap-3">
          <PlayCircleIcon size={28} weight="fill" className="text-accent shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm">Tonton iklan</p>
            <p className="text-xs text-ink-soft">
              +{cfg.heartsPerRewardedAd} hati gratis
            </p>
          </div>
          <Button
            variant="secondary"
            className="px-4 py-2"
            disabled={vip || hearts >= profile.hearts.max}
            onClick={() => setAdOpen(true)}
          >
            Tonton
          </Button>
        </Card>
        <Card className="flex items-center gap-3">
          <HeartIcon size={28} weight="fill" className="text-danger shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm">Isi 1 hati</p>
            <p className="text-xs text-ink-soft num">
              {cfg.gemPricePerHeart} permata
            </p>
          </div>
          <Button
            variant="secondary"
            className="px-4 py-2"
            disabled={vip || hearts >= profile.hearts.max || profile.gems < cfg.gemPricePerHeart}
            onClick={() => spendGems("hearts")}
          >
            Tukar
          </Button>
        </Card>
        <Card className="flex items-center gap-3">
          <SnowflakeIcon size={28} weight="fill" className="text-gem shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm">Pembeku runtutan</p>
            <p className="text-xs text-ink-soft">
              <span className="num">{cfg.gemPriceStreakFreeze}</span> permata.
              Punya: <span className="num">{profile.streak.freezes}</span>
            </p>
          </div>
          <Button
            variant="secondary"
            className="px-4 py-2"
            disabled={profile.gems < cfg.gemPriceStreakFreeze}
            onClick={() => spendGems("streak_freeze")}
          >
            Tukar
          </Button>
        </Card>
      </section>

      {/* Gems */}
      <section className="flex flex-col gap-3">
        <h2 className="font-extrabold">Permata</h2>
        <div className="grid grid-cols-3 gap-3">
          {GEM_PACKS.map((pack) => (
            <Card key={pack.gems} className="text-center flex flex-col gap-2 items-center">
              <DiamondIcon size={28} weight="fill" className="text-gem" />
              <p className="num font-bold">{pack.gems}</p>
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-xs w-full"
                disabled={busy}
                onClick={() =>
                  pay({ kind: "gems", gems: pack.gems, priceIDR: pack.priceIDR })
                }
              >
                <span className="num normal-case">{idr(pack.priceIDR)}</span>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <AdBanner vip={vip} />

      <RewardedAd
        open={adOpen}
        onClose={() => setAdOpen(false)}
        onReward={() => addHearts(user.uid, profile, cfg, cfg.heartsPerRewardedAd)}
      />
    </div>
  );
}
