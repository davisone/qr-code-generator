import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BASE_URL, buildHreflang } from "@/lib/config";
import { routing } from "@/i18n/routing";
import { glossaryTerms } from "@/data/glossary-terms";
import { JsonLd } from "@/components/seo-generator/JsonLd";

type Props = { params: Promise<{ locale: string; term: string }> };

export function generateStaticParams() {
  const params: { locale: string; term: string }[] = [];
  for (const locale of routing.locales) {
    for (const term of glossaryTerms) {
      params.push({ locale, term: term.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, term: slug } = await params;
  const entry = glossaryTerms.find((t) => t.slug === slug);
  if (!entry) return {};

  const t = await getTranslations({ locale, namespace: "glossary" });
  const title = t(`${entry.termKey}.meta_title`);
  const description = t(`${entry.termKey}.meta_description`);
  const pageUrl = `${BASE_URL}/${locale}/glossary/${slug}`;
  const hreflang = buildHreflang(`/glossary/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: pageUrl, languages: hreflang },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      siteName: "useqraft",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
    robots: { index: true, follow: true },
  };
}

const generatorPaths: Record<string, string> = {
  text: "/qr-code-generator/text",
  vcard: "/qr-code-generator/vcard",
  wifi: "/qr-code-generator/wifi",
};

export default async function GlossaryTermPage({ params }: Props) {
  const { locale, term: slug } = await params;
  const entry = glossaryTerms.find((t) => t.slug === slug);
  if (!entry) notFound();

  const t = await getTranslations({ locale, namespace: "glossary" });
  const pageUrl = `${BASE_URL}/${locale}/glossary/${slug}`;

  const relatedEntries = glossaryTerms.filter((rt) => entry.relatedTerms.includes(rt.slug));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        name: t(`${entry.termKey}.title`),
        description: t(`${entry.termKey}.definition`),
        url: pageUrl,
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: t("hub_title"),
          url: `${BASE_URL}/${locale}/glossary`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
          { "@type": "ListItem", position: 2, name: t("breadcrumb_glossary"), item: `${BASE_URL}/${locale}/glossary` },
          { "@type": "ListItem", position: 3, name: t(`${entry.termKey}.title`), item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [1, 2, 3].map((i) => ({
          "@type": "Question",
          name: t(`${entry.termKey}.faq_q${i}`),
          acceptedAnswer: {
            "@type": "Answer",
            text: t(`${entry.termKey}.faq_a${i}`),
          },
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
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--mid)",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={{ color: "var(--mid)", textDecoration: "none" }}>
              {t("breadcrumb_home")}
            </Link>
            <span>/</span>
            <Link href={"/glossary" as "/glossary"} style={{ color: "var(--mid)", textDecoration: "none" }}>
              {t("breadcrumb_glossary")}
            </Link>
            <span>/</span>
            <span style={{ color: "var(--ink)", fontWeight: 700 }}>{t(`${entry.termKey}.title`)}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                padding: "0.35rem 0.8rem",
                border: "var(--rule)",
                color: "var(--mid)",
              }}
            >
              {t("breadcrumb_glossary")}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 6vw, 5rem)",
              lineHeight: 0.92,
              letterSpacing: "0.02em",
              color: "var(--ink)",
              margin: 0,
              marginTop: "1.5rem",
            }}
          >
            {t(`${entry.termKey}.title`).toUpperCase()}
          </h1>
        </div>
      </section>

      {/* Definition */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto" style={{ maxWidth: "48rem" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.1rem",
              color: "var(--ink)",
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            {t(`${entry.termKey}.definition`)}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto" style={{ maxWidth: "48rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              letterSpacing: "0.03em",
              color: "var(--ink)",
              lineHeight: 1,
              marginBottom: "1.5rem",
            }}
          >
            {t("how_title").toUpperCase()}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              color: "var(--mid)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {t(`${entry.termKey}.how_it_works`)}
          </p>
        </div>
      </section>

      {/* Examples */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              letterSpacing: "0.03em",
              color: "var(--ink)",
              lineHeight: 1,
              marginBottom: "2rem",
            }}
          >
            {t("examples_title").toUpperCase()}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  padding: "2rem",
                  border: "var(--rule)",
                  background: "var(--card)",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    letterSpacing: "0.06em",
                    color: "var(--ink)",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  {t(`${entry.termKey}.example_${i}.title`)}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    color: "var(--mid)",
                    lineHeight: 1.65,
                    marginTop: "0.6rem",
                  }}
                >
                  {t(`${entry.termKey}.example_${i}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related terms */}
      {relatedEntries.length > 0 && (
        <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
          <div className="max-w-7xl mx-auto">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                letterSpacing: "0.03em",
                color: "var(--ink)",
                lineHeight: 1,
                marginBottom: "1.5rem",
              }}
            >
              {t("related_terms_title").toUpperCase()}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {relatedEntries.map((rt) => (
                <Link
                  key={rt.slug}
                  href={`/glossary/${rt.slug}` as "/glossary/dynamic-qr-code"}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "var(--rule)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "var(--ink)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  {t(`${rt.termKey}.title`)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related generator */}
      {entry.relatedGenerator && generatorPaths[entry.relatedGenerator] && (
        <section style={{ borderBottom: "var(--rule)", padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)" }}>
          <div className="max-w-7xl mx-auto">
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
                letterSpacing: "0.03em",
                color: "var(--ink)",
                marginBottom: "1rem",
              }}
            >
              {t("related_generator_title").toUpperCase()}
            </h3>
            <Link
              href={generatorPaths[entry.relatedGenerator] as "/qr-code-generator/text"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                border: "var(--rule)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--ink)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              {entry.relatedGenerator.toUpperCase()} →
            </Link>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto" style={{ maxWidth: "48rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              letterSpacing: "0.03em",
              color: "var(--ink)",
              lineHeight: 1,
              marginBottom: "2rem",
            }}
          >
            {t("faq_title").toUpperCase()}
          </h2>
          {[1, 2, 3].map((i) => (
            <details
              key={i}
              style={{
                marginBottom: "1rem",
                border: "var(--rule)",
                background: "var(--card)",
              }}
            >
              <summary
                style={{
                  padding: "1.2rem 1.5rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                  cursor: "pointer",
                  listStyle: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {t(`${entry.termKey}.faq_q${i}`)}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.2rem",
                    color: "var(--mid)",
                    marginLeft: "1rem",
                    flexShrink: 0,
                  }}
                >
                  +
                </span>
              </summary>
              <div style={{ padding: "0 1.5rem 1.2rem" }}>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    color: "var(--mid)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {t(`${entry.termKey}.faq_a${i}`)}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)", textAlign: "center" }}>
        <div className="max-w-7xl mx-auto">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              letterSpacing: "0.03em",
              color: "var(--ink)",
              lineHeight: 1,
              margin: 0,
            }}
          >
            {t("cta_title").toUpperCase()}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "var(--mid)",
              marginTop: "1rem",
              lineHeight: 1.65,
              maxWidth: "45ch",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {t("cta_body")}
          </p>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "2rem",
              background: "var(--red)",
              color: "white",
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "1rem 2.2rem",
              textDecoration: "none",
            }}
          >
            {t("cta_button")} →
          </Link>
        </div>
      </section>
    </>
  );
}
