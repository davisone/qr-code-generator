import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Métadonnées i18n-aware pour la page /templates
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "templates" });

  const title = t("meta_title");
  const description = t("meta_description");
  const canonical = `${BASE_URL}/${locale}/templates`;

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
      siteName: "QRaft",
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

export default function TemplatesLayout({ children }: Props) {
  return <>{children}</>;
}
