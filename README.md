# ACT Sleep Companion

A private, offline-first sleep companion grounded in **Acceptance and Commitment Therapy (ACT)**. Track a wind-down schedule, log sticky sleep thoughts without trying to “replace” them, play procedural white/pink/brown noise, keep a sleep diary with Spielman-style window titration, and use a gentle-ramp smart alarm.

All data stays in **IndexedDB on your device**. There is no backend and no account.

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm test          # schedule + sleep-math unit tests
npm run build     # production PWA bundle in dist/
npm run preview   # serve the production build locally
```

## What’s included

| Area | What it does |
|------|----------------|
| **Tonight** | Evidence-based wind-down timeline (caffeine, lights, screens, shower, etc.) and wake *window* (±25 min) |
| **Sleep Mode** | Fullscreen dim view, noise, drop-anchor shortcut, smart alarm |
| **Diary** | Morning check-in → sleep efficiency → optional window shrink/expand invitation |
| **Thoughts** | ACT thought log (defusion + willingness + committed action) + exercise library + 5-part ACT-I path |
| **Sounds** | Procedural Web Audio noise (white / pink / brown / rain / ocean / fan) + fade timer |
| **Insights** | Duration bars, efficiency trend, bedtime consistency, rolling sleep debt |
| **Settings** | Schedule, alarm, export/import JSON, warm night overlay |

## Design notes (honest)

- Wake times are a **window**, not fake “90-minute cycle” precision (real cycles vary ~60–150 min).
- ACT here means **unhooking** from thoughts, not CBT-style restructuring. An optional “workable response” field is framed as a response, not a replacement.
- Browser alarms need the tab open and preferably foregrounded. Keep a **backup phone alarm** until you add a native shell.
- Experimental mic/motion “restlessness” waking is **off by default** — consumer sleep-stage guesses are only roughly 66–79% accurate.
- This is a **self-help tool**, not therapy or medical advice. Persistent insomnia (>3 months) deserves a clinician.

## Project layout

```
src/
  app/            shell, settings store
  components/ui/  primitives
  data/           Dexie schema, repository, export/import
  lib/            schedule, sleepMath, audio, alarm
  features/       tonight, diary, act, sounds, insights, settings, onboarding
```

## Deploy to GitHub Pages

This repo ships a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that builds and publishes on every push to `master`.

After the first successful run:

1. Repo **Settings → Pages → Build and deployment → Source**: **GitHub Actions**
2. Open `https://assafthefirst.github.io/actsleepaid/`
3. On Android Chrome: menu → **Install app** / **Add to Home screen**

Local production build with the Pages base path:

```bash
npm run build:pages
npm run preview -- --base /actsleepaid/
```

## Later: hosting (other providers)

The production build is static files in `dist/`. Drop them on any static host (Vercel, Netlify, Cloudflare Pages, S3, etc.):

```bash
npm run build
# deploy dist/
```

## Later: native mobile (Capacitor)

This PWA is structured so you can wrap it without rewriting UI:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "ACT Sleep" com.example.actsleep --web-dir dist
npm install @capacitor/ios @capacitor/android
npx cap add ios   # or android
npm run build && npx cap sync
```

Native wins: reliable local-notification alarms, background audio, optional HealthKit / Health Connect. Keep the `src/data/repo.ts` boundary if you add cloud sync later.

## Privacy

- No analytics, no network calls for app data.
- Export/import JSON from Settings for backup.
- “Reset all” clears IndexedDB.
