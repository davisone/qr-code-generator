import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";
import { GeneratorHero } from "@/components/seo-generator/GeneratorHero";
import { GeneratorGuide } from "@/components/seo-generator/GeneratorGuide";
import { GeneratorFAQ } from "@/components/seo-generator/GeneratorFAQ";
import { GeneratorCTA } from "@/components/seo-generator/GeneratorCTA";
import { JsonLd } from "@/components/seo-generator/JsonLd";
import { buildGeneratorMetadata } from "../metadata-helpers";
import { LocationGeneratorClient } from "./LocationGeneratorClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });
  return buildGeneratorMetadata({ locale, path: "/qr-code-generator/location", title: t("location.meta_title"), description: t("location.meta_description") });
}

export default async function LocationGeneratorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });

  const steps = [
    { title: t("location.guide.step1.title"), body: t("location.guide.step1.body") },
    { title: t("location.guide.step2.title"), body: t("location.guide.step2.body") },
    { title: t("location.guide.step3.title"), body: t("location.guide.step3.body") },
    { title: t("location.guide.step4.title"), body: t("location.guide.step4.body") },
  ];

  const faqItems = [
    { q: t("location.faq.q1"), a: t("location.faq.a1") },
    { q: t("location.faq.q2"), a: t("location.faq.a2") },
    { q: t("location.faq.q3"), a: t("location.faq.a3") },
    { q: t("location.faq.q4"), a: t("location.faq.a4") },
    { q: t("location.faq.q5"), a: t("location.faq.a5") },
  ];

  const pageUrl = `${BASE_URL}/${locale}/qr-code-generator/location`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", "@id": `${pageUrl}#app`, name: t("location.meta_title"), url: pageUrl, description: t("location.meta_description"), applicationCategory: "UtilitiesApplication", operatingSystem: "All", browserRequirements: "Requires JavaScript", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", availability: "https://schema.org/InStock" } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` }, { "@type": "ListItem", position: 2, name: t("breadcrumb_generators"), item: `${BASE_URL}/${locale}/qr-code-generator/location` }, { "@type": "ListItem", position: 3, name: t("location.breadcrumb"), item: pageUrl }] },
      { "@type": "HowTo", name: t("location.guide.title"), step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })) },
      { "@type": "FAQPage", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <GeneratorHero badge={t("common.badge_free")} kicker={t("location.kicker")} title={t("location.title")} subtitle={t("location.subtitle")} />
      <LocationGeneratorClient />
      <GeneratorGuide label={t("location.guide.label")} title={t("location.guide.title")} steps={steps} />
      <GeneratorCTA title={t("common.cta_title")} body={t("common.cta_body")} button={t("common.cta_button")} />
      <GeneratorFAQ label={t("common.faq_label")} title={t("location.faq.title")} items={faqItems} />
    </>
  );
}
