import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";
import { GeneratorHero } from "@/components/seo-generator/GeneratorHero";
import { GeneratorGuide } from "@/components/seo-generator/GeneratorGuide";
import { GeneratorFAQ } from "@/components/seo-generator/GeneratorFAQ";
import { GeneratorCTA } from "@/components/seo-generator/GeneratorCTA";
import { JsonLd } from "@/components/seo-generator/JsonLd";
import { buildGeneratorMetadata } from "../metadata-helpers";
import { MenuGeneratorClient } from "./MenuGeneratorClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });
  return buildGeneratorMetadata({
    locale,
    path: "/qr-code-generator/menu-restaurant",
    title: t("menu.meta_title"),
    description: t("menu.meta_description"),
  });
}

export default async function MenuGeneratorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });

  const steps = [
    { title: t("menu.guide.step1.title"), body: t("menu.guide.step1.body") },
    { title: t("menu.guide.step2.title"), body: t("menu.guide.step2.body") },
    { title: t("menu.guide.step3.title"), body: t("menu.guide.step3.body") },
    { title: t("menu.guide.step4.title"), body: t("menu.guide.step4.body") },
  ];

  const faqItems = [
    { q: t("menu.faq.q1"), a: t("menu.faq.a1") },
    { q: t("menu.faq.q2"), a: t("menu.faq.a2") },
    { q: t("menu.faq.q3"), a: t("menu.faq.a3") },
    { q: t("menu.faq.q4"), a: t("menu.faq.a4") },
    { q: t("menu.faq.q5"), a: t("menu.faq.a5") },
  ];

  const pageUrl = `${BASE_URL}/${locale}/qr-code-generator/menu-restaurant`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#app`,
        name: t("menu.meta_title"),
        url: pageUrl,
        description: t("menu.meta_description"),
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: t("breadcrumb_home"),
            item: `${BASE_URL}/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: t("breadcrumb_generators"),
            item: `${BASE_URL}/${locale}/qr-code-generator/menu-restaurant`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: t("menu.breadcrumb"),
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <GeneratorHero
        badge={t("common.badge_free")}
        kicker={t("menu.kicker")}
        title={t("menu.title")}
        subtitle={t("menu.subtitle")}
      />

      <MenuGeneratorClient />

      <GeneratorGuide
        label={t("menu.guide.label")}
        title={t("menu.guide.title")}
        steps={steps}
      />

      <GeneratorCTA
        title={t("common.cta_title")}
        body={t("common.cta_body")}
        button={t("common.cta_button")}
      />

      <GeneratorFAQ
        label={t("common.faq_label")}
        title={t("menu.faq.title")}
        items={faqItems}
      />
    </>
  );
}
