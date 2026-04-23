import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BASE_URL, buildHreflang } from "@/lib/config";
import { routing } from "@/i18n/routing";
import { guides, guideSlugs } from "@/data/guides";
import { glossaryTerms } from "@/data/glossary-terms";
import { JsonLd } from "@/components/seo-generator/JsonLd";
import { GeneratorCTA } from "@/components/seo-generator/GeneratorCTA";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const slug of guideSlugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) return {};

  const t = await getTranslations({ locale, namespace: "guides" });
  const title = t(`${guide.guideKey}.meta_title`);
  const description = t(`${guide.guideKey}.meta_description`);
  const pageUrl = `${BASE_URL}/${locale}/guides/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl, languages: buildHreflang(`/guides/${slug}`) },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      siteName: "useqraft",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
    robots: { index: true, follow: true },
  };
}

export default async function GuidePage({ params }: Props) {
  const { locale, slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();

  const t = await getTranslations({ locale, namespace: "guides" });
  const pageUrl = `${BASE_URL}/${locale}/guides/${slug}`;

  const title = t(`${guide.guideKey}.title`);
  const intro = t(`${guide.guideKey}.intro`);
  const readingTime = t(`${guide.guideKey}.reading_time_minutes`);
  const updatedDate = t(`${guide.guideKey}.updated_date`);

  // Sections
  const sections = Array.from({ length: guide.sectionCount }, (_, i) => ({
    id: `section-${i + 1}`,
    title: t(`${guide.guideKey}.section_${i + 1}_title`),
    content: t(`${guide.guideKey}.section_${i + 1}_content`),
  }));

  // FAQ
  const faqEntries = [1, 2, 3, 4, 5].map((i) => ({
    question: t(`${guide.guideKey}.faq_q${i}`),
    answer: t(`${guide.guideKey}.faq_a${i}`),
  }));

  // Related glossary terms
  const relatedTerms = glossaryTerms.filter((term) => guide.relatedGlossary.includes(term.slug));

  // Other guides
  const otherGuides = guides.filter((g) => g.slug !== slug);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: title,
        description: t(`${guide.guideKey}.meta_description`),
        url: pageUrl,
        publisher: {
          "@type": "Organization",
          name: "useqraft",
          url: BASE_URL,
        },
        dateModified: "2026-04-01",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
          { "@type": "ListItem", position: 2, name: t("breadcrumb_guides"), item: `${BASE_URL}/${locale}/guides` },
          { "@type": "ListItem", position: 3, name: title, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqEntries.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--mid)", marginBottom: "1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "var(--mid)", textDecoration: "none" }}>{t("breadcrumb_home")}</Link>
            <span>/</span>
            <Link href={"/guides" as "/guides/complete-qr-code-guide-2026"} style={{ color: "var(--mid)", textDecoration: "none" }}>{t("breadcrumb_guides")}</Link>
            <span>/</span>
            <span style={{ color: "var(--ink)", fontWeight: 700 }}>{title}</span>
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 6vw, 5rem)", lineHeight: 0.92, letterSpacing: "0.02em", color: "var(--ink)", margin: 0 }}>
            {title.toUpperCase()}
          </h1>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--red)", fontWeight: 600 }}>
              {t("reading_time", { minutes: readingTime })}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)" }}>
              {t("updated", { date: updatedDate })}
            </span>
          </div>

          <p style={{ marginTop: "1.5rem", fontSize: "1.05rem", color: "var(--mid)", fontFamily: "var(--font-sans)", maxWidth: "60ch", lineHeight: 1.65 }}>
            {intro}
          </p>
        </div>
      </section>

      {/* Table of contents */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto" style={{ maxWidth: "48rem" }}>
          <nav aria-label={t("toc_title")}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 2vw, 1.6rem)", letterSpacing: "0.03em", color: "var(--ink)", marginBottom: "1.2rem" }}>
              {t("toc_title")}
            </h2>
            <ol style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--mid)", lineHeight: 2, paddingLeft: "1.5rem", margin: 0 }}>
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} style={{ color: "var(--ink)", textDecoration: "none", fontWeight: 500 }}>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* Content sections */}
      {sections.map((section) => (
        <section key={section.id} id={section.id} style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
          <div className="max-w-7xl mx-auto" style={{ maxWidth: "48rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "0.03em", color: "var(--ink)", lineHeight: 1, marginBottom: "1.2rem" }}>
              {section.title}
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--mid)", lineHeight: 1.7, margin: 0 }}>
              {section.content}
            </p>
          </div>
        </section>
      ))}

      {/* Related glossary terms */}
      {relatedTerms.length > 0 && (
        <section style={{ borderBottom: "var(--rule)", padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)" }}>
          <div className="max-w-7xl mx-auto">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", letterSpacing: "0.03em", color: "var(--ink)", marginBottom: "1.5rem" }}>
              {t("related_glossary_title")}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {relatedTerms.map((term) => (
                <Link
                  key={term.slug}
                  href={`/glossary/${term.slug}` as "/glossary/dynamic-qr-code"}
                  style={{ padding: "0.5rem 1rem", border: "var(--rule)", fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--ink)", textDecoration: "none", fontWeight: 600 }}
                >
                  {term.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "0.03em", color: "var(--ink)", lineHeight: 1, marginBottom: "2.5rem" }}>
            {t("faq_title")}
          </h2>
          <div style={{ display: "grid", gap: "2rem", maxWidth: "48rem" }}>
            {faqEntries.map((faq, idx) => (
              <div key={idx}>
                <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--ink)", fontWeight: 700, marginBottom: "0.4rem" }}>
                  {faq.question}
                </h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--mid)", lineHeight: 1.65, margin: 0 }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <GeneratorCTA title={t("cta_title")} body={t("cta_body")} button={t("cta_button")} />

      {/* Other guides */}
      <section style={{ padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", letterSpacing: "0.03em", color: "var(--ink)", marginBottom: "1.5rem" }}>
            {t("related_guides_title")}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {otherGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}` as "/guides/complete-qr-code-guide-2026"}
                style={{ padding: "0.5rem 1rem", border: "var(--rule)", fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--ink)", textDecoration: "none", fontWeight: 600 }}
              >
                {t(`${g.guideKey}.title`)}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
