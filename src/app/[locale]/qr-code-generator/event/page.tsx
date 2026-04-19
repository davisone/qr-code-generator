import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";
import { GeneratorHero } from "@/components/seo-generator/GeneratorHero";
import { GeneratorGuide } from "@/components/seo-generator/GeneratorGuide";
import { GeneratorFAQ } from "@/components/seo-generator/GeneratorFAQ";
import { GeneratorCTA } from "@/components/seo-generator/GeneratorCTA";
import { JsonLd } from "@/components/seo-generator/JsonLd";
import { buildGeneratorMetadata } from "../metadata-helpers";
import { EventGeneratorClient } from "./EventGeneratorClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });
  return buildGeneratorMetadata({ locale, path: "/qr-code-generator/event", title: t("event.meta_title"), description: t("event.meta_description") });
}

export default async function EventGeneratorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });

  const steps = [
    { title: t("event.guide.step1.title"), body: t("event.guide.step1.body") },
    { title: t("event.guide.step2.title"), body: t("event.guide.step2.body") },
    { title: t("event.guide.step3.title"), body: t("event.guide.step3.body") },
    { title: t("event.guide.step4.title"), body: t("event.guide.step4.body") },
  ];

  const faqItems = [
    { q: t("event.faq.q1"), a: t("event.faq.a1") },
    { q: t("event.faq.q2"), a: t("event.faq.a2") },
    { q: t("event.faq.q3"), a: t("event.faq.a3") },
    { q: t("event.faq.q4"), a: t("event.faq.a4") },
    { q: t("event.faq.q5"), a: t("event.faq.a5") },
  ];

  const pageUrl = `${BASE_URL}/${locale}/qr-code-generator/event`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", "@id": `${pageUrl}#app`, name: t("event.meta_title"), url: pageUrl, description: t("event.meta_description"), applicationCategory: "UtilitiesApplication", operatingSystem: "All", browserRequirements: "Requires JavaScript", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", availability: "https://schema.org/InStock" } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` }, { "@type": "ListItem", position: 2, name: t("breadcrumb_generators"), item: `${BASE_URL}/${locale}/qr-code-generator/event` }, { "@type": "ListItem", position: 3, name: t("event.breadcrumb"), item: pageUrl }] },
      { "@type": "HowTo", name: t("event.guide.title"), step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })) },
      { "@type": "FAQPage", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <GeneratorHero badge={t("common.badge_free")} kicker={t("event.kicker")} title={t("event.title")} subtitle={t("event.subtitle")} />
      <EventGeneratorClient />
      <GeneratorGuide label={t("event.guide.label")} title={t("event.guide.title")} steps={steps} />
      <GeneratorCTA title={t("common.cta_title")} body={t("common.cta_body")} button={t("common.cta_button")} />
      <GeneratorFAQ label={t("common.faq_label")} title={t("event.faq.title")} items={faqItems} />
    </>
  );
}
