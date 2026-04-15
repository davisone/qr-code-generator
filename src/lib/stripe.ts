import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

/**
 * Retourne true si l'utilisateur a un abonnement Pro actif (+ grace period 7j).
 */
export function isPro(user: {
  stripeStatus?: string | null;
  stripeCurrentPeriodEnd?: Date | null;
}): boolean {
  if (user.stripeStatus !== "active") return false;
  if (!user.stripeCurrentPeriodEnd) return false;
  const graceEnd = new Date(user.stripeCurrentPeriodEnd);
  graceEnd.setDate(graceEnd.getDate() + 7);
  return graceEnd > new Date();
}

/**
 * Réactive tous les QR codes d'un utilisateur (expiresAt = null) quand il passe Pro.
 */
export async function reactivateUserQRCodes(userId: string): Promise<void> {
  await prisma.qRCode.updateMany({
    where: { userId },
    data: { expiresAt: null },
  });
}

/**
 * Marque les QR codes Pro comme expirant dans 7j (grace period) quand le sub expire.
 */
export async function expireUserQRCodes(userId: string, periodEnd: Date): Promise<void> {
  const expiresAt = new Date(periodEnd);
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.qRCode.updateMany({
    where: { userId, expiresAt: null },
    data: { expiresAt },
  });
}
