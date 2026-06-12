"use client";

import Link from "next/link";
import { CaretRightIcon, TargetIcon } from "@phosphor-icons/react";
import { useAllTopics, useModules } from "@/lib/db";
import { Card, EmptyState, Skeleton } from "@/components/ui";
import { MODULE_ICONS } from "@/components/module-icons";
import { BooksIcon } from "@phosphor-icons/react";

export default function LatihanPage() {
  const modules = useModules();
  const topics = useAllTopics();
  const loading = !modules.data || !topics.data;

  return (
    <div className="flex-1 px-4 pt-6 flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Latihan</h1>
        <p className="text-sm text-ink-soft mt-1">
          Soal cepat tanpa hati dan tanpa XP. Murni buat mengasah.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : topics.data!.length === 0 ? (
        <EmptyState
          icon={<TargetIcon size={48} weight="bold" />}
          title="Belum ada topik"
          body="Topik latihan akan muncul begitu materi dipublikasikan."
        />
      ) : (
        modules.data!.map((mod) => {
          const ModIcon = MODULE_ICONS[mod.icon] ?? BooksIcon;
          const modTopics = topics.data!.filter((t) => t.moduleId === mod.id);
          if (modTopics.length === 0) return null;
          return (
            <section key={mod.id} className="flex flex-col gap-3">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-soft px-1">
                <ModIcon size={18} weight="fill" className="text-accent" />
                {mod.title}
              </p>
              {modTopics.map((t) => (
                <Link key={t.id} href={`/latihan/${t.id}`}>
                  <Card className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{t.title}</p>
                      <p className="text-xs text-ink-soft mt-0.5">
                        <span className="num">{t.drillTimerSec}</span> detik per
                        soal
                      </p>
                    </div>
                    <CaretRightIcon
                      size={20}
                      weight="bold"
                      className="text-ink-faint shrink-0"
                    />
                  </Card>
                </Link>
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}
