import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BASE_URL, buildHreflang } from "@/lib/config";
import { routing } from "@/i18n/routing";
import { guides } from "@/data/guides";
import { JsonLd } from "@/components/seo-generator/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guides" });
  const pageUrl = `${BASE_URL}/${locale}/guides`;

  return {
    title: t("meta_title_hub"),
    description: t("meta_description_hub"),
    alternates: { canonical: pageUrl, languages: buildHreflang("/guides") },
    openGraph: {
      title: t("meta_title_hub"),
      description: t("meta_description_hub"),
      url: pageUrl,
      type: "website",
      siteName: "useqraft",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: t("meta_title_hub") }],
    },
    twitter: { card: "summary_large_image", title: t("meta_title_hub"), description: t("meta_description_hub"), images: ["/opengraph-image"] },
    robots: { index: true, follow: true },
  };
}

export default async function GuidesHubPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guides" });
  const pageUrl = `${BASE_URL}/${locale}/guides`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: t("breadcrumb_guides"), item: pageUrl },
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
            <span style={{ color: "var(--ink)", fontWeight: 700 }}>{t("breadcrumb_guides")}</span>
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 6vw, 5rem)", lineHeight: 0.92, letterSpacing: "0.02em", color: "var(--ink)", margin: 0 }}>
            {t("hub_title")}
          </h1>
          <p style={{ marginTop: "1.5rem", fontSize: "1.05rem", color: "var(--mid)", fontFamily: "var(--font-sans)", maxWidth: "60ch", lineHeight: 1.65 }}>
            {t("hub_subtitle")}
          </p>
        </div>
      </section>

      {/* Guide cards */}
      <section style={{ padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1px", background: "var(--rule)" }}>
          {guides.map((guide) => {
            const title = t(`${guide.guideKey}.title`);
            const intro = t(`${guide.guideKey}.intro`);
            const readingTime = t(`${guide.guideKey}.reading_time_minutes`);
            return (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}` as "/guides/complete-qr-code-guide-2026"}
                style={{
                  display: "block",
                  padding: "2.5rem 2rem",
                  background: "var(--bg)",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--red)", marginBottom: "1rem", fontWeight: 600 }}>
                  {t("reading_time", { minutes: readingTime })}
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.1rem, 2vw, 1.4rem)", letterSpacing: "0.03em", color: "var(--ink)", lineHeight: 1.15, marginBottom: "0.8rem" }}>
                  {title}
                </h2>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--mid)", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {intro}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
