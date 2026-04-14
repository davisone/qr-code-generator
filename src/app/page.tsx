import Link from "next/link";
import { BASE_URL } from "@/lib/config";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${BASE_URL}/#app`,
      name: "QRaft",
      url: BASE_URL,
      description:
        "Créez des QR codes personnalisés gratuitement en quelques secondes. Ajoutez votre logo, choisissez vos couleurs, exportez en PNG, JPEG ou PDF.",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript",
      softwareVersion: "1.0",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Génération de QR codes illimitée",
        "Personnalisation des couleurs",
        "Ajout de logo personnalisé",
        "Export PNG, JPEG, PDF",
        "Partage par lien public",
        "Statistiques de scan en temps réel",
        "4 niveaux de correction d'erreur",
      ],
      screenshot: `${BASE_URL}/QRaft.png`,
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "DVS Web",
      url: BASE_URL,
      logo: `${BASE_URL}/QRaft.png`,
      founder: {
        "@type": "Person",
        name: "Evan Davison",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "QRaft",
      description: "Générateur de QR codes gratuit et personnalisable",
      publisher: {
        "@id": `${BASE_URL}/#organization`,
      },
      inLanguage: "fr-FR",
    },
    {
      "@type": "HowTo",
      "@id": `${BASE_URL}/#howto`,
      name: "Comment créer un QR code avec QRaft",
      description:
        "Créez un QR code personnalisé en 3 étapes simples, gratuitement et sans logiciel.",
      totalTime: "PT2M",
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: "EUR",
        value: "0",
      },
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Créez votre compte gratuit",
          text: "Inscrivez-vous sur QRaft en quelques secondes. Aucune carte bancaire requise, c'est 100% gratuit.",
          url: `${BASE_URL}/register`,
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Personnalisez votre QR code",
          text: "Entrez votre URL ou texte, choisissez vos couleurs, ajoutez votre logo et sélectionnez le niveau de correction d'erreur.",
          url: `${BASE_URL}/qrcode/new`,
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Exportez et partagez",
          text: "Téléchargez votre QR code en PNG, JPEG ou PDF haute qualité. Partagez-le via un lien public et suivez les scans en temps réel.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "QRaft est-il vraiment gratuit ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui, QRaft est 100% gratuit. Vous pouvez créer des QR codes illimités, les personnaliser avec vos couleurs et votre logo, et les exporter en PNG, JPEG ou PDF sans aucun frais.",
          },
        },
        {
          "@type": "Question",
          name: "Puis-je ajouter mon logo sur un QR code ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui, QRaft vous permet d'ajouter votre logo au centre de votre QR code pour une personnalisation complète de votre marque.",
          },
        },
        {
          "@type": "Question",
          name: "Quels formats d'export sont disponibles ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "QRaft propose l'export en 3 formats : PNG pour le web, JPEG pour l'impression standard, et PDF pour une qualité vectorielle.",
          },
        },
        {
          "@type": "Question",
          name: "Puis-je suivre les scans de mes QR codes ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui, QRaft propose des statistiques de scan complètes. Vous pouvez voir le nombre total de scans, leur répartition par appareil, navigateur et système d'exploitation, ainsi que l'évolution dans le temps.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar */}
      <nav className="navbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-stretch h-14">
            <Link
              href="/"
              className="flex items-center px-2"
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
                fontSize: "1.8rem",
                letterSpacing: "0.06em",
                color: "#f0ebe1",
                textDecoration: "none",
              }}
            >
              QRaft
            </Link>
            <div className="flex items-stretch">
              <Link
                href="/login"
                className="flex items-center px-5 text-xs font-bold uppercase tracking-widest border-l"
                style={{
                  color: "rgba(240,235,225,0.5)",
                  borderColor: "rgba(255,255,255,0.08)",
                  fontFamily: "var(--font-sans)",
                  textDecoration: "none",
                }}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="flex items-center px-5 text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "var(--red)",
                  color: "white",
                  fontFamily: "var(--font-sans)",
                  textDecoration: "none",
                }}
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ borderBottom: "var(--rule)" }}>
        <div style={{ background: "var(--red)", padding: "0.45rem 0" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.62rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.85)",
            }}>
              100% Gratuit — Sans carte bancaire
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
                fontSize: "clamp(4rem, 10vw, 7rem)",
                lineHeight: 0.95,
                letterSpacing: "0.03em",
                color: "var(--ink)",
              }}>
                Créez des<br />
                <span style={{ color: "var(--red)" }}>QR codes</span><br />
                en quelques<br />secondes
              </h1>
              <p style={{
                marginTop: "1.5rem",
                fontSize: "1rem",
                color: "var(--mid)",
                fontFamily: "var(--font-sans)",
                maxWidth: "34ch",
                lineHeight: 1.6,
              }}>
                Générez, personnalisez et partagez vos QR codes. Simple, rapide, et totalement gratuit.
              </p>
              <div className="flex items-center gap-3 mt-8 flex-wrap">
                <Link href="/register" className="btn btn-primary btn-lg">
                  Créer mon premier QR →
                </Link>
                <Link href="/login" className="btn btn-ghost btn-lg">
                  Connexion
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <div style={{
                border: "var(--rule)",
                background: "var(--card)",
                padding: "2rem",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute",
                  top: "0.8rem",
                  left: "0.8rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--light)",
                }}>
                  Aperçu
                </div>
                <div style={{ background: "white", padding: "1.5rem", border: "var(--rule-thin)", marginTop: "0.5rem" }}>
                  <svg viewBox="0 0 100 100" style={{ width: "140px", height: "140px", display: "block" }} aria-hidden="true">
                    <rect fill="#1a1410" x="10" y="10" width="20" height="20"/>
                    <rect fill="#1a1410" x="70" y="10" width="20" height="20"/>
                    <rect fill="#1a1410" x="10" y="70" width="20" height="20"/>
                    <rect fill="#1a1410" x="40" y="10" width="8" height="8"/>
                    <rect fill="#1a1410" x="52" y="10" width="8" height="8"/>
                    <rect fill="#1a1410" x="40" y="22" width="8" height="8"/>
                    <rect fill="#1a1410" x="10" y="40" width="8" height="8"/>
                    <rect fill="#1a1410" x="22" y="40" width="8" height="8"/>
                    <rect fill="#1a1410" x="10" y="52" width="8" height="8"/>
                    <rect fill="#1a1410" x="40" y="40" width="20" height="20"/>
                    <rect fill="#1a1410" x="70" y="40" width="8" height="8"/>
                    <rect fill="#1a1410" x="82" y="40" width="8" height="8"/>
                    <rect fill="#1a1410" x="70" y="52" width="8" height="8"/>
                    <rect fill="#1a1410" x="40" y="70" width="8" height="8"/>
                    <rect fill="#1a1410" x="52" y="70" width="8" height="8"/>
                    <rect fill="#1a1410" x="40" y="82" width="8" height="8"/>
                    <rect fill="#1a1410" x="70" y="70" width="8" height="8"/>
                    <rect fill="#1a1410" x="82" y="70" width="8" height="8"/>
                    <rect fill="#1a1410" x="70" y="82" width="8" height="8"/>
                    <rect fill="#1a1410" x="82" y="82" width="8" height="8"/>
                  </svg>
                </div>
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <span style={{
                    fontFamily: "var(--font-display, cursive)",
                    fontSize: "1.4rem",
                    letterSpacing: "0.06em",
                    color: "var(--ink)",
                  }}>QRaft</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ background: "var(--ink)", borderBottom: "var(--rule)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3">
            {[
              { value: "∞", label: "QR codes illimités" },
              { value: "3", label: "Formats d'export" },
              { value: "100%", label: "Gratuit" },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                padding: "1.2rem 2rem",
                textAlign: "center",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}>
                <div style={{
                  fontFamily: "var(--font-display, cursive)",
                  fontSize: "2.4rem",
                  color: "var(--yellow)",
                  lineHeight: 1,
                  letterSpacing: "0.04em",
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(240,235,225,0.45)",
                  marginTop: "0.3rem",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div style={{ marginBottom: "2rem" }}>
          <div style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.62rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--red)",
            marginBottom: "0.5rem",
          }}>Fonctionnalités</div>
          <h2 style={{
            fontFamily: "var(--font-display, cursive)",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "0.04em",
            color: "var(--ink)",
            lineHeight: 1,
          }}>Tout ce dont vous avez besoin</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ border: "var(--rule)" }}>
          {[
            { title: "Personnalisation couleurs", desc: "Choisissez les couleurs du QR code et du fond pour correspondre à votre identité visuelle.", icon: "●" },
            { title: "Ajout de logo", desc: "Intégrez votre logo au centre du QR code. La correction d'erreur garantit la lisibilité.", icon: "◈" },
            { title: "Export PNG / JPG / PDF", desc: "Téléchargez en haute qualité dans le format adapté : web, impression ou vectoriel.", icon: "↓" },
            { title: "Partage public", desc: "Générez un lien de partage unique. Partagez vos QR codes sans compte requis côté lecteur.", icon: "↗" },
            { title: "Statistiques de scan", desc: "Suivez les scans en temps réel : appareil, navigateur, OS et évolution dans le temps.", icon: "◎" },
            { title: "Export en masse ZIP", desc: "Téléchargez tous vos QR codes sélectionnés en une seule archive ZIP.", icon: "⊞" },
          ].map((f, i) => (
            <div key={f.title} style={{
              padding: "1.5rem",
              background: "var(--card)",
              borderRight: (i + 1) % 3 === 0 ? "none" : "var(--rule)",
              borderBottom: i < 3 ? "var(--rule)" : "none",
            }}>
              <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1.4rem", color: "var(--red)", marginBottom: "0.8rem" }}>{f.icon}</div>
              <h3 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.2rem", letterSpacing: "0.04em", color: "var(--ink)", marginBottom: "0.5rem" }}>{f.title}</h3>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--mid)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section style={{ borderTop: "var(--rule)", borderBottom: "var(--rule)", background: "var(--ink)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--yellow)", marginBottom: "0.5rem" }}>Simple</div>
            <h2 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "0.04em", color: "#f0ebe1", lineHeight: 1 }}>Comment créer un QR code ?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              { num: "01", title: "Créez votre compte", desc: "Inscription gratuite en quelques secondes. Aucune carte bancaire requise, aucun engagement." },
              { num: "02", title: "Personnalisez votre QR", desc: "Entrez votre URL ou texte, choisissez vos couleurs, ajoutez votre logo. L'aperçu se met à jour en temps réel." },
              { num: "03", title: "Exportez et suivez", desc: "Téléchargez en PNG, JPEG ou PDF. Partagez par lien public et analysez chaque scan." },
            ].map((step, i) => (
              <div key={step.num} style={{ padding: "2rem", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                <div style={{ fontFamily: "var(--font-display, cursive)", fontSize: "3.5rem", color: "var(--red)", lineHeight: 1, marginBottom: "1rem" }}>{step.num}</div>
                <h3 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#f0ebe1", marginBottom: "0.6rem" }}>{step.title}</h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "rgba(240,235,225,0.55)", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--red)", marginBottom: "0.5rem" }}>FAQ</div>
          <h2 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "0.04em", color: "var(--ink)", lineHeight: 1 }}>Questions fréquentes</h2>
        </div>

        <div style={{ border: "var(--rule)" }}>
          {[
            { q: "QRaft est-il vraiment gratuit ?", a: "Oui, QRaft est 100% gratuit. Vous pouvez créer des QR codes illimités, les personnaliser avec vos couleurs et votre logo, et les exporter en PNG, JPEG ou PDF — sans aucun frais ni carte bancaire." },
            { q: "Puis-je ajouter mon logo sur un QR code ?", a: "Oui. QRaft vous permet d'intégrer votre logo au centre de votre QR code pour une personnalisation complète. Le QR reste lisible grâce au niveau de correction d'erreur élevé." },
            { q: "Quels formats d'export sont disponibles ?", a: "QRaft propose trois formats : PNG pour le web, JPEG pour l'impression standard, et PDF vectoriel pour une qualité parfaite quelle que soit la taille." },
            { q: "Puis-je suivre les scans de mes QR codes ?", a: "Oui. Chaque QR code dispose de statistiques complètes : nombre total de scans, évolution dans le temps, répartition par appareil, navigateur et système d'exploitation, ainsi qu'une carte géographique." },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2" style={{ borderBottom: i < 3 ? "var(--rule)" : "none" }}>
              <div style={{ padding: "1.5rem", borderRight: "var(--rule)", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", fontWeight: 700, color: "var(--red)", marginTop: "0.15rem", flexShrink: 0 }}>0{i + 1}</span>
                <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 700, color: "var(--ink)", lineHeight: 1.4 }}>{item.q}</h3>
              </div>
              <div style={{ padding: "1.5rem" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--mid)", lineHeight: 1.6 }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section style={{ background: "var(--red)", borderTop: "var(--rule)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 style={{
            fontFamily: "var(--font-display, cursive)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            letterSpacing: "0.04em",
            color: "white",
            lineHeight: 1,
            marginBottom: "1.5rem",
          }}>
            Prêt à créer votre<br />premier QR code ?
          </h2>
          <Link
            href="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "white",
              color: "var(--red)",
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "0.85rem 2rem",
              textDecoration: "none",
            }}
          >
            Créer mon compte gratuit →
          </Link>
        </div>
      </section>

    </div>
  );
}
