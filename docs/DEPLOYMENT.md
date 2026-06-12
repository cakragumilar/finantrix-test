# Finantrix Deployment Guide

## 1. Firebase project setup

1. Create a project at console.firebase.google.com (suggested id: `finantrix-app`,
   update `.firebaserc` if different). Pick region **asia-southeast2 (Jakarta)**
   for Firestore.
2. **Authentication** > Sign-in method > enable **Google**.
3. **Firestore**: create the database, then deploy rules and indexes:
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase deploy --only firestore
   ```
4. Register a **Web app** in Project settings and copy the config into
   `.env.local` (template: `.env.local.example`).

## 2. Seed content and bootstrap admin

```bash
# download a service account key: Project settings > Service accounts
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/seed.mjs
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
  node scripts/grant-superadmin.mjs you@yourdomain.com
```
Sign out and back in after granting; custom claims load on the next token.

## 3. Cloud Functions

```bash
cd functions && npm install && npm run build && cd ..
firebase functions:secrets:set MIDTRANS_SERVER_KEY   # paste your server key
firebase deploy --only functions
```
Functions deployed: `leagueWeeklyReset` (Mon 00:00 WIB), `aggregateDailyActives`,
`sendStreakReminders`, `setAdminRole`, `createMidtransTransaction`,
`midtransWebhook`.

Set the webhook URL in the Midtrans dashboard (Settings > Payment notification):
`https://asia-southeast2-<project-id>.cloudfunctions.net/midtransWebhook`

## 4. Hosting the Next.js app (Firebase App Hosting)

App Hosting builds and serves Next.js natively:

1. Push this repo to GitHub.
2. Firebase console > **App Hosting** > Get started > connect the GitHub repo,
   branch `main`.
3. Add the `NEXT_PUBLIC_*` env vars (plus `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`,
   `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_BANNER` when ready)
   in the App Hosting backend settings.
4. Every push to `main` now builds and deploys automatically with preview
   rollouts available per branch.

## 5. CI (GitHub Actions)

`.github/workflows/ci.yml` lints, typechecks, and builds every PR. On `main`
it additionally deploys Firestore rules/indexes and Functions when the
`FIREBASE_SERVICE_ACCOUNT` secret (service-account JSON) is configured.
Set repo **Variables** for the `NEXT_PUBLIC_FIREBASE_*` values so CI builds
match production config.

## 6. Monetization checklist

- **AdSense**: apply with the production domain; once approved set
  `NEXT_PUBLIC_ADSENSE_CLIENT` + `NEXT_PUBLIC_ADSENSE_SLOT_BANNER`.
  The rewarded-ad flow currently uses a timed placeholder; swap in AdSense
  H5 rewarded inventory when the account is eligible.
- **Midtrans**: sandbox keys work out of the box
  (`NEXT_PUBLIC_MIDTRANS_SNAP_URL` defaults to sandbox). For production set
  the production Snap URL `https://app.midtrans.com/snap/snap.js`, the
  production client key, and update the `MIDTRANS_SERVER_KEY` secret and
  `MIDTRANS_API` constant in `functions/src/index.ts`.

## 7. PWA verification

After deploy, run Lighthouse (mobile) against the production URL:
- Installability: manifest + service worker + icons should pass.
- Performance target ≥ 85, Accessibility ≥ 90.
- Test offline: load a lesson once, go offline, reopen. The app shell comes
  from the service worker; lesson data from Firestore persistence.

## 8. Local development

```bash
cp .env.local.example .env.local   # fill in Firebase web config
npm install
npm run dev
# optional: emulators
firebase emulators:start
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/seed.mjs
```
