import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";
import { GeneratorHero } from "@/components/seo-generator/GeneratorHero";
import { GeneratorGuide } from "@/components/seo-generator/GeneratorGuide";
import { GeneratorFAQ } from "@/components/seo-generator/GeneratorFAQ";
import { GeneratorCTA } from "@/components/seo-generator/GeneratorCTA";
import { JsonLd } from "@/components/seo-generator/JsonLd";
import { buildGeneratorMetadata } from "../metadata-helpers";
import { SmsGeneratorClient } from "./SmsGeneratorClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });
  return buildGeneratorMetadata({ locale, path: "/qr-code-generator/sms", title: t("sms.meta_title"), description: t("sms.meta_description") });
}

export default async function SmsGeneratorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });

  const steps = [
    { title: t("sms.guide.step1.title"), body: t("sms.guide.step1.body") },
    { title: t("sms.guide.step2.title"), body: t("sms.guide.step2.body") },
    { title: t("sms.guide.step3.title"), body: t("sms.guide.step3.body") },
    { title: t("sms.guide.step4.title"), body: t("sms.guide.step4.body") },
  ];

  const faqItems = [
    { q: t("sms.faq.q1"), a: t("sms.faq.a1") },
    { q: t("sms.faq.q2"), a: t("sms.faq.a2") },
    { q: t("sms.faq.q3"), a: t("sms.faq.a3") },
    { q: t("sms.faq.q4"), a: t("sms.faq.a4") },
    { q: t("sms.faq.q5"), a: t("sms.faq.a5") },
  ];

  const pageUrl = `${BASE_URL}/${locale}/qr-code-generator/sms`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", "@id": `${pageUrl}#app`, name: t("sms.meta_title"), url: pageUrl, description: t("sms.meta_description"), applicationCategory: "UtilitiesApplication", operatingSystem: "All", browserRequirements: "Requires JavaScript", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", availability: "https://schema.org/InStock" } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` }, { "@type": "ListItem", position: 2, name: t("breadcrumb_generators"), item: `${BASE_URL}/${locale}/qr-code-generator/sms` }, { "@type": "ListItem", position: 3, name: t("sms.breadcrumb"), item: pageUrl }] },
      { "@type": "HowTo", name: t("sms.guide.title"), step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })) },
      { "@type": "FAQPage", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <GeneratorHero badge={t("common.badge_free")} kicker={t("sms.kicker")} title={t("sms.title")} subtitle={t("sms.subtitle")} />
      <SmsGeneratorClient />
      <GeneratorGuide label={t("sms.guide.label")} title={t("sms.guide.title")} steps={steps} />
      <GeneratorCTA title={t("common.cta_title")} body={t("common.cta_body")} button={t("common.cta_button")} />
      <GeneratorFAQ label={t("common.faq_label")} title={t("sms.faq.title")} items={faqItems} />
    </>
  );
}
