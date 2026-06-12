import type { UserDoc, ModuleDoc, LessonDoc, AppConfigDoc } from "./types";
import type { WithId } from "./db";
import { MAX_HEARTS, DEFAULT_HEART_REGEN_MINUTES, GEM_PRICE_PER_HEART, GEM_PRICE_STREAK_FREEZE, LEAGUE_PROMOTE_N, LEAGUE_DEMOTE_N } from "./constants";

// Fake Timestamp-like object for demo mode
export const fakeTs = { toMillis: () => Date.now(), toDate: () => new Date() };

export const DEMO_USER_ID = "demo-user-001";

export const DEMO_PROFILE: UserDoc = {
  displayName: "Demo Pelajar",
  email: "demo@finantrix.id",
  photoURL: "",
  locale: "id",
  xpTotal: 240,
  xpWeekly: 120,
  gems: 75,
  hearts: { current: 4, max: MAX_HEARTS, lastRegenAt: fakeTs as unknown as import("firebase/firestore").Timestamp },
  streak: { current: 3, longest: 7, lastActiveDate: "2026-06-11", freezes: 1 },
  vip: { active: false, plan: null, expiresAt: null },
  league: { tier: "bronze", leagueId: "demo-league" },
  badges: ["streak-3"],
  reminderTime: null,
  fcmToken: null,
  soundOn: true,
  createdAt: fakeTs as unknown as import("firebase/firestore").Timestamp,
};

export const DEMO_CONFIG: AppConfigDoc = {
  heartRegenMinutes: DEFAULT_HEART_REGEN_MINUTES,
  heartsPerRewardedAd: 1,
  gemPricePerHeart: GEM_PRICE_PER_HEART,
  gemPriceStreakFreeze: GEM_PRICE_STREAK_FREEZE,
  leaguePromoteN: LEAGUE_PROMOTE_N,
  leagueDemoteN: LEAGUE_DEMOTE_N,
};

export const DEMO_MODULES: WithId<ModuleDoc>[] = [
  {
    id: "mod-1",
    title: "Dasar Akuntansi",
    description: "Konsep-konsep fundamental dalam akuntansi",
    icon: "📊",
    order: 1,
    published: true,
    vipOnly: false,
  },
];

// TopicDoc has no description/lessonIds fields; we extend for mock purposes
type MockTopicDoc = { id: string; moduleId: string; title: string; order: number; published: boolean; drillTimerSec: number };

export const DEMO_TOPICS: MockTopicDoc[] = [
  { id: "topic-1", moduleId: "mod-1", title: "Persamaan Akuntansi", order: 1, published: true, drillTimerSec: 30 },
  { id: "topic-2", moduleId: "mod-1", title: "Jurnal Umum", order: 2, published: true, drillTimerSec: 30 },
];

export const DEMO_LESSONS: WithId<LessonDoc>[] = [
  {
    id: "lesson-1",
    topicId: "topic-1",
    title: "Pengantar Persamaan Akuntansi",
    order: 1,
    published: true,
    xpReward: 20,
    questionIds: ["q1", "q2", "q3"],
  },
  {
    id: "lesson-2",
    topicId: "topic-1",
    title: "Latihan Persamaan Dasar",
    order: 2,
    published: true,
    xpReward: 25,
    questionIds: ["q4", "q5"],
  },
  {
    id: "lesson-3",
    topicId: "topic-2",
    title: "Debit dan Kredit",
    order: 1,
    published: true,
    xpReward: 30,
    questionIds: ["q6", "q7", "q8", "q9", "q10"],
  },
];

// Use a loose type for mock questions since not all fields apply to every type
type MockQuestion = { id: string; topicId: string; type: string; prompt: string; options?: string[]; correctIndex?: number; answerBool?: boolean; answerText?: string; pairs?: { left: string; right: string }[]; explanation: string; difficulty: number; tags: string[]; stats: { attempts: number; wrong: number } };

