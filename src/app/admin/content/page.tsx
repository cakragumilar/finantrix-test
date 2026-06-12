"use client";

/* Content tree CRUD: Modules > Topics > Lessons (questionIds picked per lesson) */

import { useState } from "react";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import {
  createDoc,
  patchDoc,
  removeDoc,
  useAdminLessons,
  useAdminModules,
  useAdminQuestions,
  useAdminTopics,
} from "@/lib/admin-db";
import { MODULE_ICONS } from "@/components/module-icons";
import { Button, Card } from "@/components/ui";

const inputCls =
  "w-full rounded-[var(--radius-input)] border-2 border-line bg-raised px-3 py-2 text-sm font-medium focus:border-accent focus:outline-none";
const labelCls = "text-xs font-bold text-ink-soft";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

export default function ContentAdmin() {
  const modules = useAdminModules();
  const [moduleId, setModuleId] = useState<string | null>(null);
  const topics = useAdminTopics(moduleId);
  const [topicId, setTopicId] = useState<string | null>(null);
  const lessons = useAdminLessons(topicId);
  const questions = useAdminQuestions(topicId);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Content</h1>
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Modules */}
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Modules</h2>
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              onClick={() =>
                createDoc("modules", {
                  title: "New module",
                  description: "",
                  icon: "books",
                  order: (modules.data?.length ?? 0) + 1,
                  published: false,
                  vipOnly: false,
                })
              }
            >
              <PlusIcon size={14} weight="bold" /> Add
            </Button>
          </div>
          {(modules.data ?? []).map((m) => (
            <div
              key={m.id}
              className={`rounded-[var(--radius-input)] border-2 p-3 cursor-pointer ${
                moduleId === m.id ? "border-accent" : "border-line"
              }`}
              onClick={() => {
                setModuleId(m.id);
                setTopicId(null);
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-sm truncate">
                  {m.title}
                  {!m.published && (
                    <span className="text-ink-faint font-medium"> (draft)</span>
                  )}
                </p>
                <button
                  aria-label="Delete module"
                  className="text-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete module "${m.title}"?`))
                      void removeDoc("modules", m.id);
                  }}
                >
                  <TrashIcon size={16} weight="bold" />
                </button>
              </div>
              {moduleId === m.id && (
                <div
                  className="mt-3 flex flex-col gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Field label="Title">
                    <input
                      className={inputCls}
                      defaultValue={m.title}
                      onBlur={(e) =>
                        patchDoc("modules", m.id, { title: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Description">
                    <input
                      className={inputCls}
                      defaultValue={m.description}
                      onBlur={(e) =>
                        patchDoc("modules", m.id, {
                          description: e.target.value,
                        })
                      }
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Icon">
                      <select
                        className={inputCls}
                        defaultValue={m.icon}
                        onChange={(e) =>
                          patchDoc("modules", m.id, { icon: e.target.value })
                        }
                      >
                        {Object.keys(MODULE_ICONS).map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Order">
                      <input
                        type="number"
                        className={inputCls}
                        defaultValue={m.order}
                        onBlur={(e) =>
                          patchDoc("modules", m.id, {
                            order: Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                  </div>
                  <div className="flex gap-4 text-sm font-semibold">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        defaultChecked={m.published}
                        onChange={(e) =>
                          patchDoc("modules", m.id, {
                            published: e.target.checked,
                          })
                        }
                      />
                      Published
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        defaultChecked={m.vipOnly}
                        onChange={(e) =>
                          patchDoc("modules", m.id, {
                            vipOnly: e.target.checked,
                          })
                        }
                      />
                      VIP only
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </Card>

        {/* Topics */}
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Topics</h2>
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={!moduleId}
              onClick={() =>
                createDoc("topics", {
                  moduleId,
                  title: "New topic",
                  order: (topics.data?.length ?? 0) + 1,
                  published: false,
                  drillTimerSec: 20,
                })
              }
            >
              <PlusIcon size={14} weight="bold" /> Add
            </Button>
          </div>
          {!moduleId ? (
            <p className="text-sm text-ink-soft">Select a module first.</p>
          ) : (
            (topics.data ?? []).map((t) => (
              <div
                key={t.id}
                className={`rounded-[var(--radius-input)] border-2 p-3 cursor-pointer ${
                  topicId === t.id ? "border-accent" : "border-line"
                }`}
                onClick={() => setTopicId(t.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm truncate">
                    {t.title}
                    {!t.published && (
                      <span className="text-ink-faint font-medium"> (draft)</span>
                    )}
                  </p>
                  <button
                    aria-label="Delete topic"
                    className="text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete topic "${t.title}"?`))
                        void removeDoc("topics", t.id);
                    }}
                  >
                    <TrashIcon size={16} weight="bold" />
                  </button>
                </div>
                {topicId === t.id && (
                  <div
                    className="mt-3 flex flex-col gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Field label="Title">
                      <input
                        className={inputCls}
                        defaultValue={t.title}
                        onBlur={(e) =>
                          patchDoc("topics", t.id, { title: e.target.value })
                        }
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Order">
                        <input
                          type="number"
                          className={inputCls}
                          defaultValue={t.order}
                          onBlur={(e) =>
                            patchDoc("topics", t.id, {
                              order: Number(e.target.value),
                            })
                          }
                        />
                      </Field>
                      <Field label="Drill timer (sec)">
                        <input
                          type="number"
                          className={inputCls}
                          defaultValue={t.drillTimerSec}
                          onBlur={(e) =>
                            patchDoc("topics", t.id, {
                              drillTimerSec: Number(e.target.value),
                            })
                          }
                        />
                      </Field>
                    </div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold">
                      <input
                        type="checkbox"
                        defaultChecked={t.published}
                        onChange={(e) =>
                          patchDoc("topics", t.id, {
                            published: e.target.checked,
                          })
                        }
                      />
                      Published
                    </label>
                  </div>
                )}
              </div>
            ))
          )}
        </Card>

        {/* Lessons */}
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Lessons</h2>
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={!topicId}
              onClick={() =>
                createDoc("lessons", {
                  topicId,
                  title: "New lesson",
                  order: (lessons.data?.length ?? 0) + 1,
                  xpReward: 20,
                  questionIds: [],
                  published: false,
                })
              }
            >
              <PlusIcon size={14} weight="bold" /> Add
            </Button>
          </div>
          {!topicId ? (
            <p className="text-sm text-ink-soft">Select a topic first.</p>
          ) : (
            (lessons.data ?? []).map((l) => (
              <div
                key={l.id}
                className="rounded-[var(--radius-input)] border-2 border-line p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm truncate">
                    {l.title}
                    {!l.published && (
                      <span className="text-ink-faint font-medium"> (draft)</span>
                    )}
                  </p>
                  <button
                    aria-label="Delete lesson"
                    className="text-danger"
                    onClick={() => {
                      if (confirm(`Delete lesson "${l.title}"?`))
                        void removeDoc("lessons", l.id);
                    }}
                  >
                    <TrashIcon size={16} weight="bold" />
                  </button>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <Field label="Title">
                    <input
                      className={inputCls}
                      defaultValue={l.title}
                      onBlur={(e) =>
                        patchDoc("lessons", l.id, { title: e.target.value })
                      }
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Order">
                      <input
                        type="number"
                        className={inputCls}
                        defaultValue={l.order}
                        onBlur={(e) =>
                          patchDoc("lessons", l.id, {
                            order: Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field label="XP reward">
                      <input
                        type="number"
                        className={inputCls}
                        defaultValue={l.xpReward}
                        onBlur={(e) =>
                          patchDoc("lessons", l.id, {
                            xpReward: Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field label={`Questions (${l.questionIds.length} selected)`}>
                    <div className="max-h-40 overflow-y-auto flex flex-col gap-1 border-2 border-line rounded-[var(--radius-input)] p-2">
                      {(questions.data ?? []).map((q) => (
                        <label
                          key={q.id}
                          className="flex items-center gap-2 text-xs font-medium"
                        >
                          <input
                            type="checkbox"
                            defaultChecked={l.questionIds.includes(q.id)}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...l.questionIds, q.id]
                                : l.questionIds.filter((id) => id !== q.id);
                              void patchDoc("lessons", l.id, {
                                questionIds: next,
                              });
                            }}
                          />
                          <span className="truncate">{q.prompt || "(empty)"}</span>
                        </label>
                      ))}
                      {(questions.data ?? []).length === 0 && (
                        <p className="text-xs text-ink-soft">
                          No questions in this topic yet. Add them in the
                          Questions tab.
                        </p>
                      )}
                    </div>
                  </Field>
                  <label className="flex items-center gap-1.5 text-sm font-semibold">
                    <input
                      type="checkbox"
                      defaultChecked={l.published}
                      onChange={(e) =>
                        patchDoc("lessons", l.id, {
                          published: e.target.checked,
                        })
                      }
                    />
                    Published
                  </label>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
