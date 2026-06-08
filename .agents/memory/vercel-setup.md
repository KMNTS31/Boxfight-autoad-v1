---
name: Vercel deployment setup
description: How the app routes, sessions, and OAuth are configured for Vercel deployment
---

# Vercel Deployment

## Architecture
- `vercel.json` at repo root: builds frontend with `pnpm --filter @workspace/boxfight-shop run build`, output at `artifacts/boxfight-shop/dist`
- `api/index.ts` at repo root: exports the Express app (`import app from '../artifacts/api-server/src/app'; export default app;`)
- Rewrite: `/api/(.*)` → `/api` (Express app receives original URL and routes internally)
- SPA fallback: `/((?!api/).*)` → `/index.html`

## OAuth2 Redirect URI
`getRedirectUri()` in `auth.ts` checks in order:
1. `REDIRECT_URI` env var (recommended for Vercel)
2. `VERCEL_URL` env var (set automatically by Vercel)
3. `REPLIT_DOMAINS` (Replit production)
4. `REPLIT_DEV_DOMAIN` (Replit dev)
5. localhost fallback

**Why:** Vercel's deployment URL is not known at build time, so we use the auto-set `VERCEL_URL`, but allow `REDIRECT_URI` override for custom domains.

## Required Vercel env vars
- `SESSION_SECRET` — express-session secret
- `DATABASE_URL` — Postgres connection string (required for pg session store)
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `REDIRECT_URI=https://yourapp.vercel.app/api/auth/discord/callback`

## Discord OAuth setup
In Discord Developer Portal → OAuth2 → Redirects:
- Add `https://yourapp.vercel.app/api/auth/discord/callback`
