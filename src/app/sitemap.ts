import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { BASE_URL } from "@/lib/config";
import { getAllSlugs } from "@/lib/blog";
import { competitorSlugs } from "@/data/competitors";
import { industrySlugs } from "@/data/industries";
import { glossaryTermSlugs } from "@/data/glossary-terms";
import { guideSlugs } from "@/data/guides";
import { QR_TEMPLATES } from "@/lib/qr-templates";

const locales = ["en", "fr", "es", "de", "it", "pt", "nl", "pt-BR", "es-MX", "ja", "zh", "ko"];

const generatorTypes = [
  "wifi", "vcard", "menu-restaurant", "google-reviews",
  "whatsapp", "email", "sms", "location", "event",
  "social-media", "pdf", "crypto", "phone", "text", "app-store",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BASE_URL;
  const currentDate = new Date().toISOString();

  // Pages d'accueil par locale
  const homeRoutes: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: locale === "en" || locale === "fr" ? 1.0 : 0.8,
  }));

  // Pages statiques par locale
  const staticPages = ["pricing", "mentions-legales", "cgu", "politique-confidentialite"];
  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}/${page}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: page === "pricing" ? 0.8 : 0.3,
    }))
  );

  // Pages générateurs (15 types × 12 langues = 180 URLs)
  const generatorRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    generatorTypes.map((type) => ({
      url: `${baseUrl}/${locale}/qr-code-generator/${type}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    }))
  );

  // QR codes publics partagés
  let sharedRoutes: MetadataRoute.Sitemap = [];
  try {
    const publicQRCodes = await prisma.qRCode.findMany({
      where: { isPublic: true, shareToken: { not: null } },
      select: { shareToken: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });

    sharedRoutes = publicQRCodes
      .filter((qr): qr is { shareToken: string; updatedAt: Date } => Boolean(qr.shareToken))
      .map((qr) => ({
        url: `${baseUrl}/share/${encodeURIComponent(qr.shareToken)}`,
        lastModified: qr.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    // Fallback silencieux si la DB est inaccessible
  }

  // Blog index par locale
  const blogIndexRoutes: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/blog`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Blog articles
  const blogSlugs = getAllSlugs();
  const blogArticleRoutes: MetadataRoute.Sitemap = blogSlugs.map(({ locale, slug }) => ({
    url: `${baseUrl}/${locale}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Blog catégories
  const blogCategories = ["tutorial", "use-case", "comparison"];
  const blogCategoryRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    blogCategories.map((cat) => ({
      url: `${baseUrl}/${locale}/blog/category/${cat}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  // Pages comparaison (hub + 8 concurrents × 12 locales)
  const compareHubRoutes: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/compare`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  const compareRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    competitorSlugs.map((slug) => ({
      url: `${baseUrl}/${locale}/compare/${slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))
  );

  // Pages use-cases (hub + 18 industries × 12 locales)
  const useCasesHubRoutes: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/use-cases`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));
  const useCasesRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    industrySlugs.map((slug) => ({
      url: `${baseUrl}/${locale}/use-cases/${slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }))
  );

  // Pages glossaire (hub + 25 termes × 12 locales)
  const glossaryHubRoutes: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/glossary`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  const glossaryRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    glossaryTermSlugs.map((slug) => ({
      url: `${baseUrl}/${locale}/glossary/${slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  // Pages guides (hub + 4 guides × 12 locales)
  const guidesHubRoutes: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/guides`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));
  const guidesRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    guideSlugs.map((slug) => ({
      url: `${baseUrl}/${locale}/guides/${slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    }))
  );

  // Pages templates publics (hub + 24 templates × 12 locales)
  const qrTemplatesHubRoutes: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/qr-templates`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));
  const qrTemplatesRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    QR_TEMPLATES.map((tpl) => ({
      url: `${baseUrl}/${locale}/qr-templates/${tpl.id}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }))
  );

  return [
    ...homeRoutes,
    ...staticRoutes,
    ...generatorRoutes,
    ...blogIndexRoutes,
    ...blogArticleRoutes,
    ...blogCategoryRoutes,
    ...sharedRoutes,
    ...compareHubRoutes,
    ...compareRoutes,
    ...useCasesHubRoutes,
    ...useCasesRoutes,
    ...glossaryHubRoutes,
    ...glossaryRoutes,
    ...guidesHubRoutes,
    ...guidesRoutes,
    ...qrTemplatesHubRoutes,
    ...qrTemplatesRoutes,
  ];
}
