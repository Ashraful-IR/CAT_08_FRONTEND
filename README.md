# DocAppoint — Frontend

Doctor-appointment web app: discover doctors, read reviews, book a slot, and manage your visits. Built as the frontend for the finished `CAT_08_BACKEND` API.

## Stack

Next.js 15 (App Router) · JavaScript (no TypeScript, DECISIONS D-009) · Tailwind CSS v4 · shadcn/ui · TanStack Query · React Hook Form + Zod · Vitest + Testing Library + MSW + jest-axe · Playwright · pnpm.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # adjust BACKEND_URL / NEXT_PUBLIC_APP_URL if needed
pnpm dev                     # http://localhost:5002 (backend CORS allowlist)
```

`BACKEND_URL` is **server-only** (used by the API proxy rewrites and Server Components) — never prefix it with `NEXT_PUBLIC_`.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server on port **5002** |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | ESLint (Next core-web-vitals) |
| `pnpm test` | Vitest unit/integration suite (MSW) |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:e2e` | Playwright suite (boots the dev server on 5002; runs against the real backend) |

## Architecture (short version)

- `src/app/` — routes only, thin Server Components; `(auth)` route group for login/register.
- `src/features/<domain>/` — api wrappers (thin over `lib/api/client`), hooks (TanStack Query), Zod schemas, components. Tests co-located.
- `src/lib/api/` — `request.js` core, browser `client.js` (global 401 → `/login?next=…`), `serverFetch` for Server Components, `errors.js`, `types.js` (JSDoc typedefs + Zod schemas validating **every** API response).
- `src/app/api` route handlers are forbidden — the browser talks to the backend through the same-origin `/api/:path*` rewrite (`next.config.mjs`), which keeps the httpOnly `token` cookie first-party and avoids CORS entirely.
- Design tokens (`docs/DESIGN_SYSTEM.md` palette) live in `src/app/globals.css` as Tailwind v4 `@theme inline` variables. Never hard-code colors/spacing/fonts.

## Testing

- **Unit/integration:** `pnpm test` — MSW mirrors the backend contract including error statuses (401/403/404/409); every page/component test carries a jest-axe a11y assertion.
- **E2E:** `pnpm test:e2e` — register → sign-in → booking gate → book → manage/cancel → search, against the real deployed backend. Each run registers a unique `e2e-<timestamp>@example.com` account.

## Deployment (Vercel)

1. Import the repo, framework preset **Next.js** (defaults are fine; no custom build command).
2. Environment variables:
   - `BACKEND_URL` — the backend base URL, e.g. `https://docappoint-backend-tau.vercel.app` (server-only).
   - `NEXT_PUBLIC_APP_URL` — the deployed frontend URL (used by `sitemap.js` / `robots.js`).
3. Cookie caveat (DECISIONS B-002): the backend's cookie is `secure:false; sameSite:lax`. Same-origin proxying keeps it first-party, but ask the backend owner to set `secure:true` in production. If the API is later put on a different domain, the proxy must be kept (CORS allowlist only contains `localhost:5002`, B-005).
4. Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`) are set in `next.config.mjs` for all routes.

## Known backend gaps the frontend works around

See the in-repo decisions log (owner's copy of `docs/DECISIONS.md`): public appointment list leaks bookings (B-001 — used only to grey out booked slots), cookie `secure:false` (B-002), no availability endpoint (D-003 — fixed 09:00–17:00/30-min grid), social sign-in is a mock (B-004 — not built).
