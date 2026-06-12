/*
  Seed Firestore with starter content (Bahasa Indonesia).
  Usage:
    GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/seed.mjs
  Or against the emulator:
    FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/seed.mjs
*/

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const moduleRef = db.collection("modules").doc("dasar-akuntansi");
const topicPersamaan = db.collection("topics").doc("persamaan-akuntansi");
const topicJurnal = db.collection("topics").doc("jurnal-umum");

const questions = [
  // Persamaan akuntansi
  {
    id: "pa-1",
    topicId: topicPersamaan.id,
    type: "mc",
    prompt: "Persamaan dasar akuntansi yang benar adalah...",
    options: [
      "Aset = Liabilitas + Ekuitas",
      "Aset = Liabilitas - Ekuitas",
      "Ekuitas = Aset + Liabilitas",
      "Liabilitas = Aset + Ekuitas",
    ],
    correctIndex: 0,
    explanation: "Aset selalu sama dengan liabilitas ditambah ekuitas pemilik.",
    difficulty: 1,
    tags: ["persamaan dasar"],
  },
  {
    id: "pa-2",
    topicId: topicPersamaan.id,
    type: "tf",
    prompt: "Pembelian peralatan secara tunai mengubah total aset perusahaan.",
    answerBool: false,
    explanation:
      "Kas berkurang, peralatan bertambah. Komposisi berubah, total aset tetap.",
    difficulty: 2,
    tags: ["transaksi", "aset"],
  },
  {
    id: "pa-3",
    topicId: topicPersamaan.id,
    type: "fill",
    prompt:
      "Sumber daya ekonomi yang dikuasai perusahaan dan diharapkan memberi manfaat masa depan disebut...",
    answerText: "aset",
    explanation: "Definisi aset menurut kerangka konseptual akuntansi.",
    difficulty: 1,
    tags: ["definisi"],
  },
  {
    id: "pa-4",
    topicId: topicPersamaan.id,
    type: "match",
    prompt: "Pasangkan akun dengan kelompoknya.",
    pairs: [
      { left: "Kas", right: "Aset" },
      { left: "Utang usaha", right: "Liabilitas" },
      { left: "Modal pemilik", right: "Ekuitas" },
    ],
    explanation: "Kas itu aset, utang usaha itu liabilitas, modal itu ekuitas.",
    difficulty: 2,
    tags: ["klasifikasi akun"],
  },
  {
    id: "pa-5",
    topicId: topicPersamaan.id,
    type: "mc",
    prompt:
      "Pemilik menyetor uang Rp10.000.000 ke perusahaan. Dampaknya pada persamaan akuntansi?",
    options: [
      "Aset naik, ekuitas naik",
      "Aset naik, liabilitas naik",
      "Aset turun, ekuitas turun",
      "Tidak ada perubahan",
    ],
    correctIndex: 0,
    explanation: "Kas (aset) bertambah dan modal pemilik (ekuitas) bertambah.",
    difficulty: 2,
    tags: ["transaksi", "ekuitas"],
  },
  {
    id: "pa-6",
    topicId: topicPersamaan.id,
    type: "tf",
    prompt: "Pendapatan menambah ekuitas pemilik.",
    answerBool: true,
    explanation: "Pendapatan menaikkan laba, dan laba menambah ekuitas.",
    difficulty: 1,
    tags: ["pendapatan", "ekuitas"],
  },
  // Jurnal umum
  {
    id: "ju-1",
    topicId: topicJurnal.id,
    type: "mc",
    prompt: "Membeli perlengkapan secara kredit dijurnal sebagai...",
    options: [
      "Perlengkapan (D), Utang usaha (K)",
      "Perlengkapan (D), Kas (K)",
      "Utang usaha (D), Perlengkapan (K)",
      "Kas (D), Perlengkapan (K)",
    ],
    correctIndex: 0,
    explanation:
      "Perlengkapan bertambah di debit, utang usaha bertambah di kredit.",
    difficulty: 2,
    tags: ["jurnal", "kredit"],
  },
  {
    id: "ju-2",
    topicId: topicJurnal.id,
    type: "match",
    prompt: "Pasangkan akun dengan posisi normalnya.",
    pairs: [
      { left: "Beban gaji", right: "Debit" },
      { left: "Pendapatan jasa", right: "Kredit" },
      { left: "Kas", right: "Debit (saldo normal)" },
    ],
    explanation:
      "Beban dan aset bersaldo normal debit; pendapatan bersaldo normal kredit.",
    difficulty: 3,
    tags: ["saldo normal", "jurnal"],
  },
  {
    id: "ju-3",
    topicId: topicJurnal.id,
    type: "fill",
    prompt:
      "Sisi kiri dalam sebuah akun T disebut sisi...",
    answerText: "debit",
    explanation: "Sisi kiri akun adalah debit, sisi kanan adalah kredit.",
    difficulty: 1,
    tags: ["akun T"],
  },
  {
    id: "ju-4",
    topicId: topicJurnal.id,
    type: "tf",
    prompt:
      "Menerima pelunasan piutang dicatat dengan mendebit kas dan mengkredit piutang usaha.",
    answerBool: true,
    explanation: "Kas bertambah (debit), piutang usaha berkurang (kredit).",
    difficulty: 2,
    tags: ["piutang", "jurnal"],
  },
];

