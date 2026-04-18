import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/stripe";

interface VariantInput {
  label: string;
  content: string;
  weight: number;
}

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const qrCode = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
    select: { id: true, splitMode: true },
  });
  if (!qrCode) return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });

  const variants = await prisma.qRVariant.findMany({
    where: { qrCodeId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ variants, splitMode: qrCode.splitMode });
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
  const qrCode = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!qrCode) return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { variants?: VariantInput[] } | null;
  const inputs = Array.isArray(body?.variants) ? body!.variants : [];

  // Désactivation : variants vides
  if (inputs.length === 0) {
    await prisma.$transaction([
      prisma.qRVariant.deleteMany({ where: { qrCodeId: id } }),
      prisma.qRCode.update({ where: { id }, data: { splitMode: null } }),
    ]);
    return NextResponse.json({ ok: true, disabled: true });
  }

  if (inputs.length < 2 || inputs.length > 5) {
    return NextResponse.json(
      { error: "Entre 2 et 5 variantes requises" },
      { status: 400 }
    );
  }

  // Validation des champs
  for (const v of inputs) {
    if (!v.label?.trim() || !v.content?.trim()) {
      return NextResponse.json(
        { error: "Chaque variante requiert un label et un contenu" },
        { status: 400 }
      );
    }
    if (typeof v.weight !== "number" || v.weight < 0 || v.weight > 100) {
      return NextResponse.json(
        { error: "Poids invalide (0-100)" },
        { status: 400 }
      );
    }
  }

  const totalWeight = inputs.reduce((sum, v) => sum + Math.round(v.weight), 0);
  if (totalWeight !== 100) {
    return NextResponse.json(
      { error: "La somme des poids doit être 100" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.qRVariant.deleteMany({ where: { qrCodeId: id } }),
    prisma.qRVariant.createMany({
      data: inputs.map((v) => ({
        qrCodeId: id,
        label: v.label.trim().slice(0, 40),
        content: v.content.trim(),
        weight: Math.round(v.weight),
      })),
    }),
    prisma.qRCode.update({ where: { id }, data: { splitMode: "ab" } }),
  ]);

  const variants = await prisma.qRVariant.findMany({
    where: { qrCodeId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ ok: true, variants });
}
