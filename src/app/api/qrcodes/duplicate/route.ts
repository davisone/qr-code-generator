import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  const existing = await prisma.qRCode.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });

  const duplicate = await prisma.qRCode.create({
    data: {
      name: `${existing.name} (copie)`,
      type: existing.type,
      content: existing.content,
      foregroundColor: existing.foregroundColor,
      backgroundColor: existing.backgroundColor,
      size: existing.size,
      errorCorrection: existing.errorCorrection,
      logoDataUrl: existing.logoDataUrl,
      userId: user.id,
    },
  });

  const { passwordHash, passwordSalt, ...rest } = duplicate;
  void passwordHash;
  void passwordSalt;
  return NextResponse.json({ ...rest, hasPassword: false }, { status: 201 });
}
