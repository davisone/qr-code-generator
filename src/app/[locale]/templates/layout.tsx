import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";
import { JsonLd } from "@/components/seo-generator/JsonLd";

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

export default async function TemplatesLayout({ children, params }: Props) {
  const { locale } = await params;
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "useqraft", item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: "Templates", item: `${BASE_URL}/${locale}/templates` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      {children}
    </>
  );
}
