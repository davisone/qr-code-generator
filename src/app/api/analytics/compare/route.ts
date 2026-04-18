import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface PeriodStats {
  start: string;
  end: string;
  totalScans: number;
  uniqueCountries: number;
  uniqueCities: number;
  topDevice: string | null;
  topBrowser: string | null;
}

interface TimelinePoint {
  date: string;
  currentScans: number;
  previousScans: number;
}

interface CompareResponse {
  current: PeriodStats;
  previous: PeriodStats;
  delta: { scans: number; scansPercent: number };
  timeline: TimelinePoint[];
}

interface ScanRow {
  scannedAt: Date;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
}

const computeTop = (scans: ScanRow[], key: "device" | "browser"): string | null => {
  const counts: Record<string, number> = {};
  for (const s of scans) {
    const v = s[key];
    if (!v) continue;
    counts[v] = (counts[v] || 0) + 1;
  }
  let top: string | null = null;
  let max = 0;
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) {
      max = v;
      top = k;
    }
  }
  return top;
};

const toDateKey = (d: Date): string => d.toISOString().split("T")[0];

// GET /api/analytics/compare?qrCodeId=&days=30
// Compare la période courante (N derniers jours) à la précédente (N jours avant).
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
  const daysRaw = Number(url.searchParams.get("days") ?? "30");
  const days = Number.isFinite(daysRaw) && daysRaw > 0 && daysRaw <= 365 ? Math.floor(daysRaw) : 30;

  // Bornes des deux périodes
  const now = new Date();
  const currentEnd = now;
  const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousEnd = currentStart;
  const previousStart = new Date(currentStart.getTime() - days * 24 * 60 * 60 * 1000);

  // Si un qrCodeId est fourni, on vérifie qu'il appartient au user
  if (qrCodeId) {
    const owned = await prisma.qRCode.findFirst({
      where: { id: qrCodeId, userId: user.id },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }
  }

  const baseWhere = qrCodeId
    ? { qrCodeId }
    : { qrCode: { userId: user.id } };

  const [currentScans, previousScans] = await Promise.all([
    prisma.scan.findMany({
      where: {
        ...baseWhere,
        scannedAt: { gte: previousStart, lt: currentEnd }, // on prend tout pour timeline
      },
      select: {
        scannedAt: true,
        country: true,
        city: true,
        device: true,
        browser: true,
      },
      orderBy: { scannedAt: "asc" },
    }),
    Promise.resolve([] as ScanRow[]),
  ]);

  void previousScans;

  // On sépare les scans par période à partir d'un seul fetch
  const currentPeriodScans: ScanRow[] = [];
  const previousPeriodScans: ScanRow[] = [];
  for (const s of currentScans) {
    if (s.scannedAt >= currentStart) {
      currentPeriodScans.push(s);
    } else if (s.scannedAt >= previousStart) {
      previousPeriodScans.push(s);
    }
  }

  const buildStats = (scans: ScanRow[], start: Date, end: Date): PeriodStats => {
    const countries = new Set<string>();
    const cities = new Set<string>();
    for (const s of scans) {
      if (s.country) countries.add(s.country);
      if (s.city) cities.add(s.city);
    }
    return {
      start: start.toISOString(),
      end: end.toISOString(),
      totalScans: scans.length,
      uniqueCountries: countries.size,
      uniqueCities: cities.size,
      topDevice: computeTop(scans, "device"),
      topBrowser: computeTop(scans, "browser"),
    };
  };

  const current = buildStats(currentPeriodScans, currentStart, currentEnd);
  const previous = buildStats(previousPeriodScans, previousStart, previousEnd);

  const deltaScans = current.totalScans - previous.totalScans;
  const scansPercent =
    previous.totalScans === 0
      ? current.totalScans === 0
        ? 0
        : 100
      : (deltaScans / previous.totalScans) * 100;

  // Timeline alignée : pour chaque jour i de la période courante [0..days-1]
  // on remonte jusqu'à days jours en arrière pour avoir la valeur correspondante.
  const currentBuckets: Record<string, number> = {};
  const previousBuckets: Record<string, number> = {};
  for (const s of currentPeriodScans) {
    const key = toDateKey(s.scannedAt);
    currentBuckets[key] = (currentBuckets[key] || 0) + 1;
  }
  for (const s of previousPeriodScans) {
    const key = toDateKey(s.scannedAt);
    previousBuckets[key] = (previousBuckets[key] || 0) + 1;
  }

  const timeline: TimelinePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const currentDay = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const previousDay = new Date(currentDay.getTime() - days * 24 * 60 * 60 * 1000);
    const currentKey = toDateKey(currentDay);
    const previousKey = toDateKey(previousDay);
    timeline.push({
      date: currentKey,
      currentScans: currentBuckets[currentKey] || 0,
      previousScans: previousBuckets[previousKey] || 0,
    });
  }

  const response: CompareResponse = {
    current,
    previous,
    delta: { scans: deltaScans, scansPercent },
    timeline,
  };

  return NextResponse.json(response);
}
