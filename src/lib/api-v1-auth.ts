import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-keys";
import { checkApiRateLimit } from "@/lib/rate-limit";
import { isPro } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Authentifie une requête API v1 :
 * - Vérifie le header Authorization: Bearer qft_...
 * - Résout le tier (free/pro) de l'utilisateur
 * - Applique le rate limit par clé API
 * - Retourne les headers X-RateLimit-* dans la réponse d'erreur si rate limited
 */
export async function authenticateApi(req: NextRequest): Promise<
  | { ok: true; userId: string; keyId: string; tier: "free" | "pro"; rateHeaders: Headers }
  | { ok: false; response: NextResponse }
> {
  const authHeader = req.headers.get("authorization");
  const result = await verifyApiKey(authHeader);
  if (!result) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "invalid_api_key",
          message: "Missing or invalid API key. Use Authorization: Bearer qft_...",
        },
        { status: 401 }
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: result.userId },
    select: { stripeStatus: true, stripeCurrentPeriodEnd: true },
  });

  const userIsPro = user ? isPro(user) : false;
  const tier: "free" | "pro" = userIsPro ? "pro" : "free";

  const rate = await checkApiRateLimit(result.keyId, tier);
  const rateHeaders = new Headers({
    "X-RateLimit-Limit": String(rate.limit),
    "X-RateLimit-Remaining": String(rate.remaining),
    "X-RateLimit-Reset": String(rate.resetAt),
  });

  if (!rate.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "rate_limited",
          message: `Rate limit: ${rate.limit}/hour. Upgrade to Pro for higher limits.`,
        },
        { status: 429, headers: rateHeaders }
      ),
    };
  }

  return { ok: true, userId: result.userId, keyId: result.keyId, tier, rateHeaders };
}
