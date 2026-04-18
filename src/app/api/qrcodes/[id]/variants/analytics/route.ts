import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const { id } = await params;
  const qrCode = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!qrCode) return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });

  const variants = await prisma.qRVariant.findMany({
    where: { qrCodeId: id },
    orderBy: { createdAt: "asc" },
  });

  if (variants.length === 0) {
    return NextResponse.json({ variants: [], totalScans: 0 });
  }

  const counts = await prisma.scan.groupBy({
    by: ["variantId"],
    where: { qrCodeId: id, variantId: { in: variants.map((v) => v.id) } },
    _count: { _all: true },
  });

  const scanMap = new Map<string, number>();
  for (const c of counts) {
    if (c.variantId) scanMap.set(c.variantId, c._count._all);
  }

  const totalScans = Array.from(scanMap.values()).reduce((a, b) => a + b, 0);

  const enriched = variants.map((v) => {
    const scans = scanMap.get(v.id) ?? 0;
    const percentage = totalScans > 0 ? Math.round((scans / totalScans) * 1000) / 10 : 0;
    return {
      id: v.id,
      label: v.label,
      content: v.content,
      weight: v.weight,
      scans,
      percentage,
    };
  });

  return NextResponse.json({ variants: enriched, totalScans });
}
