import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { BASE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de useqraft — comment vos données personnelles sont collectées, utilisées et protégées.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE_URL}/fr/politique-confidentialite` },
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

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: "var(--font-sans)",
  fontSize: "0.82rem",
  color: "var(--mid)",
  marginTop: "0.75rem",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  background: "rgba(0,0,0,0.04)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontSize: "0.7rem",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid rgba(0,0,0,0.05)",
  verticalAlign: "top",
};

export default function PolitiqueConfidentialite() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
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
        <h1 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.04em", color: "var(--ink)", lineHeight: 1, marginBottom: "0.5rem" }}>
          Confidentialité
        </h1>
        <p style={{ ...pStyle, marginBottom: "2rem", opacity: 0.6 }}>
          Politique de confidentialité — Dernière mise à jour : avril 2025
        </p>

        <div style={{ border: "var(--rule)", background: "var(--card)", padding: "0 1.5rem" }}>
          <section style={sectionStyle}>
            <h2 style={h2Style}>1. Responsable du traitement</h2>
            <p style={pStyle}>
              <strong>DVS Web</strong> — Evan Davison<br />
              Contact : via <a href="https://dvs-web.fr" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)" }}>dvs-web.fr</a>
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>2. Données collectées et finalités</h2>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Donnée</th>
                  <th style={thStyle}>Finalité</th>
                  <th style={thStyle}>Base légale</th>
                  <th style={thStyle}>Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Email, nom</td>
                  <td style={tdStyle}>Authentification, compte utilisateur</td>
                  <td style={tdStyle}>Exécution du contrat</td>
                  <td style={tdStyle}>Jusqu&apos;à suppression du compte</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Contenu des QR codes</td>
                  <td style={tdStyle}>Fourniture du service</td>
                  <td style={tdStyle}>Exécution du contrat</td>
                  <td style={tdStyle}>Jusqu&apos;à suppression du QR code</td>
                </tr>
                <tr>
                  <td style={tdStyle}>IP, UA, pays, ville (scans)</td>
                  <td style={tdStyle}>Statistiques de scan pour l&apos;utilisateur</td>
                  <td style={tdStyle}>Intérêt légitime</td>
                  <td style={tdStyle}>Jusqu&apos;à suppression du QR code</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Données de navigation (Google Analytics)</td>
                  <td style={tdStyle}>Analyse d&apos;audience anonymisée</td>
                  <td style={tdStyle}>Consentement (cookie banner)</td>
                  <td style={tdStyle}>26 mois (paramètre GA4)</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>3. Google Analytics</h2>
            <p style={pStyle}>
              Ce site utilise <strong>Google Analytics 4</strong> (Google LLC, États-Unis) pour mesurer l&apos;audience. Google peut collecter des données de navigation via des cookies. La collecte n&apos;est activée qu&apos;après acceptation via le bandeau de consentement.
            </p>
            <p style={{ ...pStyle, marginTop: "0.75rem" }}>
              Pour s&apos;opposer à ce suivi, vous pouvez refuser les cookies analytiques ou installer l&apos;extension <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", textDecoration: "underline" }}>Google Analytics Opt-out</a>.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>4. Hébergement et sous-traitants</h2>
            <ul style={{ ...pStyle, paddingLeft: "1.25rem", marginTop: "0.25rem" }}>
              <li><strong>Vercel Inc.</strong> (hébergement, CDN) — États-Unis, clauses contractuelles types UE</li>
              <li><strong>Supabase Inc.</strong> (base de données PostgreSQL) — États-Unis, clauses contractuelles types UE</li>
              <li><strong>Google LLC</strong> (Analytics, OAuth) — États-Unis, clauses contractuelles types UE</li>
              <li><strong>GitHub Inc.</strong> (OAuth) — États-Unis, clauses contractuelles types UE</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>5. Vos droits (RGPD)</h2>
            <p style={pStyle}>Vous disposez des droits suivants sur vos données personnelles :</p>
            <ul style={{ ...pStyle, paddingLeft: "1.25rem", marginTop: "0.5rem" }}>
              <li><strong>Accès</strong> : consulter vos données depuis votre profil</li>
              <li><strong>Rectification</strong> : modifier votre nom depuis votre profil</li>
              <li><strong>Suppression</strong> : supprimer votre compte et toutes vos données depuis votre profil</li>
              <li><strong>Portabilité</strong> : vos QR codes peuvent être exportés en PNG/PDF</li>
              <li><strong>Opposition</strong> : refuser les cookies analytiques via le bandeau de consentement</li>
            </ul>
            <p style={{ ...pStyle, marginTop: "0.75rem" }}>
              Pour toute autre demande, contactez : <a href="https://dvs-web.fr" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)" }}>dvs-web.fr</a>
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>6. Cookies</h2>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Cookie</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Finalité</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}><code>next-auth.session-token</code></td>
                  <td style={tdStyle}>Nécessaire</td>
                  <td style={tdStyle}>Authentification sécurisée</td>
                </tr>
                <tr>
                  <td style={tdStyle}><code>_ga</code>, <code>_ga_*</code></td>
                  <td style={tdStyle}>Analytique (consentement requis)</td>
                  <td style={tdStyle}>Mesure d&apos;audience Google Analytics</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ padding: "1.5rem 0" }}>
            <h2 style={h2Style}>7. Réclamation</h2>
            <p style={pStyle}>
              Si vous estimez que le traitement de vos données ne respecte pas la réglementation, vous pouvez déposer une réclamation auprès de la <strong>CNIL</strong> : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", textDecoration: "underline" }}>www.cnil.fr</a>.
            </p>
          </section>
        </div>

        <div style={{ marginTop: "2rem", display: "flex", gap: "2rem" }}>
          <Link href="/" style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", textDecoration: "none" }}>
            ← Accueil
          </Link>
          <Link href="/cgu" style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", textDecoration: "none" }}>
            CGU →
          </Link>
        </div>
      </main>
    </div>
  );
}
