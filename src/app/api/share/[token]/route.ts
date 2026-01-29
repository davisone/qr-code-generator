import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const qrCode = await prisma.qRCode.findUnique({
    where: { shareToken: token },
  });

  if (!qrCode || !qrCode.isPublic) {
    return NextResponse.json({ error: "QR code introuvable ou non partagé" }, { status: 404 });
  }

  return NextResponse.json({
    id: qrCode.id,
    name: qrCode.name,
    type: qrCode.type,
    content: qrCode.content,
    foregroundColor: qrCode.foregroundColor,
    backgroundColor: qrCode.backgroundColor,
    size: qrCode.size,
    errorCorrection: qrCode.errorCorrection,
    logoDataUrl: qrCode.logoDataUrl,
  });
}
