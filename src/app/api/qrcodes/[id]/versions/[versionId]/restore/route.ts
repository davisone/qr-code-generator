import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/stripe";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      stripeStatus: true,
      stripeCurrentPeriodEnd: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  if (!isPro(user)) {
    return NextResponse.json({ error: "Abonnement Pro requis" }, { status: 403 });
  }

  const { id, versionId } = await params;
  const existing = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });
  }

  const version = await prisma.qRCodeVersion.findFirst({
    where: { id: versionId, qrCodeId: existing.id },
  });
  if (!version) {
    return NextResponse.json({ error: "Version introuvable" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Archive la version actuelle
    await tx.qRCodeVersion.create({
      data: {
        qrCodeId: existing.id,
        content: existing.content,
        type: existing.type,
        metadata: existing.metadata ?? undefined,
        note: null,
        createdBy: user.id,
      },
    });

    // Applique la version cible
    return tx.qRCode.update({
      where: { id: existing.id },
      data: {
        content: version.content,
        type: version.type,
        metadata: version.metadata ?? undefined,
      },
    });
  });

  return NextResponse.json(updated);
}
