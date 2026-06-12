# Finantrix

Aplikasi belajar akuntansi dan keuangan bergaya Duolingo untuk pasar
Indonesia. PWA mobile-first: latihan singkat, hati, runtutan harian, liga
mingguan, dan toko VIP.

## Stack

Next.js (App Router) · Tailwind v4 (token-based design system) · Firebase
(Auth, Firestore, Functions) · Motion + dotLottie · Web Audio sfx ·
Midtrans + AdSense.

## Quick start

```bash
cp .env.local.example .env.local   # isi config Firebase
npm install
npm run dev
```

Dokumentasi:
- [`docs/ADR.md`](docs/ADR.md): keputusan arsitektur
- [`docs/FIRESTORE_SCHEMA.md`](docs/FIRESTORE_SCHEMA.md): skema database
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): panduan deploy lengkap
- [`CLAUDE.md`](CLAUDE.md): project memory + aturan design system

## Struktur fitur

| Route | Fitur |
|---|---|
| `/masuk` | Login Google |
| `/belajar` | Jalur belajar + pemutar pelajaran |
| `/latihan` | Mode drill cepat dengan timer |
| `/liga` | Papan peringkat liga mingguan (realtime) |
| `/toko` | VIP, permata, hati, pembeku runtutan |
| `/profil` | Statistik, heatmap, lencana, pengaturan |
| `/cerita` | Mode cerita (scaffold, TODO) |
| `/admin` | Panel admin: konten, soal, CSV import, analitik, role |
