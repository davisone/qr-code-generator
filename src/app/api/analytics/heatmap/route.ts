import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface HeatmapResponse {
  points: Array<[number, number, number]>;
}

const MAX_POINTS = 10000;
const WINDOW_DAYS = 90;

// GET /api/analytics/heatmap?qrCodeId=
// Retourne les points géolocalisés (lat, lng, intensity=1) des 90 derniers jours.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const qrCodeId = url.searchParams.get("qrCodeId") || undefined;

  if (qrCodeId) {
    const owned = await prisma.qRCode.findFirst({
      where: { id: qrCodeId, userId: user.id },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }
  }

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const scans = await prisma.scan.findMany({
    where: {
      ...(qrCodeId ? { qrCodeId } : { qrCode: { userId: user.id } }),
      scannedAt: { gte: since },
      latitude: { not: null },
      longitude: { not: null },
    },
    select: { latitude: true, longitude: true },
    take: MAX_POINTS,
    orderBy: { scannedAt: "desc" },
  });

  const points: Array<[number, number, number]> = [];
  for (const s of scans) {
    if (s.latitude !== null && s.longitude !== null) {
      points.push([s.latitude, s.longitude, 1]);
    }
  }

  const response: HeatmapResponse = { points };
  return NextResponse.json(response);
}
