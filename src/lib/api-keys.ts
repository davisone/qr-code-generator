import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const API_KEY_PREFIX = "qft_";

/**
 * Génère une nouvelle clé API : qft_<32 chars base64url>.
 * Retourne la clé en clair (à afficher une seule fois), son hash SHA-256
 * et son préfixe (8 premiers caractères visibles).
 */
export function generateApiKey(): { plainKey: string; hash: string; prefix: string } {
  const random = crypto.randomBytes(24).toString("base64url");
  const plainKey = `${API_KEY_PREFIX}${random}`;
  const hash = crypto.createHash("sha256").update(plainKey).digest("hex");
  const prefix = plainKey.slice(0, 8);
  return { plainKey, hash, prefix };
}

/**
 * Hash d'une clé API en clair (SHA-256).
 */
export function hashApiKey(plainKey: string): string {
  return crypto.createHash("sha256").update(plainKey).digest("hex");
}

/**
 * Vérifie un header Authorization: Bearer qft_xxx...
 * Retourne userId + keyId si valide, null sinon.
 * Met à jour lastUsedAt en fire-and-forget.
 */
export async function verifyApiKey(
  authHeader: string | null
): Promise<{ userId: string; keyId: string } | null> {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(\S+)$/);
  if (!match) return null;
  const plainKey = match[1];
  if (!plainKey.startsWith(API_KEY_PREFIX)) return null;

  const hash = hashApiKey(plainKey);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    select: { id: true, userId: true, revokedAt: true },
  });
  if (!apiKey || apiKey.revokedAt) return null;

  // Mise à jour lastUsedAt asynchrone (fire and forget)
  void prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {
      // Silencieux : ne pas casser la requête si l'update échoue
    });

  return { userId: apiKey.userId, keyId: apiKey.id };
}
