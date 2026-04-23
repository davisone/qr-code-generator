import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BASE_URL, buildHreflang } from "@/lib/config";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/seo-generator/JsonLd";
import { QR_TEMPLATES, TEMPLATE_CATEGORIES, getTemplateById } from "@/lib/qr-templates";
import type { TemplateCategory } from "@/lib/qr-templates";
import type { QRType } from "@/lib/qr-formats";

type Props = { params: Promise<{ locale: string; slug: string }> };

/* Map QR type to its public generator path */
const TYPE_TO_GENERATOR: Record<QRType, string> = {
  url: "/qr-code-generator/wifi", // fallback — url has no dedicated page, uses wifi as generic
  text: "/qr-code-generator/text",
  wifi: "/qr-code-generator/wifi",
  vcard: "/qr-code-generator/vcard",
  email: "/qr-code-generator/email",
  phone: "/qr-code-generator/phone",
  sms: "/qr-code-generator/sms",
  whatsapp: "/qr-code-generator/whatsapp",
  geo: "/qr-code-generator/location",
  social: "/qr-code-generator/social-media",
  event: "/qr-code-generator/event",
  crypto: "/qr-code-generator/crypto",
};

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const tpl of QR_TEMPLATES) {
      params.push({ locale, slug: tpl.id });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tpl = getTemplateById(slug);
  if (!tpl) return {};

  const t = await getTranslations({ locale, namespace: "qr_templates" });
  const tplKey = slug.replace(/-/g, "_");
  const title = t(`template_${tplKey}_meta_title` as "hub_title");
  const description = t(`template_${tplKey}_meta_description` as "hub_title");
  const pageUrl = `${BASE_URL}/${locale}/qr-templates/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl, languages: buildHreflang(`/qr-templates/${slug}`) },
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

export default async function QRTemplatePage({ params }: Props) {
  const { locale, slug } = await params;
  const tpl = getTemplateById(slug);
  if (!tpl) notFound();

  const t = await getTranslations({ locale, namespace: "qr_templates" });
  const tplKey = slug.replace(/-/g, "_");
  const pageUrl = `${BASE_URL}/${locale}/qr-templates/${slug}`;
  const generatorPath = TYPE_TO_GENERATOR[tpl.type] ?? "/qr-code-generator/wifi";

  const similarTemplates = QR_TEMPLATES.filter(
    (other) => other.category === tpl.category && other.id !== tpl.id,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
          { "@type": "ListItem", position: 2, name: t("breadcrumb_templates"), item: `${BASE_URL}/${locale}/qr-templates` },
          { "@type": "ListItem", position: 3, name: t(`template_${tplKey}_title` as "hub_title"), item: pageUrl },
        ],
      },
      {
        "@type": "Product",
        name: t(`template_${tplKey}_title` as "hub_title"),
        description: t(`template_${tplKey}_description` as "hub_title"),
        url: pageUrl,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
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
            <Link href={"/qr-templates" as "/qr-code/restaurant"} style={{ color: "var(--mid)", textDecoration: "none" }}>
              {t("breadcrumb_templates")}
            </Link>
            <span>/</span>
            <span style={{ color: "var(--ink)", fontWeight: 700 }}>
              {t(`template_${tplKey}_title` as "hub_title")}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "280px" }}>
              <span
                style={{
                  display: "inline-block",
                  marginBottom: "1rem",
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

              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.4rem, 6vw, 4rem)",
                  lineHeight: 0.92,
                  letterSpacing: "0.02em",
                  color: "var(--ink)",
                  margin: 0,
                }}
              >
                {t(`template_${tplKey}_title` as "hub_title")}
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
                {t(`template_${tplKey}_description` as "hub_title")}
              </p>
            </div>

            {/* Color preview */}
            <div
              style={{
                width: 160,
                height: 160,
                background: tpl.defaultStyle.backgroundColor,
                border: "var(--rule)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  background: tpl.defaultStyle.foregroundColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {tpl.defaultStyle.logoEmoji && (
                  <span style={{ fontSize: "2rem" }} aria-hidden="true">
                    {tpl.defaultStyle.logoEmoji}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Includes + Ideal for */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div
          className="max-w-7xl mx-auto"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}
        >
          {/* This template includes */}
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                letterSpacing: "0.03em",
                color: "var(--ink)",
                lineHeight: 1,
                marginBottom: "1.5rem",
              }}
            >
              {t("includes_title")}
            </h2>
            <dl style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--mid)", lineHeight: 1.7, margin: 0 }}>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "0.8rem" }}>
                <dt style={{ fontWeight: 700, color: "var(--ink)", minWidth: "10ch" }}>{t("type_label")}</dt>
                <dd style={{ margin: 0 }}>{tpl.type.toUpperCase()}</dd>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "0.8rem" }}>
                <dt style={{ fontWeight: 700, color: "var(--ink)", minWidth: "10ch" }}>{t("colors_label")}</dt>
                <dd style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      background: tpl.defaultStyle.foregroundColor,
                      border: "1px solid var(--mid)",
                    }}
                  />
                  {tpl.defaultStyle.foregroundColor}
                  <span style={{ margin: "0 0.25rem" }}>/</span>
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      background: tpl.defaultStyle.backgroundColor,
                      border: "1px solid var(--mid)",
                    }}
                  />
                  {tpl.defaultStyle.backgroundColor}
                </dd>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <dt style={{ fontWeight: 700, color: "var(--ink)", minWidth: "10ch" }}>{t("error_correction_label")}</dt>
                <dd style={{ margin: 0 }}>{tpl.defaultStyle.errorCorrection}</dd>
              </div>
            </dl>
          </div>

          {/* Ideal for */}
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                letterSpacing: "0.03em",
                color: "var(--ink)",
                lineHeight: 1,
                marginBottom: "1.5rem",
              }}
            >
              {t("ideal_for_title")}
            </h2>
            <ul
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                color: "var(--mid)",
                lineHeight: 1.7,
                paddingLeft: "1.5rem",
                margin: 0,
              }}
            >
              <li style={{ marginBottom: "0.5rem" }}>{t(`template_${tplKey}_ideal_1` as "hub_title")}</li>
              <li style={{ marginBottom: "0.5rem" }}>{t(`template_${tplKey}_ideal_2` as "hub_title")}</li>
              <li>{t(`template_${tplKey}_ideal_3` as "hub_title")}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)", textAlign: "center" }}>
        <div className="max-w-7xl mx-auto">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              letterSpacing: "0.03em",
              color: "var(--ink)",
              lineHeight: 1,
              marginBottom: "1rem",
            }}
          >
            {t("cta_title")}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "var(--mid)",
              maxWidth: "45ch",
              margin: "0 auto 2rem",
              lineHeight: 1.65,
            }}
          >
            {t("cta_body")}
          </p>
          <Link
            href={generatorPath as "/qr-code-generator/wifi"}
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
            {t("use_template_button")} →
          </Link>
        </div>
      </section>

      {/* Similar templates */}
      {similarTemplates.length > 0 && (
        <section style={{ padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
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
              {t("similar_title")}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              {similarTemplates.map((other) => {
                const otherKey = other.id.replace(/-/g, "_");
                return (
                  <Link
                    key={other.id}
                    href={`/qr-templates/${other.id}` as "/qr-code/restaurant"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1.25rem",
                      border: "var(--rule)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      color: "var(--ink)",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 20,
                        height: 20,
                        background: other.defaultStyle.foregroundColor,
                        border: "1px solid var(--mid)",
                        flexShrink: 0,
                      }}
                    />
                    {t(`template_${otherKey}_title` as "hub_title")}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
