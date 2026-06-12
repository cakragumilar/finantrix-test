# ADR 001: Finantrix Tech Stack

Status: Accepted (user approved, chose Next.js over Vite)
Date: 2026-06-12

## Context

Finantrix is a mobile-first, PWA-capable gamified learning app for the
Indonesian market. Requirements: Google OAuth, non-technical admin content
editing, realtime league standings, AdSense + VIP subscription + hearts
monetization, offline lesson playback.

## Decisions

### Frontend: Next.js (App Router) + TypeScript

The user explicitly selected Next.js over the proposed Vite SPA. Benefits we
take: file-system routing with route groups for the app shell vs admin vs auth,
`next/font` self-hosting, image optimization, and room for SEO'd marketing
pages later. The product surface itself is client-rendered (auth-gated,
realtime Firestore listeners), so pages are Client Components; Next renders
their initial shell statically.

### Styling: Tailwind v4 + CSS-variable design tokens

Tokens defined once in `globals.css` (`:root` + `[data-theme="dark"]`), mapped
into Tailwind via `@theme inline`. No one-off styles, no raw hex in components.
Dark mode is attribute-based so users can override system preference.

### Backend: Firebase (asia-southeast2, Jakarta)

- **Auth**: Google OAuth, one SDK call, free.
- **Firestore**: realtime `onSnapshot` for league leaderboards, offline
  persistence for cached lessons, security rules for per-user data isolation.
- **Cloud Functions**: trusted writes the client must not own: weekly league
  reset (cron at Monday 00:00 WIB), promotion/demotion, Midtrans webhook
  fulfillment, admin custom claims.
- Alternative considered: Supabase. Rejected for this phase: Firestore's
  offline cache and realtime listeners are first-class in the browser SDK,
  and Firebase Hosting/App Hosting integrates CI previews cheaply.

### Animation: Motion (`motion/react`) + dotLottie

Motion for all UI feedback (springs, layout animations); Lottie reserved for
the three celebration moments (streak fire, level-up, league promotion).
Everything gated behind `prefers-reduced-motion`.

### Sound: Web Audio API (no Howler)

The sfx set (correct ding, wrong buzz, complete fanfare, click) is synthesized
with oscillators in `src/lib/sound.ts`. Zero binary assets, zero network
fetches, no licensing. Howler becomes worthwhile only if we move to a recorded
sfx pack; the module's API (`sfx.correct()` etc.) would not change.

### Payments: Midtrans Snap first, Stripe stubbed

Indonesia-first means GoPay/OVO/QRIS/bank transfer, which Midtrans covers.
A `PaymentProvider` interface keeps Stripe as a drop-in for international
users later. Webhook fulfillment happens in Cloud Functions only; the client
never grants itself VIP.

### Ads: Google AdSense

Banner slots between lessons for free users; rewarded flow refills one heart.
Ad components no-op when env keys are absent or the user is VIP.

### PWA: manifest route + hand-rolled service worker

`src/app/manifest.ts` plus a small `public/sw.js` (network-first for
navigation, stale-while-revalidate for static assets). Firestore's own
persistence handles lesson data offline, so the SW only needs the app shell.
Avoids coupling the build to a SW plugin.

### CI/CD: GitHub Actions → Firebase

Lint + typecheck + build on PR; deploy on main. See `docs/DEPLOYMENT.md`.

## Consequences

- Admin content editing requires no deploys: all content lives in Firestore.
- League integrity depends on scheduled Functions; local dev uses seeded data.
- AdSense and Midtrans require account approval before production keys exist;
  both degrade gracefully without keys.