export const DEMO_QUESTIONS: MockQuestion[] = [
  {
    id: "q1", topicId: "topic-1", type: "mc",
    prompt: "Persamaan dasar akuntansi adalah...",
    options: ["Aset = Liabilitas + Ekuitas", "Aset = Ekuitas - Liabilitas", "Liabilitas = Aset + Ekuitas", "Ekuitas = Aset + Liabilitas"],
    correctIndex: 0,
    explanation: "Persamaan dasar akuntansi: Aset = Liabilitas + Ekuitas",
    difficulty: 1, tags: ["persamaan", "dasar"], stats: { attempts: 0, wrong: 0 },
  },
  {
    id: "q2", topicId: "topic-1", type: "tf",
    prompt: "Aset perusahaan selalu lebih besar dari ekuitasnya.",
    answerBool: false,
    explanation: "Tidak selalu - aset bisa sama dengan ekuitas jika tidak ada liabilitas.",
    difficulty: 1, tags: ["persamaan"], stats: { attempts: 0, wrong: 0 },
  },
  {
    id: "q3", topicId: "topic-1", type: "fill",
    prompt: "Jika aset Rp100 juta dan liabilitas Rp40 juta, maka ekuitas adalah Rp___ juta.",
    answerText: "60",
    explanation: "Ekuitas = Aset - Liabilitas = 100 - 40 = 60 juta",
    difficulty: 2, tags: ["perhitungan"], stats: { attempts: 0, wrong: 0 },
  },
  {
    id: "q4", topicId: "topic-1", type: "mc",
    prompt: "Manakah yang termasuk kelompok Aset?",
    options: ["Kas", "Utang Bank", "Modal Pemilik", "Pendapatan"],
    correctIndex: 0,
    explanation: "Kas adalah aset lancar perusahaan.",
    difficulty: 1, tags: ["klasifikasi"], stats: { attempts: 0, wrong: 0 },
  },
  {
    id: "q5", topicId: "topic-1", type: "match",
    prompt: "Pasangkan akun dengan kelompoknya:",
    pairs: [{ left: "Kas", right: "Aset" }, { left: "Utang", right: "Liabilitas" }, { left: "Modal", right: "Ekuitas" }],
    explanation: "Klasifikasi akun: Kas=Aset, Utang=Liabilitas, Modal=Ekuitas",
    difficulty: 2, tags: ["klasifikasi", "pasangan"], stats: { attempts: 0, wrong: 0 },
  },
  {
    id: "q6", topicId: "topic-2", type: "mc",
    prompt: "Dalam jurnal umum, pembelian peralatan tunai dicatat sebagai...",
    options: ["Debit Peralatan, Kredit Kas", "Kredit Peralatan, Debit Kas", "Debit Kas, Kredit Peralatan", "Kredit Kas, Debit Liabilitas"],
    correctIndex: 0,
    explanation: "Pembelian aset: Debit akun aset (Peralatan), Kredit Kas.",
    difficulty: 2, tags: ["jurnal", "debit-kredit"], stats: { attempts: 0, wrong: 0 },
  },
  {
    id: "q7", topicId: "topic-2", type: "tf",
    prompt: "Akun pendapatan bertambah di sisi Kredit.",
    answerBool: true,
    explanation: "Benar. Pendapatan adalah kredit normal - bertambah di sisi kredit.",
    difficulty: 1, tags: ["jurnal"], stats: { attempts: 0, wrong: 0 },
  },
  {
    id: "q8", topicId: "topic-2", type: "fill",
    prompt: "Akun beban bertambah di sisi ___.",
    answerText: "debit",
    explanation: "Beban memiliki saldo normal debit, sehingga bertambah di sisi debit.",
    difficulty: 1, tags: ["jurnal"], stats: { attempts: 0, wrong: 0 },
  },
  {
    id: "q9", topicId: "topic-2", type: "mc",
    prompt: "Penerimaan kas dari pelanggan dicatat sebagai...",
    options: ["Debit Kas, Kredit Piutang", "Debit Piutang, Kredit Kas", "Debit Kas, Kredit Pendapatan", "Kredit Kas, Debit Pendapatan"],
    correctIndex: 0,
    explanation: "Penerimaan pelunasan: Kas masuk (Debit), Piutang berkurang (Kredit).",
    difficulty: 2, tags: ["jurnal", "transaksi"], stats: { attempts: 0, wrong: 0 },
  },
  {
    id: "q10", topicId: "topic-2", type: "match",
    prompt: "Pasangkan transaksi dengan jurnalnya:",
    pairs: [{ left: "Beli aset tunai", right: "Debit Aset" }, { left: "Terima pendapatan", right: "Kredit Pendapatan" }, { left: "Bayar beban", right: "Debit Beban" }],
    explanation: "Aturan debit-kredit untuk setiap jenis transaksi umum.",
    difficulty: 3, tags: ["jurnal", "pasangan"], stats: { attempts: 0, wrong: 0 },
  },
];
