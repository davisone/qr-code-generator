import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BASE_URL } from "@/lib/config";
import { verticals } from "@/data/verticals";
import { getCities, cities } from "@/data/cities";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/seo-generator/JsonLd";
import { GeneratorCTA } from "@/components/seo-generator/GeneratorCTA";

type Props = { params: Promise<{ locale: string; vertical: string; city: string }> };

export function generateStaticParams() {
  const params: { locale: string; vertical: string; city: string }[] = [];
  for (const locale of routing.locales) {
    const localeCities = cities[locale] ?? cities.en;
    for (const v of verticals) {
      for (const c of localeCities) {
        params.push({ locale, vertical: v.slug, city: c.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, vertical, city: citySlug } = await params;
  const v = verticals.find((v) => v.slug === vertical);
  const localeCities = getCities(locale);
  const city = localeCities.find((c) => c.slug === citySlug);
  if (!v || !city) return {};

  const t = await getTranslations({ locale, namespace: "programmatic" });
  const vName = t(v.nameKey);
  const title = t("city_meta_title", { vertical: vName, city: city.name });
  const description = t("city_meta_description", { vertical: vName.toLowerCase(), city: city.name });
  const pageUrl = `${BASE_URL}/${locale}/qr-code/${vertical}/${citySlug}`;

  const hreflangAlternates: Record<string, string> = {};
  for (const l of routing.locales) {
    hreflangAlternates[l] = `${BASE_URL}/${l}/qr-code/${vertical}/${citySlug}`;
  }
  hreflangAlternates["x-default"] = `${BASE_URL}/en/qr-code/${vertical}/${citySlug}`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl, languages: hreflangAlternates },
    openGraph: { title, description, url: pageUrl, type: "website", siteName: "useqraft", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
    robots: { index: true, follow: true },
  };
}

export default async function CityVerticalPage({ params }: Props) {
  const { locale, vertical, city: citySlug } = await params;
  const v = verticals.find((v) => v.slug === vertical);
  const localeCities = getCities(locale);
  const city = localeCities.find((c) => c.slug === citySlug);
  if (!v || !city) notFound();

  const t = await getTranslations({ locale, namespace: "programmatic" });
  const ct = await getTranslations({ locale, namespace: "seo_generator" });
  const vName = t(v.nameKey);
  const pageUrl = `${BASE_URL}/${locale}/qr-code/${vertical}/${citySlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#app`,
        name: `QR Code for ${vName} in ${city.name}`,
        url: pageUrl,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", availability: "https://schema.org/InStock" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
          { "@type": "ListItem", position: 2, name: t("breadcrumb_qr_code"), item: `${BASE_URL}/${locale}/qr-code` },
          { "@type": "ListItem", position: 3, name: vName, item: `${BASE_URL}/${locale}/qr-code/${vertical}` },
          { "@type": "ListItem", position: 4, name: city.name, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [1, 2, 3].map((i) => ({
          "@type": "Question",
          name: t(`city_faq_q${i}`, { vertical: vName.toLowerCase(), city: city.name }),
          acceptedAnswer: { "@type": "Answer", text: t(`city_faq_a${i}`, { vertical: vName.toLowerCase(), city: city.name }) },
        })),
      },
    ],
  };

  // Autres villes de la même verticale
  const otherCities = localeCities.filter((c) => c.slug !== citySlug).slice(0, 12);
  // Autres verticales de la même ville
  const otherVerticals = verticals.filter((vt) => vt.slug !== vertical);

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--mid)", marginBottom: "1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "var(--mid)", textDecoration: "none" }}>{t("breadcrumb_home")}</Link>
            <span>/</span>
            <Link href={"/qr-code" as "/qr-code/restaurant"} style={{ color: "var(--mid)", textDecoration: "none" }}>{t("breadcrumb_qr_code")}</Link>
            <span>/</span>
            <Link href={`/qr-code/${vertical}` as "/qr-code/restaurant"} style={{ color: "var(--mid)", textDecoration: "none" }}>{vName}</Link>
            <span>/</span>
            <span style={{ color: "var(--ink)", fontWeight: 700 }}>{city.name}</span>
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 6vw, 5rem)", lineHeight: 0.92, letterSpacing: "0.02em", color: "var(--ink)", margin: 0 }}>
            {t("city_title", { vertical: vName.toUpperCase(), city: city.name.toUpperCase() })}
          </h1>
          <p style={{ marginTop: "1.5rem", fontSize: "1.05rem", color: "var(--mid)", fontFamily: "var(--font-sans)", maxWidth: "55ch", lineHeight: 1.65 }}>
            {t("city_subtitle", { vertical: vName.toLowerCase(), city: city.name })}
          </p>

          <Link
            href={v.generatorPath as "/qr-code-generator/wifi"}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "2rem", background: "var(--red)", color: "white", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", padding: "1rem 2.2rem", textDecoration: "none" }}
          >
            {t("city_cta")} →
          </Link>
        </div>
      </section>

      {/* Contenu SEO */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "0.03em", color: "var(--ink)", lineHeight: 1, marginBottom: "1.2rem" }}>
              {t("why_title", { vertical: vName, city: city.name })}
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--mid)", lineHeight: 1.7 }}>
              {t("why_body_1", { vertical: vName.toLowerCase(), city: city.name })}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--mid)", lineHeight: 1.7, marginTop: "1rem" }}>
              {t("why_body_2", { vertical: vName.toLowerCase(), city: city.name })}
            </p>
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "0.03em", color: "var(--ink)", lineHeight: 1, marginBottom: "1.2rem" }}>
              {t("how_title")}
            </h2>
            <ol style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--mid)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
              <li style={{ marginBottom: "0.8rem" }}>{t("how_step_1")}</li>
              <li style={{ marginBottom: "0.8rem" }}>{t("how_step_2")}</li>
              <li style={{ marginBottom: "0.8rem" }}>{t("how_step_3")}</li>
              <li>{t("how_step_4")}</li>
            </ol>
          </div>
        </div>
      </section>

      {/* CTA */}
      <GeneratorCTA title={ct("common.cta_title")} body={ct("common.cta_body")} button={ct("common.cta_button")} />

      {/* Internal links — autres villes */}
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", letterSpacing: "0.03em", color: "var(--ink)", marginBottom: "1.5rem" }}>
            {t("other_cities_title", { vertical: vName })}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={`/qr-code/${vertical}/${c.slug}` as "/qr-code/restaurant"}
                style={{ padding: "0.5rem 1rem", border: "var(--rule)", fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--ink)", textDecoration: "none", fontWeight: 600 }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links — autres verticales */}
      <section style={{ padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", letterSpacing: "0.03em", color: "var(--ink)", marginBottom: "1.5rem" }}>
            {t("other_verticals_title", { city: city.name })}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {otherVerticals.map((vt) => (
              <Link
                key={vt.slug}
                href={`/qr-code/${vt.slug}/${citySlug}` as "/qr-code/restaurant"}
                style={{ padding: "0.5rem 1rem", border: "var(--rule)", fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--ink)", textDecoration: "none", fontWeight: 600 }}
              >
                {t(vt.nameKey)}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