function fullQuestion(q) {
  return {
    topicId: q.topicId,
    type: q.type,
    prompt: q.prompt,
    options: q.options ?? [],
    correctIndex: q.correctIndex ?? 0,
    answerBool: q.answerBool ?? true,
    answerText: q.answerText ?? "",
    pairs: q.pairs ?? [],
    explanation: q.explanation ?? "",
    difficulty: q.difficulty ?? 2,
    tags: q.tags ?? [],
    stats: { attempts: 0, wrong: 0 },
  };
}

async function main() {
  const batch = db.batch();

  batch.set(moduleRef, {
    title: "Dasar Akuntansi",
    description: "Persamaan akuntansi sampai jurnal umum.",
    icon: "calculator",
    order: 1,
    published: true,
    vipOnly: false,
  });

  batch.set(topicPersamaan, {
    moduleId: moduleRef.id,
    title: "Persamaan Akuntansi",
    order: 1,
    published: true,
    drillTimerSec: 20,
  });
  batch.set(topicJurnal, {
    moduleId: moduleRef.id,
    title: "Jurnal Umum",
    order: 2,
    published: true,
    drillTimerSec: 25,
  });

  for (const q of questions) {
    batch.set(db.collection("questions").doc(q.id), fullQuestion(q));
  }

  batch.set(db.collection("lessons").doc("pa-pengenalan"), {
    topicId: topicPersamaan.id,
    title: "Pengenalan",
    order: 1,
    xpReward: 20,
    questionIds: ["pa-1", "pa-2", "pa-3"],
    published: true,
  });
  batch.set(db.collection("lessons").doc("pa-transaksi"), {
    topicId: topicPersamaan.id,
    title: "Dampak Transaksi",
    order: 2,
    xpReward: 20,
    questionIds: ["pa-4", "pa-5", "pa-6"],
    published: true,
  });
  batch.set(db.collection("lessons").doc("ju-dasar"), {
    topicId: topicJurnal.id,
    title: "Debit dan Kredit",
    order: 1,
    xpReward: 25,
    questionIds: ["ju-3", "ju-2", "ju-1", "ju-4"],
    published: true,
  });

  batch.set(db.collection("config").doc("app"), {
    heartRegenMinutes: 30,
    heartsPerRewardedAd: 1,
    gemPricePerHeart: 30,
    gemPriceStreakFreeze: 100,
    leaguePromoteN: 5,
    leagueDemoteN: 5,
  });

  await batch.commit();
  console.log(`Seeded 1 module, 2 topics, 3 lessons, ${questions.length} questions, config.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
