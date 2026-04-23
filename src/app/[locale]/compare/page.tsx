import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BASE_URL, buildHreflang } from "@/lib/config";
import { routing } from "@/i18n/routing";
import { competitors } from "@/data/competitors";
import { JsonLd } from "@/components/seo-generator/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });

  const title = t("meta_title_hub");
  const description = t("meta_description_hub");
  const pageUrl = `${BASE_URL}/${locale}/compare`;
  const hreflang = buildHreflang("/compare");

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

export default async function CompareHubPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });

  const pageUrl = `${BASE_URL}/${locale}/compare`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: t("breadcrumb_compare"), item: pageUrl },
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
            <span style={{ color: "var(--ink)", fontWeight: 700 }}>{t("breadcrumb_compare")}</span>
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

      {/* Competitor Grid */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div
          className="max-w-7xl mx-auto"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {competitors.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}` as "/compare/useqraft-vs-qr-code-generator"}
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
                useqraft vs {c.name}
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
                {t(`${c.nameKey}.tagline`)}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "var(--rule)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--mid)",
                  }}
                >
                  {t("pricing_label")}: {c.pricingNote}
                </span>
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
                  {t("view_comparison")} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)", textAlign: "center" }}>
        <div className="max-w-7xl mx-auto">
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
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
            {t("hub_cta")} →
          </Link>
        </div>
      </section>
    </>
  );
}
