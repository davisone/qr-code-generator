import { prisma } from "./prisma";

/**
 * Rate limit /api/scan par IP — max 30 scans par minute.
 * Utilise la table Scan existante comme compteur.
 */
export async function checkScanRateLimit(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - 60_000); // 1 minute
  const count = await prisma.scan.count({
    where: { ipAddress: ip, scannedAt: { gte: since } },
  });
  return count < 30;
}

/**
 * Rate limit POST /api/qrcodes par userId — max 30 créations par heure.
 * Utilise la table QRCode existante comme compteur.
 */
export async function checkQRCreateRateLimit(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60_000); // 1 heure
  const count = await prisma.qRCode.count({
    where: { userId, createdAt: { gte: since } },
  });
  return count < 30;
}

/**
 * Rate limit /api/auth/forgot-password par email — max 3 par heure.
 * Utilise la table PasswordResetToken existante comme compteur.
 */
export async function checkForgotPasswordRateLimit(email: string): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60_000); // 1 heure
  const count = await prisma.passwordResetToken.count({
    where: { email, expiresAt: { gte: since } },
  });
  return count < 3;
}

/* ==========================================================================
 * Rate limit API publique v1 — par clé API, fenêtre glissante 1 heure.
 * Stockage in-memory (Map). Acceptable pour MVP : dans un déploiement
 * multi-instance (Vercel serverless), la limite n'est pas partagée entre
 * les instances. À migrer sur Redis / Upstash quand le trafic le justifie.
 * ========================================================================= */

const API_LIMITS = {
  free: { per_hour: 20 },
  pro: { per_hour: 100 },
} as const;

const apiKeyHits = new Map<string, number[]>(); // keyId → timestamps (ms)

export async function checkApiRateLimit(
  keyId: string,
  tier: "free" | "pro"
): Promise<{ ok: boolean; limit: number; remaining: number; resetAt: number }> {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 heure
  const limit = API_LIMITS[tier].per_hour;

  const hits = (apiKeyHits.get(keyId) || []).filter((t) => t > now - windowMs);
  hits.push(now);
  apiKeyHits.set(keyId, hits);

  return {
    ok: hits.length <= limit,
    limit,
    remaining: Math.max(0, limit - hits.length),
    resetAt: Math.floor((hits[0] + windowMs) / 1000),
  };
}
