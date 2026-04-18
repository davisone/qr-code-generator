import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/api-v1-auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_DAYS = 30;
const MAX_DAYS = 365;

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
  const daysParam = searchParams.get("days");
  let days = DEFAULT_DAYS;
  if (daysParam) {
    const parsed = parseInt(daysParam, 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > MAX_DAYS) {
      return NextResponse.json(
        {
          error: "validation_error",
          message: `\`days\` must be an integer between 1 and ${MAX_DAYS}.`,
        },
        { status: 400, headers: auth.rateHeaders }
      );
    }
    days = parsed;
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const scans = await prisma.scan.findMany({
    where: { qrCodeId: id, scannedAt: { gte: since } },
    orderBy: { scannedAt: "asc" },
    select: {
      scannedAt: true,
      country: true,
      city: true,
      device: true,
      browser: true,
      os: true,
    },
  });

  const totalScans = scans.length;

  const countryCount = new Map<string, number>();
  const cityCount = new Map<string, number>();
  const deviceCount = new Map<string, number>();
  const browserCount = new Map<string, number>();
  const osCount = new Map<string, number>();
  const dayCount = new Map<string, number>();

  for (const scan of scans) {
    if (scan.country) countryCount.set(scan.country, (countryCount.get(scan.country) ?? 0) + 1);
    if (scan.city) cityCount.set(scan.city, (cityCount.get(scan.city) ?? 0) + 1);
    const device = scan.device ?? "unknown";
    deviceCount.set(device, (deviceCount.get(device) ?? 0) + 1);
    const browser = scan.browser ?? "unknown";
    browserCount.set(browser, (browserCount.get(browser) ?? 0) + 1);
    const os = scan.os ?? "unknown";
    osCount.set(os, (osCount.get(os) ?? 0) + 1);

    const day = scan.scannedAt.toISOString().split("T")[0];
    dayCount.set(day, (dayCount.get(day) ?? 0) + 1);
  }

  // Timeline : remplir les jours sans scans
  const timeline: { date: string; scans: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    timeline.push({ date: key, scans: dayCount.get(key) ?? 0 });
  }

  const toSortedArray = <T extends string>(
    map: Map<string, number>,
    fieldName: T
  ): Array<Record<T, string> & { count: number }> =>
    Array.from(map.entries())
      .map(([key, value]) => ({ [fieldName]: key, count: value } as Record<T, string> & { count: number }))
      .sort((a, b) => b.count - a.count);

  return NextResponse.json(
    {
      totalScans,
      uniqueCountries: countryCount.size,
      uniqueCities: cityCount.size,
      byDevice: toSortedArray(deviceCount, "device"),
      byBrowser: toSortedArray(browserCount, "browser"),
      byOs: toSortedArray(osCount, "os"),
      byCountry: toSortedArray(countryCount, "country"),
      timeline,
    },
    { headers: auth.rateHeaders }
  );
}
