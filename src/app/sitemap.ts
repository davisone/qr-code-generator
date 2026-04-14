import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { BASE_URL } from "@/lib/config";

const locales = ["en", "fr", "es", "de", "it", "pt", "nl", "pt-BR", "es-MX", "ja", "zh", "ko"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BASE_URL;
  const currentDate = new Date().toISOString();

  // One entry per locale for the home page
  const homeRoutes: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: locale === "en" || locale === "fr" ? 1.0 : 0.8,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    ...homeRoutes,
    {
      url: `${baseUrl}/en/mentions-legales`,
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
