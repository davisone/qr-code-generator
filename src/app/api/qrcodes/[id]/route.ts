import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const qrCode = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
  });

  if (!qrCode) return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });
  return NextResponse.json(qrCode);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });

  const body = await req.json();
  const { name, type, content, foregroundColor, backgroundColor, size, errorCorrection, logoDataUrl } = body;

  if (!name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Nom et contenu requis" }, { status: 400 });
  }

  const updated = await prisma.qRCode.update({
    where: { id },
    data: {
      name: name.trim(),
      type: type || "url",
      content: content.trim(),
      foregroundColor: foregroundColor || "#000000",
      backgroundColor: backgroundColor || "#ffffff",
      size: size || 512,
      errorCorrection: errorCorrection || "M",
      logoDataUrl: logoDataUrl !== undefined ? (logoDataUrl || null) : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });

  await prisma.qRCode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
