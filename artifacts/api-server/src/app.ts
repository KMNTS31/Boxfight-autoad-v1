import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust the Vercel/Replit proxy so cookies work correctly
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

// Use PostgreSQL session store when DATABASE_URL is available (production/Vercel),
// otherwise fall back to in-memory store (local dev without DB).
const sessionStore = (() => {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const PgSession = connectPg(session);
    return new PgSession({ conString: dbUrl, createTableIfMissing: true });
  }
  return undefined; // MemoryStore (dev only)
})();

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api", router);

export default app;
