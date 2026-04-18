import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";
import { GeneratorHero } from "@/components/seo-generator/GeneratorHero";
import { GeneratorGuide } from "@/components/seo-generator/GeneratorGuide";
import { GeneratorFAQ } from "@/components/seo-generator/GeneratorFAQ";
import { GeneratorCTA } from "@/components/seo-generator/GeneratorCTA";
import { JsonLd } from "@/components/seo-generator/JsonLd";
import { buildGeneratorMetadata } from "../metadata-helpers";
import { VCardGeneratorClient } from "./VCardGeneratorClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });
  return buildGeneratorMetadata({
    locale,
    path: "/qr-code-generator/vcard",
    title: t("vcard.meta_title"),
    description: t("vcard.meta_description"),
  });
}

export default async function VCardGeneratorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });

  const steps = [
    { title: t("vcard.guide.step1.title"), body: t("vcard.guide.step1.body") },
    { title: t("vcard.guide.step2.title"), body: t("vcard.guide.step2.body") },
    { title: t("vcard.guide.step3.title"), body: t("vcard.guide.step3.body") },
    { title: t("vcard.guide.step4.title"), body: t("vcard.guide.step4.body") },
  ];

  const faqItems = [
    { q: t("vcard.faq.q1"), a: t("vcard.faq.a1") },
    { q: t("vcard.faq.q2"), a: t("vcard.faq.a2") },
    { q: t("vcard.faq.q3"), a: t("vcard.faq.a3") },
    { q: t("vcard.faq.q4"), a: t("vcard.faq.a4") },
    { q: t("vcard.faq.q5"), a: t("vcard.faq.a5") },
  ];

  const pageUrl = `${BASE_URL}/${locale}/qr-code-generator/vcard`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#app`,
        name: t("vcard.meta_title"),
        url: pageUrl,
        description: t("vcard.meta_description"),
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
            item: `${BASE_URL}/${locale}/qr-code-generator/vcard`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: t("vcard.breadcrumb"),
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
        kicker={t("vcard.kicker")}
        title={t("vcard.title")}
        subtitle={t("vcard.subtitle")}
      />

      <VCardGeneratorClient />

      <GeneratorGuide
        label={t("vcard.guide.label")}
        title={t("vcard.guide.title")}
        steps={steps}
      />

      <GeneratorCTA
        title={t("common.cta_title")}
        body={t("common.cta_body")}
        button={t("common.cta_button")}
      />

      <GeneratorFAQ
        label={t("common.faq_label")}
        title={t("vcard.faq.title")}
        items={faqItems}
      />
    </>
  );
}
