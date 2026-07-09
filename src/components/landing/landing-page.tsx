"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  ChartLineUpIcon,
  ClockIcon,
  CoinIcon,
  DiamondIcon,
  FlameIcon,
  HeartIcon,
  ListChecksIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TargetIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button, Card } from "@/components/ui";
import { Reveal } from "./reveal";
import { HeroMockup } from "./hero-mockup";
import { LeagueMockup } from "./league-mockup";

const NAV_LINKS = [
  { href: "#fitur", label: "Fitur" },
  { href: "#liga", label: "Liga" },
  { href: "#harga", label: "Harga" },
];

const STATS = [
  {
    icon: ListChecksIcon,
    value: "4",
    label: "Tipe soal interaktif setiap pelajaran",
  },
  {
    icon: ClockIcon,
    value: "Harian",
    label: "Latihan singkat, bisa dikerjakan kapan saja",
  },
  {
    icon: ChartLineUpIcon,
    value: "Real-time",
    label: "Papan liga mingguan yang selalu update",
  },
];

const STEPS = [
  {
    icon: BookOpenIcon,
    title: "Pilih topik",
    body: "Mulai dari akuntansi dasar sampai laporan keuangan dan pajak.",
  },
  {
    icon: TargetIcon,
    title: "Latihan singkat",
    body: "Jawab soal interaktif, dapat XP setiap kali jawabanmu benar.",
  },
  {
    icon: ChartLineUpIcon,
    title: "Naik peringkat",
    body: "Kumpulkan XP mingguan dan naik liga bareng pemain lain.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Rangkaian harian bikin aku beneran belajar tiap hari, bukan cuma niat doang.",
    name: "Dewi Anggraini",
    role: "Mahasiswa Akuntansi",
    tone: "accent" as const,
  },
  {
    quote:
      "Latihan soal pajak jadi kerasa kayak main, bukan kayak baca buku tebal.",
    name: "Rizky Pratama",
    role: "Staf Pembukuan UMKM",
    tone: "streak" as const,
  },
  {
    quote: "Liga mingguan bikin aku kompetitif belajar keuangan tiap minggu.",
    name: "Nadia Salsabila",
    role: "Karyawan Startup",
    tone: "gem" as const,
  },
];

const toneBg: Record<string, string> = {
  accent: "bg-accent text-on-accent",
  streak: "bg-streak text-on-accent",
  gem: "bg-gem text-on-accent",
};

