# Vercel 404 on / — Root Directory Fix

## Answers to the two questions

**1. Where is your `app/` folder?**  
**At repo root.** Full path: `<repo>/app/page.tsx` (and `<repo>/app/layout.tsx`, etc.). There is no `pages/` directory; this is App Router only.

**2. What must Root Directory be in Vercel?**  
**Empty or `.`** so that the project root (where `app/`, `package.json`, `next.config.ts` live) is the build root. If Root Directory is set to anything else (e.g. `src`, `web`, `apps/web`), Vercel builds from that subfolder, which does **not** contain `app/` → no root route → 404.

---

## What to do in Vercel

1. **Vercel Dashboard** → your **coteri** project → **Settings** → **General**.
2. Find **Root Directory**.
3. Set it to **empty** (or explicitly **`.`** if the UI allows).
4. Save, then **Deployments** → **⋮** on latest → **Redeploy** (or push a new commit).

---

## Repo structure (for reference)

```
coteri/                    ← Vercel Root Directory must point here (or be empty)
├── app/
│   ├── page.tsx           ← root route /
│   ├── layout.tsx
│   ├── sign-in/
│   ├── dashboard/
│   └── ...
├── src/
│   ├── components/
│   ├── lib/
│   └── app-legacy/        ← not used (renamed from src/app)
├── package.json
├── next.config.ts         ← only this; no next.config.js
└── ...
```

There is **no** `middleware.ts` at root or `src/middleware.ts` (only `src/lib/auth/middleware.ts`, which is a helper, not Next.js middleware).

---

## Sanity test

Root page is currently the minimal:

```tsx
export default function Page() {
  return <h1>COTERI ROOT TEST</h1>;
}
```

If you still get 404 after fixing Root Directory and redeploying, the deployment is not using this repo root.
