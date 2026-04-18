import type { Metadata } from "next";
import { BASE_URL } from "@/lib/config";
import { routing } from "@/i18n/routing";

interface BuildSeoMetaOptions {
  locale: string;
  path: string;
  title: string;
  description: string;
}

/**
 * Build shared SEO metadata for a generator page.
 * Produces canonical + hreflang alternates + OG/Twitter.
 */
export function buildGeneratorMetadata({
  locale,
  path,
  title,
  description,
}: BuildSeoMetaOptions): Metadata {
  const hreflangAlternates: Record<string, string> = {};
  for (const l of routing.locales) {
    hreflangAlternates[l] = `${BASE_URL}/${l}${path}`;
  }
  hreflangAlternates["x-default"] = `${BASE_URL}/en${path}`;

  const canonical = `${BASE_URL}/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: hreflangAlternates,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "QRaft",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
