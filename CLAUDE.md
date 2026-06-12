# Finantrix — Project Memory

Gamified accounting & finance learning PWA for the Indonesian market.
Duolingo-style engagement, fintech-grade trust.

## Design System

Always consult `.agents/skills/design-taste-frontend/SKILL.md` (the taste skill)
before generating or modifying any UI component. Apply its principles to every
screen, component, and layout without exception.

Project-specific design decisions (already derived from the skill, do not re-derive):

- **Dials:** DESIGN_VARIANCE 6 / MOTION_INTENSITY 7 / VISUAL_DENSITY 4 (admin: 6)
- **Fonts:** Outfit (display + UI), JetBrains Mono (ALL numbers: XP, gems, timers,
  prices — use the `.num` utility class). Never Inter, never serif.
- **Colors:** tokens only, defined once in `src/app/globals.css`. Accent = emerald.
  Rose only for hearts/errors. Amber only for streak/rewards. Sky only for gems.
  No raw hex in components.
- **Shape system:** buttons & pills full-radius, cards `rounded-card` (16px),
  inputs `rounded-input` (12px). Buttons have a 3px pressed-edge
  (`shadow-[0_3px_0_...]` + `active:translate-y-[3px]`).
- **Motion:** springs only (`type: "spring"`), every animation must be feedback,
  state transition, or reward. All motion respects `useReducedMotion()`.
- **Zero em-dashes (`—`) in any user-facing string.** Use comma or period.
- **Icons:** `@phosphor-icons/react` only, `weight="bold"` (or `"fill"` for
  active states). Never hand-rolled SVG paths.
- **Dark mode:** via `[data-theme]` attribute + CSS variables. Test both modes.

## Stack

- Next.js (App Router) + TypeScript, all product pages are Client Components
- Tailwind v4 with CSS-variable tokens (`@theme inline` in globals.css)
- Firebase: Auth (Google), Firestore (offline persistence on), Cloud Functions
- Motion (`motion/react`) + dotLottie for celebrations
- Web Audio API for sfx (see `src/lib/sound.ts`), Zustand for session state
- Midtrans (primary) / Stripe (stub) via Cloud Functions
- PWA: `src/app/manifest.ts` + hand-rolled `public/sw.js`

## Conventions

- All user-facing copy in Bahasa Indonesia (admin panel English is fine)
- No hardcoded question content — all from Firestore (seed via `scripts/seed.mjs`)
- Mobile-first, 375px base; desktop is a centered `max-w-md` column for the app,
  full-width for admin
- Dark mode supported via CSS custom properties
- Firestore security rules (`firestore.rules`) must be updated with every new
  collection
- Routes are in Bahasa: `/masuk` (login), `/belajar` (learn), `/latihan` (drill),
  `/liga` (league), `/toko` (shop), `/profil` (profile), `/cerita` (story, TODO),
  `/admin` (English)
- Dates that gate game logic (streaks, leagues) are computed in WIB
  (`Asia/Jakarta`) via `src/lib/dates.ts`

## Feature Status

- [x] Auth (Google OAuth, auto profile creation)
- [x] Main Training (4 question types, hearts, XP, sounds, completion screen)
- [x] Drilling (timed, no hearts, score summary)
- [x] Streak System (WIB daily, freezes, milestones, reminder)
- [x] League System (weekly, realtime leaderboard, promo/demo via function)
- [x] Monetization (AdSense slots, rewarded refill, VIP via Midtrans, gem shop)
- [x] Profile (heatmap, badges, league badge, VIP indicator)
- [x] Admin Panel (CRUD, CSV import, preview, analytics, roles)
- [ ] Story Mode (scaffold only: data model + `/cerita` route placeholder)
