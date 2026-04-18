import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/stripe";
import { hashPassword } from "@/lib/qr-password";

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      stripeStatus: true,
      stripeCurrentPeriodEnd: true,
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (!isPro(user)) {
    return NextResponse.json({ error: "Abonnement Pro requis" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password?.trim() ?? "";
  if (password.length < 4) {
    return NextResponse.json({ error: "Mot de passe trop court (min 4)" }, { status: 400 });
  }

  const { hash, salt } = hashPassword(password);

  await prisma.qRCode.update({
    where: { id },
    data: { passwordHash: hash, passwordSalt: salt },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });

  await prisma.qRCode.update({
    where: { id },
    data: { passwordHash: null, passwordSalt: null },
  });

  return NextResponse.json({ ok: true });
}
