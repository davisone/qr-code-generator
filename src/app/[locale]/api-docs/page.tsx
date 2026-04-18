"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const METHOD_COLORS: Record<string, string> = {
  GET: "#2d9cdb",
  POST: "#f0b500",
};

type Section = {
  id: string;
  label: string;
  children?: Section[];
};

const SECTIONS: Section[] = [
  { id: "auth", label: "Authentification" },
  { id: "rate-limits", label: "Rate limits" },
  {
    id: "endpoints",
    label: "Endpoints",
    children: [
      { id: "ep-create", label: "POST /api/v1/qrcodes" },
      { id: "ep-get", label: "GET /api/v1/qrcodes/:id" },
      { id: "ep-analytics", label: "GET /api/v1/qrcodes/:id/analytics" },
      { id: "ep-scans", label: "GET /api/v1/qrcodes/:id/scans" },
    ],
  },
  { id: "errors", label: "Codes d'erreur" },
];

const codeBlockStyle: React.CSSProperties = {
  background: "#1a1410",
  color: "#f0ebe1",
  padding: "1rem 1.25rem",
  fontFamily: "var(--font-mono, 'Courier Prime'), monospace",
  fontSize: "0.78rem",
  lineHeight: 1.55,
  overflow: "auto",
  border: "var(--rule)",
  marginBottom: "1rem",
  whiteSpace: "pre",
};

const h2Style: React.CSSProperties = {
  fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
  fontSize: "2rem",
  letterSpacing: "0.05em",
  color: "var(--ink)",
  marginBottom: "0.8rem",
  marginTop: "2.5rem",
};

const h3Style: React.CSSProperties = {
  fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
  fontSize: "1.4rem",
  letterSpacing: "0.05em",
  color: "var(--ink)",
  marginTop: "1.6rem",
  marginBottom: "0.6rem",
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.85rem",
  marginBottom: "1rem",
  border: "var(--rule)",
};

const thStyle: React.CSSProperties = {
  background: "var(--ink)",
  color: "var(--bg)",
  padding: "0.6rem 0.9rem",
  textAlign: "left",
  fontSize: "0.65rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const tdStyle: React.CSSProperties = {
  padding: "0.6rem 0.9rem",
  borderTop: "1px solid rgba(0,0,0,0.08)",
  verticalAlign: "top",
};

const MethodBadge = ({ method }: { method: "GET" | "POST" }) => (
  <span
    style={{
      background: METHOD_COLORS[method],
      color: method === "POST" ? "var(--ink)" : "#fff",
      padding: "0.2rem 0.55rem",
      fontFamily: "var(--font-mono, 'Courier Prime'), monospace",
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
    }}
  >
    {method}
  </span>
);

