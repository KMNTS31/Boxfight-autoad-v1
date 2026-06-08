import { Router } from "express";
import { db, authorizedUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const ADMIN_IDS = ["1474928810888532061", "1487904327816446233", "1505595777286672485"];

const router = Router();

function getRedirectUri(): string {
  // Explicit override (set this in Vercel dashboard: REDIRECT_URI=https://yourapp.vercel.app/api/auth/discord/callback)
  if (process.env.REDIRECT_URI) return process.env.REDIRECT_URI;

  // Vercel production URL (automatically set by Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/auth/discord/callback`;
  }

  // Replit production domains
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    const primaryDomain = domains.split(",")[0].trim();
    return `https://${primaryDomain}/api/auth/discord/callback`;
  }

  // Replit dev domain
  const devDomain = process.env.REPLIT_DEV_DOMAIN;
  if (devDomain) {
    return `https://${devDomain}/api/auth/discord/callback`;
  }

  return `http://localhost:${process.env.PORT || 5000}/api/auth/discord/callback`;
}

router.get("/auth/discord", (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: "DISCORD_CLIENT_ID not configured" });
    return;
  }
  const redirectUri = getRedirectUri();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify email",
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

router.get("/auth/discord/callback", async (req, res) => {
  const { code } = req.query as { code?: string };
  if (!code) { res.redirect("/?error=no_code"); return; }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) { res.redirect("/?error=missing_config"); return; }

  try {
    const redirectUri = getRedirectUri();
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      logger.error({ status: tokenRes.status }, "Token exchange failed");
      res.redirect("/login?error=token_exchange");
      return;
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) { res.redirect("/login?error=user_fetch"); return; }

    const discordUser = (await userRes.json()) as {
      id: string;
      username: string;
      discriminator: string;
      avatar: string | null;
      email?: string;
    };

    const isAdmin = ADMIN_IDS.includes(discordUser.id);
    let isAuthorized = isAdmin;
    if (!isAdmin) {
      const authUser = await db
        .select()
        .from(authorizedUsersTable)
        .where(eq(authorizedUsersTable.discordId, discordUser.id))
        .limit(1);
      isAuthorized = authUser.length > 0;
    }

    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator || "0") % 5}.png`;

    (req.session as any).user = {
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: avatarUrl,
      email: discordUser.email ?? null,
      isAdmin,
      isAuthorized,
    };

    res.redirect("/dashboard");
  } catch (err) {
    logger.error({ err }, "OAuth callback error");
    res.redirect("/login?error=server_error");
  }
});

router.get("/auth/me", (req, res) => {
  const user = (req.session as any).user;
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }
  res.json({ ...user, hasValidToken: false });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) { logger.error({ err }, "Session destroy error"); res.status(500).json({ error: "Logout failed" }); return; }
    res.json({ success: true, message: "Logged out" });
  });
});

export default router;
