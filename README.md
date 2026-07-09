# Onboarding — standalone

A standalone, decoupled export of the B2B Rocket onboarding flow. Contains only the
onboarding component and its direct dependencies — not the rest of the app.

## Run

```bash
npm install
npm run dev
```

Opens straight to the "Get Started" welcome step (the component's default state).

## Build

```bash
npm run build
npm run preview
```

## Single self-contained HTML file

To produce one HTML file with all JS/CSS/images inlined (no build step needed to
view it — just open it in a browser, or drop it on any static host):

```bash
npm run build:single
```

Outputs `dist-single/index.html`. A copy of the last build is checked in at
`onboarding-standalone.html` for convenience — regenerate it after code changes with:

```bash
npm run build:single && cp dist-single/index.html onboarding-standalone.html
```

## What's here

- `src/onboarding-shell.tsx` — the full onboarding flow, copied from
  `src/app/onboarding/onboarding-shell.tsx` in the main repo, unmodified except for
  a small shim block at the top (see below).
- `src/globals.css` — the subset of CSS custom properties (`--color-*`, `--shadow-*`,
  `--ease-apple`) this component references, extracted from the main app's
  `src/app/globals.css`.
- `public/b2brocket-logo.png` — copied from the main app's `public/` folder.

## Re-integrating into the Next.js app

This file only differs from the original by one shim block near the top, replacing
two Next.js-only imports so it can run outside Next.js:

- `useRouter` from `next/navigation` → shimmed to log + alert instead of navigating.
- `Link` from `next/link` → shimmed to a plain `<a>`.

To move it back into the Next.js app: delete the shim block, re-add `"use client";`
at the top of the file, and restore:

```tsx
import { useRouter } from "next/navigation";
import Link from "next/link";
```

Everything else — every step component, all state, all inline styles — is verbatim.