export default function ApiDocsPage() {
  const t = useTranslations("api");
  const [active, setActive] = useState<string>("auth");

  useEffect(() => {
    const handler = () => {
      const ids = [
        "auth",
        "rate-limits",
        "endpoints",
        "ep-create",
        "ep-get",
        "ep-analytics",
        "ep-scans",
        "errors",
      ];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top < 160) setActive(id);
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const renderNavItem = (s: Section, depth = 0) => (
    <div key={s.id}>
      <a
        href={`#${s.id}`}
        style={{
          display: "block",
          padding: "0.4rem 0.6rem",
          paddingLeft: `${0.6 + depth * 0.9}rem`,
          fontSize: depth === 0 ? "0.78rem" : "0.72rem",
          fontWeight: depth === 0 ? 700 : 500,
          letterSpacing: "0.06em",
          textTransform: depth === 0 ? "uppercase" : "none",
          color: active === s.id ? "var(--red)" : "var(--ink)",
          textDecoration: "none",
          fontFamily: depth === 0 ? "var(--font-sans)" : "var(--font-mono, 'Courier Prime'), monospace",
          borderLeft: active === s.id ? "2px solid var(--red)" : "2px solid transparent",
        }}
      >
        {s.label}
      </a>
      {s.children?.map((c) => renderNavItem(c, depth + 1))}
    </div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: "var(--ink)", padding: "2.25rem 0 2rem", borderBottom: "var(--rule)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div
            style={{
              fontFamily: "var(--font-mono, 'Courier Prime'), monospace",
              fontSize: "0.68rem",
              color: "var(--yellow)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "0.6rem",
            }}
          >
            {"// "}REST · JSON
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <h1
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
                fontSize: "clamp(2.4rem, 7vw, 4rem)",
                lineHeight: 0.95,
                letterSpacing: "0.04em",
                color: "var(--bg)",
                margin: 0,
              }}
            >
              QRAFT API
            </h1>
            <span
              style={{
                background: "var(--yellow)",
                color: "var(--ink)",
                padding: "0.25rem 0.6rem",
                fontFamily: "var(--font-mono, 'Courier Prime'), monospace",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              v1.0
            </span>
          </div>
          <p style={{ color: "rgba(240,235,225,0.6)", fontSize: "0.9rem", marginTop: "0.6rem" }}>
            Documentation REST · JSON over HTTPS
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: "2.5rem",
          }}
          className="api-docs-grid"
        >
          {/* Sidebar */}
          <aside
            style={{
              position: "sticky",
              top: "4rem",
              alignSelf: "flex-start",
              maxHeight: "calc(100vh - 5rem)",
              overflowY: "auto",
              paddingRight: "0.4rem",
            }}
          >
            <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--mid)", marginBottom: "0.75rem", padding: "0 0.6rem" }}>
              Navigation
            </div>
            {SECTIONS.map((s) => renderNavItem(s))}
            <div style={{ marginTop: "1.5rem", padding: "0.6rem", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
              <Link
                href="/api-keys"
                style={{
                  fontSize: "0.72rem",
                  color: "var(--red)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  textDecoration: "none",
                }}
              >
                {t("keys_title")} →
              </Link>
            </div>
          </aside>

          {/* Content */}
          <article style={{ minWidth: 0 }}>
            {/* AUTH */}
            <section id="auth">
              <h2 style={{ ...h2Style, marginTop: 0 }}>Authentification</h2>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--ink)", marginBottom: "1rem" }}>
                Toutes les requêtes doivent inclure un header <code style={{ background: "var(--card)", padding: "0.1rem 0.35rem", fontFamily: "var(--font-mono, 'Courier Prime'), monospace", fontSize: "0.82rem" }}>Authorization</code> avec votre clé API au format <code style={{ background: "var(--card)", padding: "0.1rem 0.35rem", fontFamily: "var(--font-mono, 'Courier Prime'), monospace", fontSize: "0.82rem" }}>Bearer qft_...</code>.
              </p>
              <pre style={codeBlockStyle}>
{`Authorization: Bearer qft_VOTRE_CLE_ICI`}
              </pre>
              <p style={{ fontSize: "0.85rem", color: "var(--mid)", marginBottom: "1rem" }}>
                Créez et gérez vos clés depuis la page <Link href="/api-keys" style={{ color: "var(--red)", textDecoration: "underline" }}>API Keys</Link>. Les clés sont affichées une seule fois à la création — conservez-les en lieu sûr.
              </p>
            </section>

            {/* RATE LIMITS */}
            <section id="rate-limits">
              <h2 style={h2Style}>Rate limits</h2>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--ink)", marginBottom: "1rem" }}>
                Les limites sont appliquées par clé API, sur une fenêtre glissante de 1 heure.
              </p>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Plan</th>
                    <th style={thStyle}>Requêtes / heure</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={tdStyle}>Free</td>
                    <td style={tdStyle}>20</td>
                  </tr>
                  <tr>
                    <td style={tdStyle}>Pro</td>
                    <td style={tdStyle}>100</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: "0.85rem", color: "var(--mid)", marginBottom: "0.75rem" }}>
                Chaque réponse expose les headers suivants :
              </p>
              <pre style={codeBlockStyle}>
{`X-RateLimit-Limit: 20
X-RateLimit-Remaining: 17
X-RateLimit-Reset: 1768680000`}
              </pre>
            </section>

            {/* ENDPOINTS */}
            <section id="endpoints">
              <h2 style={h2Style}>Endpoints</h2>

              {/* POST /api/v1/qrcodes */}
              <section id="ep-create">
                <h3 style={h3Style}>
                  <MethodBadge method="POST" /> /api/v1/qrcodes
                </h3>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Crée un nouveau QR code partagé publiquement. Retourne un <code>shareToken</code> et une <code>shareUrl</code> prête à être affichée.
                </p>

                <h4 style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mid)", marginBottom: "0.4rem", fontWeight: 700 }}>
                  Body JSON
                </h4>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Champ</th>
                      <th style={thStyle}>Type</th>
                      <th style={thStyle}>Requis</th>
                      <th style={thStyle}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={tdStyle}><code>name</code></td><td style={tdStyle}>string</td><td style={tdStyle}>oui</td><td style={tdStyle}>Max 100 caractères.</td></tr>
                    <tr><td style={tdStyle}><code>content</code></td><td style={tdStyle}>string</td><td style={tdStyle}>oui</td><td style={tdStyle}>Contenu encodé (URL, texte, payload vCard…).</td></tr>
                    <tr><td style={tdStyle}><code>type</code></td><td style={tdStyle}>enum</td><td style={tdStyle}>non</td><td style={tdStyle}>url, text, wifi, vcard, email, phone, sms, whatsapp, geo, social. Défaut : url.</td></tr>
                    <tr><td style={tdStyle}><code>foregroundColor</code></td><td style={tdStyle}>hex</td><td style={tdStyle}>non</td><td style={tdStyle}>Format #RRGGBB. Défaut #1a1410.</td></tr>
                    <tr><td style={tdStyle}><code>backgroundColor</code></td><td style={tdStyle}>hex</td><td style={tdStyle}>non</td><td style={tdStyle}>Format #RRGGBB. Défaut #ffffff.</td></tr>
                    <tr><td style={tdStyle}><code>errorCorrection</code></td><td style={tdStyle}>L / M / Q / H</td><td style={tdStyle}>non</td><td style={tdStyle}>Défaut M.</td></tr>
                    <tr><td style={tdStyle}><code>size</code></td><td style={tdStyle}>integer</td><td style={tdStyle}>non</td><td style={tdStyle}>128 – 2048 pixels. Défaut 512.</td></tr>
                    <tr><td style={tdStyle}><code>category</code></td><td style={tdStyle}>string</td><td style={tdStyle}>non</td><td style={tdStyle}>Libellé libre.</td></tr>
                  </tbody>
                </table>

                <h4 style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mid)", marginBottom: "0.4rem", fontWeight: 700 }}>
                  Exemple curl
                </h4>
                <pre style={codeBlockStyle}>
{`curl -X POST https://useqraft.com/api/v1/qrcodes \\
  -H "Authorization: Bearer qft_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Menu",
    "content": "https://menu.example.com",
    "type": "url"
  }'`}
                </pre>

                <h4 style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mid)", marginBottom: "0.4rem", fontWeight: 700 }}>
                  Réponse 201
                </h4>
                <pre style={codeBlockStyle}>
{`{
  "id": "clx...",
  "name": "Menu",
  "type": "url",
  "content": "https://menu.example.com",
  "shareToken": "b5f2e1d8-...",
  "shareUrl": "https://useqraft.com/r/b5f2e1d8-...",
  "foregroundColor": "#1a1410",
  "backgroundColor": "#ffffff",
  "size": 512,
  "errorCorrection": "M",
  "category": null,
  "createdAt": "2026-04-16T10:00:00.000Z",
  "expiresAt": "2026-05-16T10:00:00.000Z"
}`}
                </pre>
              </section>

              {/* GET :id */}
              <section id="ep-get">
                <h3 style={h3Style}>
                  <MethodBadge method="GET" /> /api/v1/qrcodes/:id
                </h3>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Retourne le QR code. 404 si l&apos;ID n&apos;existe pas ou n&apos;appartient pas à l&apos;utilisateur.
                </p>
                <pre style={codeBlockStyle}>
{`curl https://useqraft.com/api/v1/qrcodes/clx... \\
  -H "Authorization: Bearer qft_xxx"`}
                </pre>
                <pre style={codeBlockStyle}>
{`{
  "id": "clx...",
  "name": "Menu",
  "type": "url",
  "content": "https://menu.example.com",
  "shareToken": "b5f2e1d8-...",
  "shareUrl": "https://useqraft.com/r/b5f2e1d8-...",
  "foregroundColor": "#1a1410",
  "backgroundColor": "#ffffff",
  "size": 512,
  "errorCorrection": "M",
  "category": null,
  "isPublic": true,
  "isFavorite": false,
  "scanCount": 42,
  "createdAt": "2026-04-16T10:00:00.000Z",
  "updatedAt": "2026-04-16T10:00:00.000Z",
  "expiresAt": "2026-05-16T10:00:00.000Z"
}`}
                </pre>
              </section>

              {/* analytics */}
              <section id="ep-analytics">
                <h3 style={h3Style}>
                  <MethodBadge method="GET" /> /api/v1/qrcodes/:id/analytics
                </h3>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Statistiques agrégées des scans. Paramètre optionnel <code>days</code> (1 – 365, défaut 30).
                </p>
                <pre style={codeBlockStyle}>
{`curl "https://useqraft.com/api/v1/qrcodes/clx.../analytics?days=7" \\
  -H "Authorization: Bearer qft_xxx"`}
                </pre>
                <pre style={codeBlockStyle}>
{`{
  "totalScans": 123,
  "uniqueCountries": 12,
  "uniqueCities": 45,
  "byDevice":  [{ "device": "mobile",  "count": 80 }],
  "byBrowser": [{ "browser": "Chrome", "count": 90 }],
  "byOs":      [{ "os": "iOS",         "count": 60 }],
  "byCountry": [{ "country": "FR",     "count": 70 }],
  "timeline":  [{ "date": "2026-04-10", "scans": 5 }]
}`}
                </pre>
              </section>

              {/* scans */}
              <section id="ep-scans">
                <h3 style={h3Style}>
                  <MethodBadge method="GET" /> /api/v1/qrcodes/:id/scans
                </h3>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Liste des scans bruts, paginée. Paramètres : <code>limit</code> (max 500, défaut 100) et <code>cursor</code> (ID du dernier scan de la page précédente).
                </p>
                <pre style={codeBlockStyle}>
{`curl "https://useqraft.com/api/v1/qrcodes/clx.../scans?limit=50" \\
  -H "Authorization: Bearer qft_xxx"`}
                </pre>
                <pre style={codeBlockStyle}>
{`{
  "data": [
    {
      "id": "scn_...",
      "qrCodeId": "clx...",
      "country": "FR",
      "city": "Rennes",
      "device": "mobile",
      "browser": "Chrome",
      "os": "iOS",
      "latitude": 48.117,
      "longitude": -1.677,
      "scannedAt": "2026-04-16T09:55:12.000Z"
    }
  ],
  "nextCursor": "scn_previous_last_id"
}`}
                </pre>
              </section>
            </section>

            {/* ERRORS */}
            <section id="errors">
              <h2 style={h2Style}>Codes d&apos;erreur</h2>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Code</th>
                    <th style={thStyle}>Erreur</th>
                    <th style={thStyle}>Signification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={tdStyle}>400</td><td style={tdStyle}><code>validation_error</code></td><td style={tdStyle}>Payload invalide.</td></tr>
                  <tr><td style={tdStyle}>401</td><td style={tdStyle}><code>invalid_api_key</code></td><td style={tdStyle}>Clé manquante, révoquée ou mal formée.</td></tr>
                  <tr><td style={tdStyle}>404</td><td style={tdStyle}><code>not_found</code></td><td style={tdStyle}>Ressource inexistante ou n&apos;appartenant pas à l&apos;utilisateur.</td></tr>
                  <tr><td style={tdStyle}>429</td><td style={tdStyle}><code>rate_limited</code></td><td style={tdStyle}>Quota horaire dépassé. Attendez <code>X-RateLimit-Reset</code>.</td></tr>
                  <tr><td style={tdStyle}>500</td><td style={tdStyle}><code>internal_error</code></td><td style={tdStyle}>Erreur serveur. Réessayez plus tard.</td></tr>
                </tbody>
              </table>
            </section>
          </article>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.api-docs-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
