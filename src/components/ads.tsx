"use client";

/*
  Google AdSense integration.
  - <AdBanner/>: display slot between lessons, hidden for VIP or when keys absent.
  - <RewardedAd/>: heart-refill flow. Real rewarded inventory needs an
    approved AdSense for Games / Ad Manager account; until keys exist this
    runs a timed placeholder so the product loop is testable end to end.
*/

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { motion } from "motion/react";
import { PlayCircleIcon } from "@phosphor-icons/react";
import { Button, Sheet } from "@/components/ui";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER;

export function AdScript() {
  if (!CLIENT) return null;
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}

export function AdBanner({ vip }: { vip: boolean }) {
  const ref = useRef<HTMLModElement>(null);
  useEffect(() => {
    if (!CLIENT || !SLOT || vip) return;
    try {
      ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ||= []).push({});
    } catch {
      // ad blockers are fine
    }
  }, [vip]);

  if (!CLIENT || !SLOT || vip) return null;
  return (
    <>
      <AdScript />
      <ins
        ref={ref}
        className="adsbygoogle block w-full min-h-[100px] rounded-[var(--radius-card)] bg-sunken"
        data-ad-client={CLIENT}
        data-ad-slot={SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </>
  );
}

export function RewardedAd({
  open,
  onClose,
  onReward,
}: {
  open: boolean;
  onClose: () => void;
  onReward: () => Promise<void> | void;
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      {open && <RewardedAdBody onClose={onClose} onReward={onReward} />}
    </Sheet>
  );
}

function RewardedAdBody({
  onClose,
  onReward,
}: {
  onClose: () => void;
  onReward: () => Promise<void> | void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
        <motion.span
          className="text-accent"
          animate={secondsLeft > 0 ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ repeat: secondsLeft > 0 ? Infinity : 0, duration: 1.2 }}
        >
          <PlayCircleIcon size={56} weight="fill" />
        </motion.span>
        <p className="font-extrabold text-lg">Tonton iklan, dapat 1 hati</p>
        <p className="text-sm text-ink-soft">
          {secondsLeft > 0
            ? `Iklan sedang diputar (${secondsLeft})`
            : "Selesai! Klaim hadiahmu."}
        </p>
        <Button
          full
          disabled={secondsLeft > 0 || granting}
          onClick={async () => {
            setGranting(true);
            await onReward();
            setGranting(false);
            onClose();
          }}
        >
          Klaim 1 hati
        </Button>
    </div>
  );
}
