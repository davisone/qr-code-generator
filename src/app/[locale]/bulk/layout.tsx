import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Métadonnées i18n-aware pour la page /bulk
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bulk" });

  const title = t("meta_title");
  const description = t("meta_description");
  const canonical = `${BASE_URL}/${locale}/bulk`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "useqraft",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function BulkLayout({ children }: Props) {
  return <>{children}</>;
}
