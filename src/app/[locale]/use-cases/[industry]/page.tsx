import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BASE_URL, buildHreflang } from "@/lib/config";
import { routing } from "@/i18n/routing";
import { industries } from "@/data/industries";
import { JsonLd } from "@/components/seo-generator/JsonLd";

type Props = { params: Promise<{ locale: string; industry: string }> };

export function generateStaticParams() {
  const params: { locale: string; industry: string }[] = [];
  for (const locale of routing.locales) {
    for (const ind of industries) {
      params.push({ locale, industry: ind.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, industry } = await params;
  const ind = industries.find((i) => i.slug === industry);
  if (!ind) return {};

  const t = await getTranslations({ locale, namespace: "use_cases" });
  const title = t(`${ind.nameKey}.meta_title`);
  const description = t(`${ind.nameKey}.meta_description`);
  const pageUrl = `${BASE_URL}/${locale}/use-cases/${industry}`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl, languages: buildHreflang(`/use-cases/${industry}`) },
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

export default async function IndustryUseCasePage({ params }: Props) {
  const { locale, industry } = await params;
  const ind = industries.find((i) => i.slug === industry);
  if (!ind) notFound();

  const t = await getTranslations({ locale, namespace: "use_cases" });
  const pageUrl = `${BASE_URL}/${locale}/use-cases/${industry}`;
  const industryName = t(`${ind.nameKey}.meta_title`).split(" — ")[0];

  // JSON-LD
  const faqEntries = [1, 2, 3, 4].map((i) => ({
    "@type": "Question" as const,
    name: t(`${ind.nameKey}.faq_q${i}`),
    acceptedAnswer: { "@type": "Answer" as const, text: t(`${ind.nameKey}.faq_a${i}`) },
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
          { "@type": "ListItem", position: 2, name: t("breadcrumb_use_cases"), item: `${BASE_URL}/${locale}/use-cases` },
          { "@type": "ListItem", position: 3, name: industryName, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqEntries,
      },
    ],
  };

  // Cases array from translations
  const casesRaw = t.raw(`${ind.nameKey}.cases`) as Array<{ title: string; description: string }>;

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--mid)", marginBottom: "1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "var(--mid)", textDecoration: "none" }}>{t("breadcrumb_home")}</Link>
            <span>/</span>
            <Link href={"/use-cases" as "/use-cases/restaurant"} style={{ color: "var(--mid)", textDecoration: "none" }}>{t("breadcrumb_use_cases")}</Link>
            <span>/</span>
            <span style={{ color: "var(--ink)", fontWeight: 700 }}>{industryName}</span>
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 6vw, 5rem)", lineHeight: 0.92, letterSpacing: "0.02em", color: "var(--ink)", margin: 0 }}>
            {industryName.toUpperCase()}
          </h1>
          <p style={{ marginTop: "1.5rem", fontSize: "1.05rem", color: "var(--mid)", fontFamily: "var(--font-sans)", maxWidth: "55ch", lineHeight: 1.65 }}>
            {t(`${ind.nameKey}.hero_subtitle`)}
          </p>

          <Link
            href="/register"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "2rem", background: "var(--red)", color: "white", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", padding: "1rem 2.2rem", textDecoration: "none" }}
          >
            {t("cta_button")} →
          </Link>
        </div>
      </section>

      {/* Why section — 3 blocks */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "0.03em", color: "var(--ink)", lineHeight: 1, marginBottom: "2.5rem" }}>
            {t("why_title")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", letterSpacing: "0.04em", color: "var(--ink)", marginBottom: "0.5rem" }}>
                  {t(`${ind.nameKey}.why_${i}.title`)}
                </h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--mid)", lineHeight: 1.65, margin: 0 }}>
                  {t(`${ind.nameKey}.why_${i}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases cards */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "0.03em", color: "var(--ink)", lineHeight: 1, marginBottom: "2.5rem" }}>
            {t("cases_title")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: "var(--rule)" }}>
            {casesRaw.map((c, idx) => (
              <div key={idx} style={{ padding: "2rem", background: "var(--bg)" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.04em", color: "var(--ink)", marginBottom: "0.5rem" }}>
                  {c.title}
                </h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--mid)", lineHeight: 1.6, margin: 0 }}>
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Start — 3 steps */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "0.03em", color: "var(--ink)", lineHeight: 1, marginBottom: "2.5rem" }}>
            {t("how_title")}
          </h2>
          <ol style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--mid)", lineHeight: 1.7, paddingLeft: "1.5rem", margin: 0 }}>
            <li style={{ marginBottom: "0.8rem" }}>{t("how_step_1")}</li>
            <li style={{ marginBottom: "0.8rem" }}>{t("how_step_2")}</li>
            <li>{t("how_step_3")}</li>
          </ol>
        </div>
      </section>

      {/* Recommended generators */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", letterSpacing: "0.03em", color: "var(--ink)", marginBottom: "1.5rem" }}>
            {t("recommended_label")}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {ind.recommendedGenerators.map((gen) => (
              <Link
                key={gen}
                href={`/qr-code-generator/${gen}` as "/qr-code-generator/wifi"}
                style={{ padding: "0.5rem 1rem", border: "var(--rule)", fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--ink)", textDecoration: "none", fontWeight: 600 }}
              >
                {gen.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Link>
            ))}
          </div>

          {/* Link to vertical if exists */}
          {ind.verticalSlug && (
            <div style={{ marginTop: "1.5rem" }}>
              <Link
                href={`/qr-code/${ind.verticalSlug}` as "/qr-code/restaurant"}
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--red)", textDecoration: "none", fontWeight: 600 }}
              >
                {industryName} — QR codes by city →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "0.03em", color: "var(--ink)", lineHeight: 1, marginBottom: "2.5rem" }}>
            {t("faq_title")}
          </h2>
          <div style={{ display: "grid", gap: "2rem", maxWidth: "48rem" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--ink)", fontWeight: 700, marginBottom: "0.4rem" }}>
                  {t(`${ind.nameKey}.faq_q${i}`)}
                </h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--mid)", lineHeight: 1.65, margin: 0 }}>
                  {t(`${ind.nameKey}.faq_a${i}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "var(--red)",
          borderBottom: "var(--rule)",
          padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)",
        }}
      >
        <div
          className="max-w-7xl mx-auto"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "2rem",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 5vw, 4rem)",
                letterSpacing: "0.02em",
                color: "white",
                lineHeight: 0.95,
                marginBottom: "0.8rem",
                maxWidth: "20ch",
              }}
            >
              {t("cta_title")}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.55,
                maxWidth: "48ch",
                margin: 0,
              }}
            >
              {t("cta_body")}
            </p>
          </div>
          <Link
            href="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "white",
              color: "var(--red)",
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "1rem 2.2rem",
              textDecoration: "none",
              flexShrink: 0,
              border: "2px solid white",
            }}
          >
            {t("cta_button")} →
          </Link>
        </div>
      </section>

      {/* Other industries */}
      <section style={{ padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", letterSpacing: "0.03em", color: "var(--ink)", marginBottom: "1.5rem" }}>
            {t("breadcrumb_use_cases")}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {industries
              .filter((i) => i.slug !== industry)
              .map((i) => (
                <Link
                  key={i.slug}
                  href={`/use-cases/${i.slug}` as "/use-cases/restaurant"}
                  style={{ padding: "0.5rem 1rem", border: "var(--rule)", fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--ink)", textDecoration: "none", fontWeight: 600 }}
                >
                  {t(`${i.nameKey}.meta_title`).split(" — ")[0].replace("QR Codes for ", "")}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
