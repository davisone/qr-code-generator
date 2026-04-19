import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";
import { GeneratorHero } from "@/components/seo-generator/GeneratorHero";
import { GeneratorGuide } from "@/components/seo-generator/GeneratorGuide";
import { GeneratorFAQ } from "@/components/seo-generator/GeneratorFAQ";
import { GeneratorCTA } from "@/components/seo-generator/GeneratorCTA";
import { JsonLd } from "@/components/seo-generator/JsonLd";
import { buildGeneratorMetadata } from "../metadata-helpers";
import { TextGeneratorClient } from "./TextGeneratorClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });
  return buildGeneratorMetadata({ locale, path: "/qr-code-generator/text", title: t("text.meta_title"), description: t("text.meta_description") });
}

export default async function TextGeneratorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });

  const steps = [
    { title: t("text.guide.step1.title"), body: t("text.guide.step1.body") },
    { title: t("text.guide.step2.title"), body: t("text.guide.step2.body") },
    { title: t("text.guide.step3.title"), body: t("text.guide.step3.body") },
    { title: t("text.guide.step4.title"), body: t("text.guide.step4.body") },
  ];

  const faqItems = [
    { q: t("text.faq.q1"), a: t("text.faq.a1") },
    { q: t("text.faq.q2"), a: t("text.faq.a2") },
    { q: t("text.faq.q3"), a: t("text.faq.a3") },
    { q: t("text.faq.q4"), a: t("text.faq.a4") },
    { q: t("text.faq.q5"), a: t("text.faq.a5") },
  ];

  const pageUrl = `${BASE_URL}/${locale}/qr-code-generator/text`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", "@id": `${pageUrl}#app`, name: t("text.meta_title"), url: pageUrl, description: t("text.meta_description"), applicationCategory: "UtilitiesApplication", operatingSystem: "All", browserRequirements: "Requires JavaScript", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", availability: "https://schema.org/InStock" } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` }, { "@type": "ListItem", position: 2, name: t("breadcrumb_generators"), item: `${BASE_URL}/${locale}/qr-code-generator/text` }, { "@type": "ListItem", position: 3, name: t("text.breadcrumb"), item: pageUrl }] },
      { "@type": "HowTo", name: t("text.guide.title"), step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })) },
      { "@type": "FAQPage", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <GeneratorHero badge={t("common.badge_free")} kicker={t("text.kicker")} title={t("text.title")} subtitle={t("text.subtitle")} />
      <TextGeneratorClient />
      <GeneratorGuide label={t("text.guide.label")} title={t("text.guide.title")} steps={steps} />
      <GeneratorCTA title={t("common.cta_title")} body={t("common.cta_body")} button={t("common.cta_button")} />
      <GeneratorFAQ label={t("common.faq_label")} title={t("text.faq.title")} items={faqItems} />
    </>
  );
}
