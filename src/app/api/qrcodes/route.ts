import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkQRCreateRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const qrCodes = await prisma.qRCode.findMany({
    where: { userId: user.id },
    orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(qrCodes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // Rate limiting : max 30 créations/heure par utilisateur
  const allowed = await checkQRCreateRateLimit(user.id);
  if (!allowed) {
    return NextResponse.json({ error: "Limite de création atteinte. Réessayez dans une heure." }, { status: 429 });
  }

  const body = await req.json();
  const { name, type, content, metadata, category, foregroundColor, backgroundColor, size, errorCorrection, logoDataUrl } = body;

  if (!name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Nom et contenu requis" }, { status: 400 });
  }

  // Validation URL côté serveur
  if (type === "url") {
    try {
      const parsed = new URL(content.trim());
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json({ error: "L'URL doit commencer par http:// ou https://" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }
  }

  const qrCode = await prisma.qRCode.create({
    data: {
      name: name.trim(),
      type: type || "url",
      content: content.trim(),
      metadata: metadata ?? null,
      category: category?.trim() || null,
      foregroundColor: foregroundColor || "#000000",
      backgroundColor: backgroundColor || "#ffffff",
      size: size || 512,
      errorCorrection: errorCorrection || "M",
      logoDataUrl: logoDataUrl || null,
      userId: user.id,
    },
  });

  return NextResponse.json(qrCode, { status: 201 });
}
