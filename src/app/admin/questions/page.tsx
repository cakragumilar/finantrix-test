"use client";

/* Question CRUD: editor for all 4 types, student preview, CSV bulk import. */

import { useRef, useState } from "react";
import Papa from "papaparse";
import { writeBatch, doc, collection } from "firebase/firestore";
import { EyeIcon, PlusIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { db } from "@/lib/firebase";
import {
  createDoc,
  emptyQuestion,
  patchDoc,
  removeDoc,
  useAdminAllTopics,
  useAdminQuestions,
} from "@/lib/admin-db";
import type { QuestionDoc, QuestionType } from "@/lib/types";
import { Button, Card, ErrorNote } from "@/components/ui";
import { QuestionView } from "@/components/lesson/question-view";

const inputCls =
  "w-full rounded-[var(--radius-input)] border-2 border-line bg-raised px-3 py-2 text-sm font-medium focus:border-accent focus:outline-none";

const TYPE_LABELS: Record<QuestionType, string> = {
  mc: "Multiple choice",
  tf: "True / False",
  fill: "Fill in the blank",
  match: "Match pairs",
};

interface CsvRow {
  type?: string;
  prompt?: string;
  options?: string;
  correctIndex?: string;
  answerBool?: string;
  answerText?: string;
  pairs?: string;
  explanation?: string;
  difficulty?: string;
  tags?: string;
}

function rowToQuestion(row: CsvRow, topicId: string): QuestionDoc | null {
  const type = (row.type ?? "").trim() as QuestionType;
  if (!["mc", "tf", "fill", "match"].includes(type)) return null;
  if (!row.prompt?.trim()) return null;
  const base = emptyQuestion(topicId);
  return {
    ...base,
    type,
    prompt: row.prompt.trim(),
    options: row.options ? row.options.split("|").map((s) => s.trim()) : base.options,
    correctIndex: Number(row.correctIndex ?? 0) || 0,
    answerBool: (row.answerBool ?? "true").trim().toLowerCase() !== "false",
    answerText: row.answerText?.trim() ?? "",
    pairs: row.pairs
      ? row.pairs.split("|").map((p) => {
          const [left = "", right = ""] = p.split("=");
          return { left: left.trim(), right: right.trim() };
        })
      : base.pairs,
    explanation: row.explanation?.trim() ?? "",
    difficulty: Math.min(5, Math.max(1, Number(row.difficulty ?? 2) || 2)),
    tags: row.tags ? row.tags.split("|").map((s) => s.trim()).filter(Boolean) : [],
  };
}

export default function QuestionsAdmin() {
  const topics = useAdminAllTopics();
  const [topicId, setTopicId] = useState<string | null>(null);
  const questions = useAdminQuestions(topicId);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<QuestionDoc | null>(null);
  const [preview, setPreview] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function startEdit(id: string, q: QuestionDoc) {
    setEditId(id);
    setDraft(JSON.parse(JSON.stringify(q)));
    setPreview(false);
  }

  async function save() {
    if (!editId || !draft) return;
    await patchDoc("questions", editId, { ...draft });
    setEditId(null);
    setDraft(null);
  }

  function importCsv(file: File) {
    if (!topicId) return;
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        const rows = res.data
          .map((r) => rowToQuestion(r, topicId))
          .filter((q): q is QuestionDoc => q !== null);
        if (rows.length === 0) {
          setNote("No valid rows found. Check the column format.");
          return;
        }
        const batch = writeBatch(db());
        rows.forEach((q) => batch.set(doc(collection(db(), "questions")), q));
        await batch.commit();
        setNote(`Imported ${rows.length} questions.`);
      },
      error: () => setNote("Failed to parse the CSV file."),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-2xl font-extrabold tracking-tight">Questions</h1>
        <select
          className={`${inputCls} max-w-xs`}
          value={topicId ?? ""}
          onChange={(e) => {
            setTopicId(e.target.value || null);
            setEditId(null);
          }}
        >
          <option value="">Select topic...</option>
          {(topics.data ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-2">
          <Button
            variant="secondary"
            className="px-4 py-2 text-xs"
            disabled={!topicId}
            onClick={() => fileRef.current?.click()}
          >
            <UploadSimpleIcon size={14} weight="bold" /> Import CSV
          </Button>
          <Button
            className="px-4 py-2 text-xs"
            disabled={!topicId}
            onClick={async () => {
              const ref = await createDoc("questions", {
                ...emptyQuestion(topicId!),
              });
              startEdit(ref.id, emptyQuestion(topicId!));
            }}
          >
            <PlusIcon size={14} weight="bold" /> New question
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importCsv(f);
            e.target.value = "";
          }}
        />
      </div>

      {note && <ErrorNote message={note} />}
      <p className="text-xs text-ink-soft">
        CSV columns: type (mc|tf|fill|match), prompt, options (a|b|c|d),
        correctIndex, answerBool, answerText, pairs (kiri=kanan|...),
        explanation, difficulty (1-5), tags (x|y)
      </p>

      {!topicId ? (
        <Card>
          <p className="text-sm text-ink-soft">
            Pick a topic to manage its questions.
          </p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <Card className="flex flex-col gap-2">
            <h2 className="font-bold mb-1">
              {questions.data?.length ?? 0} questions
            </h2>
            {(questions.data ?? []).map((q) => (
              <div
                key={q.id}
                className={`rounded-[var(--radius-input)] border-2 p-3 cursor-pointer ${
                  editId === q.id ? "border-accent" : "border-line"
                }`}
                onClick={() => startEdit(q.id, q)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate">
                    {q.prompt || "(empty prompt)"}
                  </p>
                  <button
                    aria-label="Delete question"
                    className="text-danger shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this question?"))
                        void removeDoc("questions", q.id);
                    }}
                  >
                    <TrashIcon size={16} weight="bold" />
                  </button>
                </div>
                <p className="text-xs text-ink-soft mt-1">
                  {TYPE_LABELS[q.type]} · difficulty{" "}
                  <span className="num">{q.difficulty}</span>
                  {q.stats.attempts > 0 && (
                    <>
                      {" "}
                      · <span className="num">{q.stats.attempts}</span> attempts,{" "}
                      <span className="num">
                        {Math.round((q.stats.wrong / q.stats.attempts) * 100)}%
                      </span>{" "}
                      wrong
                    </>
                  )}
                </p>
              </div>
            ))}
          </Card>

          {draft && editId && (
            <Card className="flex flex-col gap-3 sticky top-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Editor</h2>
                <Button
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setPreview((p) => !p)}
                >
                  <EyeIcon size={14} weight="bold" />
                  {preview ? "Edit" : "Preview"}
                </Button>
              </div>

              {preview ? (
                <div className="border-2 border-dashed border-line rounded-[var(--radius-card)] p-4 min-h-[420px] flex flex-col">
                  <QuestionView
                    key={JSON.stringify(draft)}
                    q={{ id: "preview", ...draft }}
                    onChecked={() => {}}
                    onNext={() => setPreview(false)}
                  />
                </div>
              ) : (
                <>
                  <select
                    className={inputCls}
                    value={draft.type}
                    onChange={(e) =>
                      setDraft({ ...draft, type: e.target.value as QuestionType })
                    }
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className={inputCls}
                    rows={2}
                    placeholder="Prompt (in Bahasa Indonesia)"
                    value={draft.prompt}
                    onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
                  />

                  {draft.type === "mc" && (
                    <div className="flex flex-col gap-2">
                      {draft.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct"
                            checked={draft.correctIndex === i}
                            onChange={() => setDraft({ ...draft, correctIndex: i })}
                            title="Correct answer"
                          />
                          <input
                            className={inputCls}
                            placeholder={`Option ${i + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const options = [...draft.options];
                              options[i] = e.target.value;
                              setDraft({ ...draft, options });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {draft.type === "tf" && (
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={draft.answerBool}
                        onChange={(e) =>
                          setDraft({ ...draft, answerBool: e.target.checked })
                        }
                      />
                      Statement is TRUE
                    </label>
                  )}

                  {draft.type === "fill" && (
                    <input
                      className={inputCls}
                      placeholder="Accepted answer (case-insensitive)"
                      value={draft.answerText}
                      onChange={(e) =>
                        setDraft({ ...draft, answerText: e.target.value })
                      }
                    />
                  )}

                  {draft.type === "match" && (
                    <div className="flex flex-col gap-2">
                      {draft.pairs.map((p, i) => (
                        <div key={i} className="grid grid-cols-2 gap-2">
                          <input
                            className={inputCls}
                            placeholder="Left (e.g. account)"
                            value={p.left}
                            onChange={(e) => {
                              const pairs = [...draft.pairs];
                              pairs[i] = { ...pairs[i], left: e.target.value };
                              setDraft({ ...draft, pairs });
                            }}
                          />
                          <input
                            className={inputCls}
                            placeholder="Right (e.g. debit/credit)"
                            value={p.right}
                            onChange={(e) => {
                              const pairs = [...draft.pairs];
                              pairs[i] = { ...pairs[i], right: e.target.value };
                              setDraft({ ...draft, pairs });
                            }}
                          />
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        className="px-3 py-1.5 text-xs self-start"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            pairs: [...draft.pairs, { left: "", right: "" }],
                          })
                        }
                      >
                        <PlusIcon size={14} weight="bold" /> Add pair
                      </Button>
                    </div>
                  )}

                  <textarea
                    className={inputCls}
                    rows={2}
                    placeholder="Explanation shown after answering"
                    value={draft.explanation}
                    onChange={(e) =>
                      setDraft({ ...draft, explanation: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-ink-soft">
                        Difficulty (1-5)
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        className={inputCls}
                        value={draft.difficulty}
                        onChange={(e) =>
                          setDraft({ ...draft, difficulty: Number(e.target.value) })
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-ink-soft">
                        Tags (comma-separated)
                      </span>
                      <input
                        className={inputCls}
                        value={draft.tags.join(", ")}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            tags: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button className="px-5 py-2 text-xs" onClick={save}>
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-5 py-2 text-xs"
                      onClick={() => {
                        setEditId(null);
                        setDraft(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
