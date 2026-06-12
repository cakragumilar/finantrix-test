"use client";

/* Admin dashboard: question difficulty, attempts per topic. */

import { useMemo } from "react";
import { collection, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCol } from "@/lib/db";
import { useAdminAllTopics } from "@/lib/admin-db";
import type { QuestionDoc } from "@/lib/types";
import { Card, Skeleton } from "@/components/ui";

export default function AdminDashboard() {
  const topics = useAdminAllTopics();
  const questionsQuery = useMemo(
    () => query(collection(db(), "questions"), orderBy("stats.attempts", "desc"), limit(200)),
    []
  );
  const questions = useCol<QuestionDoc>(questionsQuery);

  const topicNames = useMemo(
    () => new Map((topics.data ?? []).map((t) => [t.id, t.title])),
    [topics.data]
  );

  const rows = useMemo(() => {
    return (questions.data ?? [])
      .filter((q) => q.stats.attempts > 0)
      .map((q) => ({
        id: q.id,
        prompt: q.prompt,
        topic: topicNames.get(q.topicId) ?? q.topicId,
        attempts: q.stats.attempts,
        wrongPct: Math.round((q.stats.wrong / q.stats.attempts) * 100),
      }))
      .sort((a, b) => b.wrongPct - a.wrongPct)
      .slice(0, 20);
  }, [questions.data, topicNames]);

  const byTopic = useMemo(() => {
    const m = new Map<string, number>();
    (questions.data ?? []).forEach((q) =>
      m.set(q.topicId, (m.get(q.topicId) ?? 0) + q.stats.attempts)
    );
    return [...m.entries()]
      .map(([topicId, attempts]) => ({
        topic: topicNames.get(topicId) ?? topicId,
        attempts,
      }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 10);
  }, [questions.data, topicNames]);

  if (questions.loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>

      <section className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold mb-4">Hardest questions (% wrong)</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-ink-soft">
              No answer data yet. Stats appear once students start answering.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-soft">
                  <th className="pb-2 font-bold">Question</th>
                  <th className="pb-2 font-bold">Topic</th>
                  <th className="pb-2 font-bold text-right">Attempts</th>
                  <th className="pb-2 font-bold text-right">Wrong</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="py-2 pr-3 max-w-[28ch] truncate">{r.prompt}</td>
                    <td className="py-2 pr-3 text-ink-soft">{r.topic}</td>
                    <td className="py-2 num text-right">{r.attempts}</td>
                    <td
                      className={`py-2 num text-right font-bold ${
                        r.wrongPct >= 60 ? "text-danger" : "text-ink"
                      }`}
                    >
                      {r.wrongPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <h2 className="font-bold mb-4">Most-attempted topics</h2>
          {byTopic.length === 0 ? (
            <p className="text-sm text-ink-soft">No attempts recorded yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {byTopic.map((t) => (
                <li key={t.topic} className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{t.topic}</span>
                  <span className="num text-ink-soft">{t.attempts}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <Card>
        <h2 className="font-bold mb-2">Daily active users</h2>
        <p className="text-sm text-ink-soft">
          DAU requires an aggregate job (per-user activity docs cannot be
          scanned client-side at scale). The `aggregateDailyActives` scheduled
          function in `functions/` writes a daily rollup; wire it to a chart
          here once deployed.
        </p>
      </Card>
    </div>
  );
}
