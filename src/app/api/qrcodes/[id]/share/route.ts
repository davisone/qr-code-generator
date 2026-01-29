import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const { id } = await params;
  const existing = await prisma.qRCode.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });

  const isPublic = !existing.isPublic;
  const shareToken = isPublic ? (existing.shareToken || uuidv4()) : existing.shareToken;

  const updated = await prisma.qRCode.update({
    where: { id },
    data: { isPublic, shareToken },
  });

  return NextResponse.json(updated);
}
