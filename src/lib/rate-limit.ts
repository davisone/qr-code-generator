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
