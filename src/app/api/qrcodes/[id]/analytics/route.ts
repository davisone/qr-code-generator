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
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const { id } = await params;

  // Verify QR code belongs to user
  const qrCode = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
  });

  if (!qrCode) {
    return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });
  }

  // Get all scans for this QR code
  const scans = await prisma.scan.findMany({
    where: { qrCodeId: id },
    orderBy: { scannedAt: "desc" },
  });

  // Calculate stats
  const totalScans = scans.length;

  // Scans by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const scansByDay: Record<string, number> = {};
  const recentScans = scans.filter((s) => s.scannedAt >= thirtyDaysAgo);

  recentScans.forEach((scan) => {
    const date = scan.scannedAt.toISOString().split("T")[0];
    scansByDay[date] = (scansByDay[date] || 0) + 1;
  });

  // Fill in missing days with 0
  const dailyData: { date: string; scans: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    dailyData.push({
      date: dateStr,
      scans: scansByDay[dateStr] || 0,
    });
  }

  // Scans by device
  const deviceStats: Record<string, number> = {};
  scans.forEach((scan) => {
    const device = scan.device || "unknown";
    deviceStats[device] = (deviceStats[device] || 0) + 1;
  });

  // Scans by browser
  const browserStats: Record<string, number> = {};
  scans.forEach((scan) => {
    const browser = scan.browser || "unknown";
    browserStats[browser] = (browserStats[browser] || 0) + 1;
  });

  // Scans by OS
  const osStats: Record<string, number> = {};
  scans.forEach((scan) => {
    const os = scan.os || "unknown";
    osStats[os] = (osStats[os] || 0) + 1;
  });

  // Recent scans (last 10)
  const recentScansList = scans.slice(0, 10).map((scan) => ({
    id: scan.id,
    scannedAt: scan.scannedAt,
    device: scan.device,
    browser: scan.browser,
    os: scan.os,
    country: scan.country,
    city: scan.city,
  }));

  // Scans today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scansToday = scans.filter((s) => s.scannedAt >= today).length;

  // Scans this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const scansThisWeek = scans.filter((s) => s.scannedAt >= weekAgo).length;

  // Scans this month
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const scansThisMonth = scans.filter((s) => s.scannedAt >= monthAgo).length;

  return NextResponse.json({
    totalScans,
    scansToday,
    scansThisWeek,
    scansThisMonth,
    dailyData,
    deviceStats: Object.entries(deviceStats).map(([name, value]) => ({ name, value })),
    browserStats: Object.entries(browserStats).map(([name, value]) => ({ name, value })),
    osStats: Object.entries(osStats).map(([name, value]) => ({ name, value })),
    recentScans: recentScansList,
  });
}
