import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";

export default function QRExpiredPage() {
  const t = useTranslations("expired");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(5rem, 20vw, 12rem)",
            color: "var(--red)",
            lineHeight: 1,
            opacity: 0.15,
            userSelect: "none",
            marginBottom: "-2rem",
          }}
        >
          QR
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 6vw, 4rem)",
            letterSpacing: "0.04em",
            color: "var(--ink)",
            marginBottom: "1rem",
          }}
        >
          {t("title")}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.95rem",
            color: "var(--mid)",
            maxWidth: "36ch",
            margin: "0 auto 2.5rem",
          }}
        >
          {t("desc")}
        </p>
        <Link
          href="/pricing"
          style={{
            display: "inline-block",
            background: "var(--red)",
            color: "white",
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0.9rem 2rem",
            textDecoration: "none",
          }}
        >
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
