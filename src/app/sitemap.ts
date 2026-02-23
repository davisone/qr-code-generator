import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://qr-aft.vercel.app";
  const currentDate = new Date().toISOString();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const publicQRCodes = await prisma.qRCode.findMany({
      where: {
        isPublic: true,
        shareToken: {
          not: null,
        },
      },
      select: {
        shareToken: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5000,
    });

    const sharedRoutes: MetadataRoute.Sitemap = publicQRCodes
      .filter((qrCode): qrCode is { shareToken: string; updatedAt: Date } => Boolean(qrCode.shareToken))
      .map((qrCode) => ({
        url: `${baseUrl}/share/${encodeURIComponent(qrCode.shareToken)}`,
        lastModified: qrCode.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [...staticRoutes, ...sharedRoutes];
  } catch {
    // Keep sitemap available even if DB is temporarily unreachable.
    return staticRoutes;
  }
}
