import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisMonth,
    proUsers,
    totalQRCodes,
    scansThisMonth,
    totalScans,
    recentUsers,
    subscriptions,
    dailySignups,
    dailyScans,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { stripeStatus: "active" } }),
    prisma.qRCode.count(),
    prisma.scan.count({ where: { scannedAt: { gte: startOfMonth } } }),
    prisma.scan.count(),

    prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        stripeStatus: true,
        _count: { select: { qrCodes: true } },
      },
    }),

    prisma.user.findMany({
      where: { stripeCustomerId: { not: null } },
      orderBy: { stripeCurrentPeriodEnd: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        stripeStatus: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    }),

    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "User"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    ` as Promise<{ date: Date; count: number }[]>,

    prisma.$queryRaw`
      SELECT DATE("scannedAt") as date, COUNT(*)::int as count
      FROM "Scan"
      WHERE "scannedAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("scannedAt")
      ORDER BY date ASC
    ` as Promise<{ date: Date; count: number }[]>,
  ]);

  const conversionRate = totalUsers > 0
    ? ((proUsers / totalUsers) * 100).toFixed(1)
    : "0";

  const mrr = proUsers * 9.99;

  return NextResponse.json({
    kpis: {
      totalUsers,
      newUsersThisMonth,
      proUsers,
      conversionRate,
      mrr,
      totalQRCodes,
      scansThisMonth,
      totalScans,
    },
    charts: {
      dailySignups,
      dailyScans,
    },
    tables: {
      recentUsers,
      subscriptions,
    },
  });
}
