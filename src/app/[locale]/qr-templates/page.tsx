import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BASE_URL, buildHreflang } from "@/lib/config";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/seo-generator/JsonLd";
import { QR_TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/qr-templates";
import type { TemplateCategory } from "@/lib/qr-templates";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "qr_templates" });
  const title = t("meta_title_hub");
  const description = t("meta_description_hub");
  const pageUrl = `${BASE_URL}/${locale}/qr-templates`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl, languages: buildHreflang("/qr-templates") },
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

export default async function QRTemplatesHub({ params, searchParams }: Props) {
  const { locale } = await params;
  const { category: activeCategory } = await searchParams;
  const t = await getTranslations({ locale, namespace: "qr_templates" });
  const pageUrl = `${BASE_URL}/${locale}/qr-templates`;

  const filteredTemplates = activeCategory
    ? QR_TEMPLATES.filter((tpl) => tpl.category === activeCategory)
    : QR_TEMPLATES;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: t("breadcrumb_templates"), item: pageUrl },
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
            <span style={{ color: "var(--ink)", fontWeight: 700 }}>{t("breadcrumb_templates")}</span>
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
            {t("hub_title")}
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

      {/* Category filter */}
      <section style={{ borderBottom: "var(--rule)", padding: "1.5rem clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <Link
            href={"/qr-templates" as "/qr-code/restaurant"}
            style={{
              padding: "0.5rem 1.2rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              fontWeight: 700,
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              background: !activeCategory ? "var(--ink)" : "transparent",
              color: !activeCategory ? "var(--bg)" : "var(--ink)",
              border: "1px solid var(--ink)",
            }}
          >
            {t("filter_all")}
          </Link>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/qr-templates?category=${cat}` as "/qr-code/restaurant"}
              style={{
                padding: "0.5rem 1.2rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                fontWeight: 700,
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                background: activeCategory === cat ? "var(--ink)" : "transparent",
                color: activeCategory === cat ? "var(--bg)" : "var(--ink)",
                border: "1px solid var(--ink)",
              }}
            >
              {t(`category_${cat}` as `category_${TemplateCategory}`)}
            </Link>
          ))}
        </div>
      </section>

      {/* Template grid */}
      <section style={{ padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div
          className="max-w-7xl mx-auto"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredTemplates.map((tpl) => (
            <Link
              key={tpl.id}
              href={`/qr-templates/${tpl.id}` as "/qr-code/restaurant"}
              style={{
                display: "block",
                border: "var(--rule)",
                padding: "1.5rem",
                textDecoration: "none",
                color: "var(--ink)",
                transition: "box-shadow 0.15s ease",
              }}
            >
              {/* Color preview */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: tpl.defaultStyle.backgroundColor,
                    border: "1px solid var(--rule)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      background: tpl.defaultStyle.foregroundColor,
                    }}
                  />
                </div>
                {tpl.defaultStyle.logoEmoji && (
                  <span style={{ fontSize: "1.5rem" }} aria-hidden="true">
                    {tpl.defaultStyle.logoEmoji}
                  </span>
                )}
              </div>

              {/* Name */}
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  letterSpacing: "0.02em",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {t(`template_${tpl.id.replace(/-/g, "_")}_title` as "hub_title")}
              </h2>

              {/* Category badge */}
              <span
                style={{
                  display: "inline-block",
                  marginTop: "0.6rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--mid)",
                  border: "1px solid var(--mid)",
                  padding: "0.2rem 0.6rem",
                }}
              >
                {t(`category_${tpl.category}` as `category_${TemplateCategory}`)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
