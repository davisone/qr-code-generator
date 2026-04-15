import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomUUID } from "crypto";
import { checkForgotPasswordRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { email, locale } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

    // Rate limiting : max 3 demandes de reset/heure par email
    const allowed = await checkForgotPasswordRateLimit(email);
    if (!allowed) {
      return NextResponse.json({ error: "Trop de demandes. Réessayez dans une heure." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Réponse neutre si email inconnu (anti-énumération)
    if (!user || !user.password) {
      return NextResponse.json({ ok: true });
    }

    // Supprimer les anciens tokens pour cet email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    await sendPasswordResetEmail(email, token, locale ?? "fr");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
