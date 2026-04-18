import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const { id } = await params;
  const qrCode = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!qrCode) {
    return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });
  }

  const versions = await prisma.qRCodeVersion.findMany({
    where: { qrCodeId: qrCode.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(versions);
}
