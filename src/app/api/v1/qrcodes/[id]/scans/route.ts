import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/api-v1-auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  // Vérification ownership
  const qrCode = await prisma.qRCode.findFirst({
    where: { id, userId: auth.userId },
    select: { id: true },
  });
  if (!qrCode) {
    return NextResponse.json(
      { error: "not_found", message: "QR code not found." },
      { status: 404, headers: auth.rateHeaders }
    );
  }

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const cursor = searchParams.get("cursor");

  let limit = DEFAULT_LIMIT;
  if (limitParam) {
    const parsed = parseInt(limitParam, 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > MAX_LIMIT) {
      return NextResponse.json(
        {
          error: "validation_error",
          message: `\`limit\` must be an integer between 1 and ${MAX_LIMIT}.`,
        },
        { status: 400, headers: auth.rateHeaders }
      );
    }
    limit = parsed;
  }

  const scans = await prisma.scan.findMany({
    where: { qrCodeId: id },
    orderBy: { scannedAt: "desc" },
    take: limit + 1, // +1 pour savoir s'il y a une page suivante
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      qrCodeId: true,
      country: true,
      city: true,
      device: true,
      browser: true,
      os: true,
      latitude: true,
      longitude: true,
      scannedAt: true,
    },
  });

  const hasMore = scans.length > limit;
  const data = hasMore ? scans.slice(0, limit) : scans;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return NextResponse.json(
    {
      data: data.map((s) => ({
        id: s.id,
        qrCodeId: s.qrCodeId,
        country: s.country,
        city: s.city,
        device: s.device,
        browser: s.browser,
        os: s.os,
        latitude: s.latitude,
        longitude: s.longitude,
        scannedAt: s.scannedAt.toISOString(),
      })),
      nextCursor,
    },
    { headers: auth.rateHeaders }
  );
}