export function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <main className="flex-1 bg-surface text-ink">
      <header className="sticky top-0 z-30 border-b-2 border-line bg-surface/90 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
              <ChartLineUpIcon size={20} weight="bold" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              Finantrix
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
          <Link href="/masuk">
            <Button>Mulai Gratis</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-16 pt-14 lg:grid-cols-2 lg:pt-20">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left"
        >
          <h1 className="max-w-[16ch] text-4xl font-extrabold tracking-tight text-ink md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            Kuasai akuntansi, satu latihan singkat setiap hari
          </h1>
          <p className="max-w-[44ch] text-base text-ink-soft md:text-lg">
            Belajar debit kredit, laporan keuangan, dan pajak lewat permainan
            harian. Kumpulkan XP, jaga rangkaian harian, naik liga.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/masuk">
              <Button full className="sm:w-auto">
                Mulai Gratis
                <ArrowRightIcon size={18} weight="bold" />
              </Button>
            </Link>
            <a href="#cara-kerja">
              <Button variant="ghost" full className="sm:w-auto">
                Lihat Cara Kerja
              </Button>
            </a>
          </div>
        </motion.div>

        <HeroMockup />
      </section>

      {/* Stat strip */}
      <section className="border-y-2 border-line bg-raised">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 sm:grid-cols-3">
          {STATS.map((stat) => (
            <Reveal key={stat.label} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <stat.icon size={20} weight="bold" />
              </span>
              <div>
                <p className="num text-xl font-extrabold text-ink">
                  {stat.value}
                </p>
                <p className="text-sm text-ink-soft">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Feature bento */}
      <section id="fitur" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto max-w-[32ch] text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Belajar jadi kebiasaan, bukan beban
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Reveal className="md:col-span-2">
            <Card className="h-full bg-streak-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-streak text-on-accent">
                  <FlameIcon size={20} weight="fill" />
                </span>
                <p className="text-lg font-bold text-ink">Rangkaian harian</p>
              </div>
              <p className="mt-2 max-w-[48ch] text-sm text-ink-soft">
                Latihan tiap hari menyalakan rangkaianmu. Lewati sehari, pakai
                freeze untuk menjaga progres tetap aman.
              </p>
              <div className="mt-5 flex gap-1.5">
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day, i) => (
                  <span
                    key={i}
                    className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-input)] text-[9px] font-bold ${
                      i < 5
                        ? "bg-streak text-on-accent"
                        : "border-2 border-line bg-surface text-ink-faint"
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <Card className="h-full bg-danger-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger text-on-accent">
                <HeartIcon size={20} weight="fill" />
              </span>
              <p className="mt-3 text-lg font-bold text-ink">Sistem nyawa</p>
              <p className="mt-2 text-sm text-ink-soft">
                Salah jawab mengurangi nyawa. Isi ulang lewat iklan atau
                tunggu sampai pulih sendiri.
              </p>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="h-full bg-gem-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gem text-on-accent">
                <DiamondIcon size={20} weight="fill" />
              </span>
              <p className="mt-3 text-lg font-bold text-ink">
                Kumpulkan gems
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Tukar gems untuk freeze streak, ganti tema, atau buka soal
                latihan ekstra.
              </p>
            </Card>
          </Reveal>

          <Reveal delay={0.15} className="md:col-span-2">
            <Card className="h-full">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                <SparkleIcon size={20} weight="bold" />
              </span>
              <p className="mt-3 text-lg font-bold text-ink">
                4 tipe soal, tanpa bosan
              </p>
              <p className="mt-2 max-w-[48ch] text-sm text-ink-soft">
                Pilihan ganda, isian, mencocokkan, dan soal cerita silih
                berganti supaya latihan tetap terasa segar.
              </p>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="border-y-2 border-line bg-raised">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="mx-auto max-w-[30ch] text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Tiga langkah, mulai hari ini
            </h2>
          </Reveal>

          <div className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
            <span
              className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block"
              aria-hidden
            />
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08} className="relative">
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-surface text-accent">
                    <step.icon size={22} weight="bold" />
                  </span>
                  <p className="mt-4 text-lg font-bold text-ink">
                    {step.title}
                  </p>
                  <p className="mt-1.5 max-w-[32ch] text-sm text-ink-soft">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Photo banner */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="relative overflow-hidden rounded-[var(--radius-card)] border-2 border-line">
          <Image
            src="https://picsum.photos/seed/finantrix-belajar-dimana-saja/1600/700"
            alt="Belajar akuntansi lewat ponsel di sela aktivitas"
            width={1600}
            height={700}
            className="h-[320px] w-full object-cover md:h-[380px]"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <p className="max-w-[24ch] text-2xl font-extrabold text-white md:text-3xl">
              Belajar akuntansi, di mana pun kamu berada
            </p>
            <p className="mt-2 max-w-[40ch] text-sm text-white/85 md:text-base">
              Buka HP, kerjakan satu latihan, lanjut aktivitasmu.
            </p>
          </div>
        </Reveal>
      </section>

      {/* League showcase */}
      <section id="liga" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="max-w-[18ch] text-3xl font-extrabold tracking-tight md:text-4xl">
              Liga mingguan yang bikin nagih
            </h2>
            <p className="mt-4 max-w-[44ch] text-base text-ink-soft">
              Setiap minggu, kamu bersaing dengan pelajar lain di liga yang
              sama. Kumpulkan XP terbanyak untuk naik ke liga berikutnya,
              lengkap dengan hadiah gems.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="flex justify-center lg:justify-end">
            <LeagueMockup />
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y-2 border-line bg-raised">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="mx-auto max-w-[30ch] text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Kata mereka yang sudah mencoba
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <Card className="h-full">
                  <p className="text-[15px] leading-relaxed text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${toneBg[t.tone]}`}
                    >
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">{t.name}</p>
                      <p className="text-xs text-ink-soft">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto max-w-[30ch] text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Gratis untuk mulai, VIP untuk maksimal
          </h2>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
          <Reveal>
            <Card className="h-full">
              <p className="text-lg font-bold text-ink">Gratis</p>
              <p className="mt-1 text-sm text-ink-soft">
                Semua yang kamu perlu untuk mulai belajar.
              </p>
              <ul className="mt-5 flex flex-col gap-3 text-sm text-ink">
                <li className="flex items-center gap-2">
                  <HeartIcon size={18} weight="fill" className="text-danger" />
                  Nyawa terbatas, isi ulang lewat iklan
                </li>
                <li className="flex items-center gap-2">
                  <ChartLineUpIcon
                    size={18}
                    weight="bold"
                    className="text-accent"
                  />
                  Akses penuh ke liga dan rangkaian
                </li>
                <li className="flex items-center gap-2 text-ink-faint">
                  <XIcon size={18} weight="bold" />
                  Ada iklan di beberapa halaman
                </li>
              </ul>
            </Card>
          </Reveal>

          <Reveal delay={0.08}>
            <Card className="h-full border-accent bg-accent-soft">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon
                  size={20}
                  weight="fill"
                  className="text-accent"
                />
                <p className="text-lg font-bold text-ink">VIP</p>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                Belajar tanpa gangguan, progres tanpa batas.
              </p>
              <ul className="mt-5 flex flex-col gap-3 text-sm text-ink">
                <li className="flex items-center gap-2">
                  <HeartIcon size={18} weight="fill" className="text-danger" />
                  Nyawa tak terbatas
                </li>
                <li className="flex items-center gap-2">
                  <CoinIcon size={18} weight="bold" className="text-gem" />
                  Bonus gems setiap bulan
                </li>
                <li className="flex items-center gap-2">
                  <XIcon size={18} weight="bold" className="text-accent" />
                  Tanpa iklan sama sekali
                </li>
              </ul>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-accent">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
          <CalendarCheckIcon
            size={40}
            weight="bold"
            className="text-on-accent"
          />
          <h2 className="max-w-[20ch] text-3xl font-extrabold tracking-tight text-on-accent md:text-4xl">
            Siap mulai rangkaian belajarmu?
          </h2>
          <p className="max-w-[40ch] text-on-accent/85">
            Latihan pertamamu cuma butuh lima menit. Gratis, tanpa kartu
            kredit.
          </p>
          <Link href="/masuk">
            <Button variant="secondary">
              Mulai Gratis
              <ArrowRightIcon size={18} weight="bold" />
            </Button>
          </Link>
        </Reveal>
      </section>

      <footer className="border-t-2 border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent">
                <ChartLineUpIcon size={18} weight="bold" />
              </span>
              <span className="text-base font-extrabold tracking-tight">
                Finantrix
              </span>
            </div>
            <p className="max-w-[32ch] text-sm text-ink-soft">
              Belajar akuntansi dan keuangan lewat latihan singkat setiap
              hari.
            </p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">
                Produk
              </p>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ink-soft hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">
                Akun
              </p>
              <Link
                href="/masuk"
                className="text-sm text-ink-soft hover:text-ink"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-line px-6 py-6 text-center text-xs text-ink-faint">
          Finantrix, dibuat untuk pelajar keuangan Indonesia.
        </div>
      </footer>
    </main>
  );
}
