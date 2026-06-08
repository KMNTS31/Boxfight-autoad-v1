---
name: Session store pattern
description: How express-session is configured with pg fallback for Vercel vs dev
---

# Session Store

Uses `connect-pg-simple` with conditional activation:
```ts
const sessionStore = (() => {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const PgSession = connectPg(session);
    return new PgSession({ conString: dbUrl, createTableIfMissing: true });
  }
  return undefined; // MemoryStore in dev
})();
```

**Why:** Vercel serverless functions are stateless — each invocation may be a new container. In-memory sessions don't persist. PostgreSQL sessions work across all invocations.

**How to apply:** Any time sessions must survive Vercel deployments. The `createTableIfMissing: true` option auto-creates the sessions table without needing a migration.

`connect-pg-simple` is installed in `@workspace/api-server`.
`app.set('trust proxy', 1)` is set in app.ts (required for secure cookies behind Vercel proxy).
Cookie `sameSite: 'none'` is set in production (required for cross-origin Vercel proxy).
