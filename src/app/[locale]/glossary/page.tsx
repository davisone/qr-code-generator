import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BASE_URL, buildHreflang } from "@/lib/config";
import { routing } from "@/i18n/routing";
import { glossaryTerms } from "@/data/glossary-terms";
import { JsonLd } from "@/components/seo-generator/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "glossary" });

  const title = t("meta_title_hub");
  const description = t("meta_description_hub");
  const pageUrl = `${BASE_URL}/${locale}/glossary`;
  const hreflang = buildHreflang("/glossary");

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

export default async function GlossaryHubPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "glossary" });

  const pageUrl = `${BASE_URL}/${locale}/glossary`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: t("breadcrumb_glossary"), item: pageUrl },
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
            <span style={{ color: "var(--ink)", fontWeight: 700 }}>{t("breadcrumb_glossary")}</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 6vw, 5rem)",
              lineHeight: 0.92,
              letterSpacing: "0.02em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {t("hub_title").toUpperCase()}
          </h1>
          <p
            style={{
              marginTop: "1.5rem",
              fontSize: "1.05rem",
              color: "var(--mid)",
              fontFamily: "var(--font-sans)",
              maxWidth: "55ch",
              lineHeight: 1.65,
            }}
          >
            {t("hub_subtitle")}
          </p>
        </div>
      </section>

      {/* Term Grid */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div
          className="max-w-7xl mx-auto"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {glossaryTerms.map((term) => {
            const definition = t(`${term.termKey}.definition`);
            const firstSentence = definition.split(". ")[0] + ".";

            return (
              <Link
                key={term.slug}
                href={`/glossary/${term.slug}` as "/glossary/dynamic-qr-code"}
                style={{
                  display: "block",
                  padding: "2rem",
                  border: "var(--rule)",
                  background: "var(--card)",
                  textDecoration: "none",
                  transition: "border-color 0.2s",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    letterSpacing: "0.03em",
                    color: "var(--ink)",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {t(`${term.termKey}.title`)}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "var(--mid)",
                    marginTop: "0.75rem",
                    lineHeight: 1.6,
                  }}
                >
                  {firstSentence}
                </p>
                <div
                  style={{
                    marginTop: "1.5rem",
                    paddingTop: "1rem",
                    borderTop: "var(--rule)",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--red)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {t("breadcrumb_glossary")} →
                  </span>
                </div>
              </Link>
            );
          })}
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
