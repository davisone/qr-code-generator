import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("not_found");

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-stretch h-14">
            <Link
              href="/"
              style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.8rem", letterSpacing: "0.06em", color: "#f0ebe1", textDecoration: "none", display: "flex", alignItems: "center", padding: "0 0.5rem" }}
            >
              useqraft
            </Link>
            <div className="flex items-stretch">
              <Link href="/login" style={{ display: "flex", alignItems: "center", padding: "0 1.25rem", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,235,225,0.5)", fontFamily: "var(--font-sans)", textDecoration: "none" }}>
                {t("login")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Red band */}
      <div style={{ background: "var(--red)", padding: "0.45rem 0" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.85)" }}>
            {t("banner")}
          </span>
        </div>
      </div>

      <main
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-center"
        style={{ paddingTop: "4rem", paddingBottom: "6rem" }}
      >
        <p
          style={{
            fontFamily: "var(--font-display, cursive)",
            fontSize: "clamp(6rem, 20vw, 14rem)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--red)",
            opacity: 0.15,
            userSelect: "none",
            position: "absolute",
            pointerEvents: "none",
          }}
        >
          404
        </p>
        <div style={{ position: "relative", textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "var(--font-display, cursive)",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              letterSpacing: "0.04em",
              color: "var(--ink)",
              lineHeight: 1,
              marginBottom: "1rem",
            }}
          >
            {t("title")}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              color: "var(--mid)",
              marginBottom: "2.5rem",
              maxWidth: "400px",
            }}
          >
            {t("description")}
          </p>
          <Link
            href="/"
            className="btn btn-primary"
          >
            &larr; {t("back_home")}
          </Link>
        </div>
      </main>
    </div>
  );
}
