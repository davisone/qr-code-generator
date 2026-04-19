import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";
import { Link } from "@/i18n/navigation";
import { verticals } from "@/data/verticals";
import { getCities } from "@/data/cities";
import { buildGeneratorMetadata } from "../qr-code-generator/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildGeneratorMetadata({
    locale,
    path: "/qr-code",
    title: "QR Code by Industry — Free Generator for Every Business | QRaft",
    description: "Browse QR code solutions by industry. Restaurant, retail, event, hotel, real estate, museum, salon, gym — find the right QR code for your business.",
  });
}

export default async function QRCodeHubPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "programmatic" });
  const citiesList = getCities(locale);

  return (
    <>
      <section style={{ borderBottom: "var(--rule)", padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <div className="max-w-7xl mx-auto">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--red)", marginBottom: "0.6rem" }}>
            {t("hub_label")}
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 7vw, 6rem)", lineHeight: 0.92, letterSpacing: "0.02em", color: "var(--ink)", margin: 0 }}>
            {t("hub_title")}
          </h1>
          <p style={{ marginTop: "1.5rem", fontSize: "1.05rem", color: "var(--mid)", fontFamily: "var(--font-sans)", maxWidth: "55ch", lineHeight: 1.65 }}>
            {t("hub_subtitle")}
          </p>
        </div>
      </section>

      <section style={{ borderBottom: "var(--rule)" }}>
        <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {verticals.map((v) => (
            <Link
              key={v.slug}
              href={`/qr-code/${v.slug}` as "/qr-code/restaurant"}
              style={{ display: "block", padding: "clamp(2rem, 4vw, 3rem)", borderRight: "var(--rule)", borderBottom: "var(--rule)", textDecoration: "none" }}
            >
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", letterSpacing: "0.03em", color: "var(--ink)", lineHeight: 1, marginBottom: "0.8rem" }}>
                {t(v.nameKey)}
              </h2>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--mid)" }}>
                {citiesList.length} {t("cities_count")}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
