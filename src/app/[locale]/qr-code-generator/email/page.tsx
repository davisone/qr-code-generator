import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";
import { GeneratorHero } from "@/components/seo-generator/GeneratorHero";
import { GeneratorGuide } from "@/components/seo-generator/GeneratorGuide";
import { GeneratorFAQ } from "@/components/seo-generator/GeneratorFAQ";
import { GeneratorCTA } from "@/components/seo-generator/GeneratorCTA";
import { JsonLd } from "@/components/seo-generator/JsonLd";
import { buildGeneratorMetadata } from "../metadata-helpers";
import { EmailGeneratorClient } from "./EmailGeneratorClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });
  return buildGeneratorMetadata({ locale, path: "/qr-code-generator/email", title: t("email.meta_title"), description: t("email.meta_description") });
}

export default async function EmailGeneratorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });

  const steps = [
    { title: t("email.guide.step1.title"), body: t("email.guide.step1.body") },
    { title: t("email.guide.step2.title"), body: t("email.guide.step2.body") },
    { title: t("email.guide.step3.title"), body: t("email.guide.step3.body") },
    { title: t("email.guide.step4.title"), body: t("email.guide.step4.body") },
  ];

  const faqItems = [
    { q: t("email.faq.q1"), a: t("email.faq.a1") },
    { q: t("email.faq.q2"), a: t("email.faq.a2") },
    { q: t("email.faq.q3"), a: t("email.faq.a3") },
    { q: t("email.faq.q4"), a: t("email.faq.a4") },
    { q: t("email.faq.q5"), a: t("email.faq.a5") },
  ];

  const pageUrl = `${BASE_URL}/${locale}/qr-code-generator/email`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", "@id": `${pageUrl}#app`, name: t("email.meta_title"), url: pageUrl, description: t("email.meta_description"), applicationCategory: "UtilitiesApplication", operatingSystem: "All", browserRequirements: "Requires JavaScript", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", availability: "https://schema.org/InStock" } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` }, { "@type": "ListItem", position: 2, name: t("breadcrumb_generators"), item: `${BASE_URL}/${locale}/qr-code-generator/email` }, { "@type": "ListItem", position: 3, name: t("email.breadcrumb"), item: pageUrl }] },
      { "@type": "HowTo", name: t("email.guide.title"), step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })) },
      { "@type": "FAQPage", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <GeneratorHero badge={t("common.badge_free")} kicker={t("email.kicker")} title={t("email.title")} subtitle={t("email.subtitle")} />
      <EmailGeneratorClient />
      <GeneratorGuide label={t("email.guide.label")} title={t("email.guide.title")} steps={steps} />
      <GeneratorCTA title={t("common.cta_title")} body={t("common.cta_body")} button={t("common.cta_button")} />
      <GeneratorFAQ label={t("common.faq_label")} title={t("email.faq.title")} items={faqItems} />
    </>
  );
}
