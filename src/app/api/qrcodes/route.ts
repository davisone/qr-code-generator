import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const body = await req.json();
  const { name, type, content, foregroundColor, backgroundColor, size, errorCorrection, logoDataUrl } = body;

  if (!name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Nom et contenu requis" }, { status: 400 });
  }

  const qrCode = await prisma.qRCode.create({
    data: {
      name: name.trim(),
      type: type || "url",
      content: content.trim(),
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
