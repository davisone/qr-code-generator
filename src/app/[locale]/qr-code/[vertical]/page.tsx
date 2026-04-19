import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BASE_URL } from "@/lib/config";
import { verticals, verticalSlugs } from "@/data/verticals";
import { getCities } from "@/data/cities";
import { routing } from "@/i18n/routing";
import { buildGeneratorMetadata } from "../../qr-code-generator/metadata-helpers";

type Props = { params: Promise<{ locale: string; vertical: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    verticalSlugs.map((vertical) => ({ locale, vertical }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, vertical } = await params;
  const v = verticals.find((v) => v.slug === vertical);
  if (!v) return {};
  const t = await getTranslations({ locale, namespace: "programmatic" });
  const name = t(v.nameKey);
  return buildGeneratorMetadata({
    locale,
    path: `/qr-code/${vertical}`,
    title: `QR Code for ${name} — Free Generator | QRaft`,
    description: `Generate QR codes for your ${name.toLowerCase()} business. Free, customizable, with analytics. Find your city below.`,
  });
}

export default async function VerticalIndexPage({ params }: Props) {
  const { locale, vertical } = await params;
  const v = verticals.find((v) => v.slug === vertical);
  if (!v) notFound();

  const t = await getTranslations({ locale, namespace: "programmatic" });
  const citiesList = getCities(locale);
  const name = t(v.nameKey);

  return (
    <>
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--mid)", marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
            <Link href="/" style={{ color: "var(--mid)", textDecoration: "none" }}>{t("breadcrumb_home")}</Link>
            <span>/</span>
            <Link href={"/qr-code" as "/qr-code/restaurant"} style={{ color: "var(--mid)", textDecoration: "none" }}>{t("breadcrumb_qr_code")}</Link>
            <span>/</span>
            <span style={{ color: "var(--ink)", fontWeight: 700 }}>{name}</span>
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 7vw, 5rem)", lineHeight: 0.92, letterSpacing: "0.02em", color: "var(--ink)", margin: 0 }}>
            {t("vertical_title", { vertical: name.toUpperCase() })}
          </h1>
          <p style={{ marginTop: "1.5rem", fontSize: "1.05rem", color: "var(--mid)", fontFamily: "var(--font-sans)", maxWidth: "55ch", lineHeight: 1.65 }}>
            {t("vertical_subtitle", { vertical: name.toLowerCase() })}
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {citiesList.map((city) => (
            <Link
              key={city.slug}
              href={`/qr-code/${vertical}/${city.slug}` as "/qr-code/restaurant"}
              style={{ display: "block", padding: "clamp(1.5rem, 3vw, 2rem)", borderRight: "var(--rule)", borderBottom: "var(--rule)", textDecoration: "none" }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", letterSpacing: "0.03em", color: "var(--ink)", lineHeight: 1 }}>
                {city.name}
              </span>
              <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--mid)", marginTop: "0.4rem" }}>
                {city.country}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
