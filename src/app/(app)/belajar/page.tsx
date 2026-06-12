"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { collection } from "firebase/firestore";
import { motion, useReducedMotion } from "motion/react";
import {
  BooksIcon,
  CheckIcon,
  CrownIcon,
  LockSimpleIcon,
  StarIcon,
} from "@phosphor-icons/react";
import { MODULE_ICONS } from "@/components/module-icons";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import {
  useAllLessons,
  useAllTopics,
  useAppConfig,
  useCol,
  useModules,
} from "@/lib/db";
import { effectiveHearts } from "@/lib/game";
import { ensureLeagueMembership } from "@/lib/league";
import type { LessonProgressDoc } from "@/lib/types";
import { Card, Skeleton, StatPills, EmptyState } from "@/components/ui";

export default function BelajarPage() {
  const { user, profile } = useAuth();
  const cfg = useAppConfig();
  const reduce = useReducedMotion();
  const modules = useModules();
  const topics = useAllTopics();
  const lessons = useAllLessons();

  const progressQuery = useMemo(
    () => (user ? collection(db(), "users", user.uid, "lessonProgress") : null),
    [user]
  );
  const progress = useCol<LessonProgressDoc>(progressQuery);

  // Joining a league is idempotent; do it once content is on screen
  useEffect(() => {
    if (user && profile) void ensureLeagueMembership(user.uid, profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, profile?.league.leagueId]);

  if (!profile) return null;
  const { hearts } = effectiveHearts(profile, cfg);

  const completed = new Set(progress.data?.map((p) => p.id) ?? []);

  const loading = !modules.data || !topics.data || !lessons.data;

  return (
    <div className="flex-1 px-4 pt-4 flex flex-col gap-6">
      <header className="flex items-center justify-between sticky top-0 bg-surface z-20 py-2">
        <p className="font-extrabold text-lg tracking-tight">Finantrix</p>
        <StatPills
          hearts={hearts}
          vip={profile.vip.active}
          streak={profile.streak.current}
          gems={profile.gems}
        />
      </header>

      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-16 w-16 rounded-full ml-12" />
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        </div>
      ) : modules.data!.length === 0 ? (
        <EmptyState
          icon={<BooksIcon size={48} weight="bold" />}
          title="Materi sedang disiapkan"
          body="Modul pertama akan segera hadir. Cek lagi nanti ya."
        />
      ) : (
        modules.data!.map((mod) => {
          const ModIcon = MODULE_ICONS[mod.icon] ?? BooksIcon;
          const modTopics = topics.data!.filter((t) => t.moduleId === mod.id);
          const lockedVip = mod.vipOnly && !profile.vip.active;
          return (
            <section key={mod.id} className="flex flex-col gap-4">
              <Card className="flex items-center gap-4 bg-accent-soft border-accent/30">
                <span className="text-accent shrink-0">
                  <ModIcon size={36} weight="fill" />
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-extrabold leading-tight">{mod.title}</h2>
                  <p className="text-xs text-ink-soft font-medium mt-0.5">
                    {mod.description}
                  </p>
                </div>
                {lockedVip && (
                  <span className="text-streak shrink-0" title="Khusus VIP">
                    <CrownIcon size={24} weight="fill" />
                  </span>
                )}
              </Card>

              {modTopics.map((topic) => {
                const topicLessons = lessons.data!.filter(
                  (l) => l.topicId === topic.id
                );
                let unlocked = true;
                return (
                  <div key={topic.id} className="flex flex-col gap-3">
                    <p className="text-sm font-bold text-ink-soft px-1">
                      {topic.title}
                    </p>
                    <div className="flex flex-col gap-3">
                      {topicLessons.map((lesson, i) => {
                        const done = completed.has(lesson.id);
                        const isUnlocked = (unlocked || done) && !lockedVip;
                        if (!done) unlocked = false;
                        const offset =
                          i % 4 === 1 ? "ml-14" : i % 4 === 3 ? "mr-14" : "";
                        const node = (
                          <motion.div
                            whileTap={
                              isUnlocked && !reduce ? { scale: 0.92 } : undefined
                            }
                            className={`mx-auto ${offset} flex flex-col items-center gap-1`}
                          >
                            <span
                              className={`flex items-center justify-center h-16 w-16 rounded-full border-b-4 ${
                                done
                                  ? "bg-streak text-on-accent border-streak-strong"
                                  : isUnlocked
                                    ? "bg-accent text-on-accent border-accent-strong"
                                    : "bg-sunken text-ink-faint border-line"
                              }`}
                            >
                              {done ? (
                                <CheckIcon size={28} weight="bold" />
                              ) : isUnlocked ? (
                                <StarIcon size={28} weight="fill" />
                              ) : (
                                <LockSimpleIcon size={24} weight="fill" />
                              )}
                            </span>
                            <span className="text-xs font-bold text-ink-soft max-w-[12ch] text-center leading-tight">
                              {lesson.title}
                            </span>
                          </motion.div>
                        );
                        return isUnlocked ? (
                          <Link
                            key={lesson.id}
                            href={`/belajar/pelajaran/${lesson.id}`}
                          >
                            {node}
                          </Link>
                        ) : (
                          <div key={lesson.id} aria-disabled>
                            {node}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })
      )}
    </div>
  );
}
