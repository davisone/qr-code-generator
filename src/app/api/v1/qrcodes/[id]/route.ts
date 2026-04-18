import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/api-v1-auth";
import { prisma } from "@/lib/prisma";
import { BASE_URL } from "@/lib/config";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const qrCode = await prisma.qRCode.findFirst({
    where: { id, userId: auth.userId },
    include: { _count: { select: { scans: true } } },
  });

  if (!qrCode) {
    return NextResponse.json(
      { error: "not_found", message: "QR code not found." },
      { status: 404, headers: auth.rateHeaders }
    );
  }

  return NextResponse.json(
    {
      id: qrCode.id,
      name: qrCode.name,
      type: qrCode.type,
      content: qrCode.content,
      shareToken: qrCode.shareToken,
      shareUrl: qrCode.shareToken ? `${BASE_URL}/r/${qrCode.shareToken}` : null,
      foregroundColor: qrCode.foregroundColor,
      backgroundColor: qrCode.backgroundColor,
      size: qrCode.size,
      errorCorrection: qrCode.errorCorrection,
      category: qrCode.category,
      isPublic: qrCode.isPublic,
      isFavorite: qrCode.isFavorite,
      scanCount: qrCode._count.scans,
      createdAt: qrCode.createdAt.toISOString(),
      updatedAt: qrCode.updatedAt.toISOString(),
      expiresAt: qrCode.expiresAt ? qrCode.expiresAt.toISOString() : null,
    },
    { headers: auth.rateHeaders }
  );
}
