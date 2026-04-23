import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BASE_URL, buildHreflang } from "@/lib/config";
import { routing } from "@/i18n/routing";
import { competitors } from "@/data/competitors";
import { JsonLd } from "@/components/seo-generator/JsonLd";

type Props = { params: Promise<{ locale: string; competitor: string }> };

export function generateStaticParams() {
  const params: { locale: string; competitor: string }[] = [];
  for (const locale of routing.locales) {
    for (const c of competitors) {
      params.push({ locale, competitor: c.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, competitor: slug } = await params;
  const comp = competitors.find((c) => c.slug === slug);
  if (!comp) return {};

  const t = await getTranslations({ locale, namespace: "compare" });
  const title = t(`${comp.nameKey}.meta_title`);
  const description = t(`${comp.nameKey}.meta_description`);
  const pageUrl = `${BASE_URL}/${locale}/compare/${slug}`;
  const hreflang = buildHreflang(`/compare/${slug}`);

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

const featureKeys = [
  "free_qr_codes",
  "dynamic_qr",
  "analytics",
  "custom_colors",
  "logo_upload",
  "batch_export",
  "api_access",
  "scan_map",
] as const;

const featureMap: Record<string, keyof typeof competitors[number]["features"]> = {
  free_qr_codes: "freeQrCodes",
  dynamic_qr: "dynamicQr",
  analytics: "analytics",
  custom_colors: "customColors",
  logo_upload: "logoUpload",
  batch_export: "batchExport",
  api_access: "api",
  scan_map: "scanMap",
};

// useqraft features
const useqraftFeatures: Record<string, boolean> = {
  free_qr_codes: true,
  dynamic_qr: true,
  analytics: true,
  custom_colors: true,
  logo_upload: true,
  batch_export: true,
  api_access: true,
  scan_map: true,
};

export default async function CompetitorPage({ params }: Props) {
  const { locale, competitor: slug } = await params;
  const comp = competitors.find((c) => c.slug === slug);
  if (!comp) notFound();

  const t = await getTranslations({ locale, namespace: "compare" });
  const pageUrl = `${BASE_URL}/${locale}/compare/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
          { "@type": "ListItem", position: 2, name: t("breadcrumb_compare"), item: `${BASE_URL}/${locale}/compare` },
          { "@type": "ListItem", position: 3, name: `useqraft vs ${comp.name}`, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [1, 2, 3].map((i) => ({
          "@type": "Question",
          name: t(`faq_q${i}`, { useqraft: "useqraft", competitor: comp.name }),
          acceptedAnswer: {
            "@type": "Answer",
            text: t(`faq_a${i}`, { useqraft: "useqraft", competitor: comp.name }),
          },
        })),
      },
    ],
  };

  const otherCompetitors = competitors.filter((c) => c.slug !== slug);

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
            <Link href={"/compare" as "/compare"} style={{ color: "var(--mid)", textDecoration: "none" }}>
              {t("breadcrumb_compare")}
            </Link>
            <span>/</span>
            <span style={{ color: "var(--ink)", fontWeight: 700 }}>useqraft vs {comp.name}</span>
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
            USEQRAFT VS {comp.name.toUpperCase()}
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
            {t(`${comp.nameKey}.tagline`)}
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "1rem 1rem 1rem 0",
                      borderBottom: "var(--rule)",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--mid)",
                    }}
                  >
                    {t("table_feature")}
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "1rem",
                      borderBottom: "var(--rule)",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--ink)",
                    }}
                  >
                    {t("table_useqraft")}
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "1rem 0 1rem 1rem",
                      borderBottom: "var(--rule)",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--mid)",
                    }}
                  >
                    {comp.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureKeys.map((fk) => {
                  const uVal = useqraftFeatures[fk];
                  const cVal = comp.features[featureMap[fk]];
                  return (
                    <tr key={fk}>
                      <td
                        style={{
                          padding: "0.85rem 1rem 0.85rem 0",
                          borderBottom: "var(--rule)",
                          color: "var(--ink)",
                          fontWeight: 500,
                        }}
                      >
                        {t(fk)}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          padding: "0.85rem 1rem",
                          borderBottom: "var(--rule)",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                        }}
                      >
                        <span style={{ color: uVal ? "#16a34a" : "var(--mid)" }}>{uVal ? "\u2713" : "\u2717"}</span>
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          padding: "0.85rem 0 0.85rem 1rem",
                          borderBottom: "var(--rule)",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                        }}
                      >
                        <span style={{ color: cVal ? "#16a34a" : "var(--mid)" }}>{cVal ? "\u2713" : "\u2717"}</span>
                      </td>
                    </tr>
                  );
                })}
                {/* Pricing row */}
                <tr>
                  <td
                    style={{
                      padding: "0.85rem 1rem 0.85rem 0",
                      borderBottom: "var(--rule)",
                      color: "var(--ink)",
                      fontWeight: 500,
                    }}
                  >
                    {t("pricing_label")}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "0.85rem 1rem",
                      borderBottom: "var(--rule)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      color: "var(--ink)",
                    }}
                  >
                    Free / 8.99&euro;/mo
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "0.85rem 0 0.85rem 1rem",
                      borderBottom: "var(--rule)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      color: "var(--mid)",
                    }}
                  >
                    {comp.pricingNote}
                  </td>
                </tr>
                {/* Free tier row */}
                <tr>
                  <td
                    style={{
                      padding: "0.85rem 1rem 0.85rem 0",
                      color: "var(--ink)",
                      fontWeight: 500,
                    }}
                  >
                    {t("free_tier_label")}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "0.85rem 1rem",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      color: "var(--ink)",
                    }}
                  >
                    Unlimited
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "0.85rem 0 0.85rem 1rem",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      color: "var(--mid)",
                    }}
                  >
                    {comp.freeTier}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why useqraft */}
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
            {t("section_why_title").toUpperCase()}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "2rem",
            }}
          >
            {(["free_analytics", "easy_customization", "multilingual_support"] as const).map((key) => (
              <div key={key}>
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
                  {t(`why_${key}_title`)}
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
                  {t(`why_${key}_desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fair points */}
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
            {t("section_fair_title", { competitor: comp.name }).toUpperCase()}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            <div
              style={{
                padding: "1.5rem",
                border: "var(--rule)",
                background: "var(--card)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  color: "var(--mid)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {t(`${comp.nameKey}.fair_point_1`)}
              </p>
            </div>
            <div
              style={{
                padding: "1.5rem",
                border: "var(--rule)",
                background: "var(--card)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  color: "var(--mid)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {t(`${comp.nameKey}.fair_point_2`)}
              </p>
            </div>
          </div>
        </div>
      </section>

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
            FAQ
          </h2>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ marginBottom: "2rem" }}>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {t(`faq_q${i}`, { useqraft: "useqraft", competitor: comp.name })}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  color: "var(--mid)",
                  lineHeight: 1.65,
                  marginTop: "0.5rem",
                }}
              >
                {t(`faq_a${i}`, { useqraft: "useqraft", competitor: comp.name })}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)", textAlign: "center" }}>
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
            {t("hub_cta").toUpperCase()}
          </h2>
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
            {t("hub_cta")} →
          </Link>
        </div>
      </section>

      {/* Other comparisons */}
      <section style={{ padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
              letterSpacing: "0.03em",
              color: "var(--ink)",
              marginBottom: "1.5rem",
            }}
          >
            {t("back_to_comparisons").toUpperCase()}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {otherCompetitors.map((oc) => (
              <Link
                key={oc.slug}
                href={`/compare/${oc.slug}` as "/compare/useqraft-vs-qr-code-generator"}
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
                vs {oc.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
