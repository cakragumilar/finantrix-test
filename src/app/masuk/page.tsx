"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { GoogleLogoIcon, ChartLineUpIcon } from "@phosphor-icons/react";
import { signInWithGoogle, useAuth } from "@/lib/auth";
import { Button, ErrorNote } from "@/components/ui";

export default function MasukPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/belajar");
  }, [user, loading, router]);

  async function handleLogin() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError("Gagal masuk. Coba lagi sebentar lagi.");
      setBusy(false);
    }
  }

  return (
    <main className="flex-1 min-h-[100dvh] flex flex-col justify-between px-6 py-10 mx-auto w-full max-w-md">
      <div />
      <motion.div
        className="flex flex-col items-center text-center gap-6"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        <span className="bg-accent-soft text-accent rounded-full p-5">
          <ChartLineUpIcon size={48} weight="bold" />
        </span>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Finantrix</h1>
          <p className="mt-3 text-ink-soft text-base max-w-[30ch]">
            Belajar akuntansi dan keuangan lewat latihan singkat setiap hari.
          </p>
        </div>
        <Image
          src="https://picsum.photos/seed/finantrix-belajar-akuntansi/640/360"
          alt="Suasana belajar keuangan"
          width={640}
          height={360}
          className="rounded-[var(--radius-card)] border-2 border-line w-full h-auto"
          priority
          unoptimized
        />
      </motion.div>

      <div className="flex flex-col gap-3">
        {error && <ErrorNote message={error} />}
        <Button full onClick={handleLogin} disabled={busy || loading}>
          <GoogleLogoIcon size={20} weight="bold" />
          {busy ? "Sebentar..." : "Masuk dengan Google"}
        </Button>
        <p className="text-center text-xs text-ink-faint">
          Gratis. Tanpa kartu kredit.
        </p>
      </div>
    </main>
  );
}
