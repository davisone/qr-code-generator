import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { BASE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site QRaft, édité par DVS Web (Evan Davison).",
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE_URL}/fr/mentions-legales` },
};

const sectionStyle: React.CSSProperties = {
  borderBottom: "var(--rule)",
  padding: "1.5rem 0",
};

const h2Style: React.CSSProperties = {
  fontFamily: "var(--font-display, cursive)",
  fontSize: "1.3rem",
  letterSpacing: "0.04em",
  color: "var(--ink)",
  marginBottom: "0.75rem",
};

const pStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.85rem",
  color: "var(--mid)",
  lineHeight: 1.7,
};

export default function MentionsLegales() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-stretch h-14">
            <Link
              href="/"
              className="flex items-center px-2"
              style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.8rem", letterSpacing: "0.06em", color: "#f0ebe1", textDecoration: "none" }}
            >
              QRaft
            </Link>
            <div className="flex items-stretch">
              <Link href="/login" className="flex items-center px-5 text-xs font-bold uppercase tracking-widest border-l" style={{ color: "rgba(240,235,225,0.5)", borderColor: "rgba(255,255,255,0.08)", fontFamily: "var(--font-sans)", textDecoration: "none" }}>
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Red band */}
      <div style={{ background: "var(--red)", padding: "0.45rem 0" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.85)" }}>
            Informations légales
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.04em", color: "var(--ink)", lineHeight: 1, marginBottom: "2rem" }}>
          Mentions légales
        </h1>

        <div style={{ border: "var(--rule)", background: "var(--card)", padding: "0 1.5rem" }}>
          <section style={sectionStyle}>
            <h2 style={h2Style}>Éditeur du site</h2>
            <p style={pStyle}>
              Le site <strong>QRaft</strong> est édité par <strong>DVS Web</strong>, projet créé par <strong>Evan Davison</strong>.
            </p>
            <ul style={{ ...pStyle, marginTop: "0.75rem", paddingLeft: "1rem", listStyle: "none" }}>
              <li><strong>Raison sociale :</strong> DVS Web</li>
              <li><strong>Responsable de publication :</strong> Evan Davison</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>Hébergement</h2>
            <p style={pStyle}>Le site est hébergé par <strong>Vercel Inc.</strong></p>
            <ul style={{ ...pStyle, marginTop: "0.5rem", paddingLeft: "1rem", listStyle: "none" }}>
              <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
              <li><strong>Site :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", textDecoration: "underline" }}>vercel.com</a></li>
            </ul>
            <p style={{ ...pStyle, marginTop: "0.75rem" }}>La base de données est hébergée par <strong>Supabase Inc.</strong></p>
            <ul style={{ ...pStyle, marginTop: "0.5rem", paddingLeft: "1rem", listStyle: "none" }}>
              <li><strong>Site :</strong> <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", textDecoration: "underline" }}>supabase.com</a></li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>Propriété intellectuelle</h2>
            <p style={pStyle}>
              L&apos;ensemble du contenu de ce site (textes, images, code source, graphismes, logos) est la propriété exclusive de DVS Web (Evan Davison), sauf mention contraire. Toute reproduction, distribution ou utilisation sans autorisation préalable est interdite.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>Protection des données personnelles</h2>
            <p style={pStyle}>
              Les données personnelles collectées (nom, adresse email) sont uniquement utilisées pour le fonctionnement du service. Elles ne sont ni cédées ni vendues à des tiers.
            </p>
            <p style={{ ...pStyle, marginTop: "0.5rem" }}>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression. Pour exercer ces droits, supprimez votre compte ou contactez le responsable de publication.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>Statistiques de scan des QR codes</h2>
            <p style={pStyle}>Lors du scan d&apos;un QR code public, nous collectons les données suivantes à des fins statistiques :</p>
            <ul style={{ ...pStyle, marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
              <li>Date et heure du scan</li>
              <li>Type d&apos;appareil, navigateur et système d&apos;exploitation</li>
              <li>Adresse IP (utilisée pour la géolocalisation approximative, non stockée de manière identifiable)</li>
              <li>Localisation approximative (pays, ville)</li>
            </ul>
            <p style={{ ...pStyle, marginTop: "0.75rem" }}>
              <strong>Base légale :</strong> Intérêt légitime. <strong>Conservation :</strong> Jusqu&apos;à la suppression du QR code.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>Limitation de responsabilité</h2>
            <p style={pStyle}>
              DVS Web s&apos;efforce de fournir des informations précises mais ne saurait être tenu responsable des omissions ou inexactitudes. L&apos;utilisateur est seul responsable de l&apos;utilisation des QR codes générés.
            </p>
          </section>

          <section style={{ padding: "1.5rem 0" }}>
            <h2 style={h2Style}>Cookies</h2>
            <p style={pStyle}>
              Ce site utilise uniquement des cookies strictement nécessaires au fonctionnement (authentification). Aucun cookie publicitaire ou de suivi tiers n&apos;est utilisé.
            </p>
          </section>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <Link href="/" style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", textDecoration: "none" }}>
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
