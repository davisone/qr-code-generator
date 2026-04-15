import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { BASE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions générales d'utilisation du service QRaft, générateur de QR codes gratuit.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE_URL}/fr/cgu` },
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

export default function CGU() {
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
              QRaft
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
          CGU
        </h1>
        <p style={{ ...pStyle, marginBottom: "2rem", opacity: 0.6 }}>
          Conditions Générales d&apos;Utilisation — Dernière mise à jour : avril 2025
        </p>

        <div style={{ border: "var(--rule)", background: "var(--card)", padding: "0 1.5rem" }}>
          <section style={sectionStyle}>
            <h2 style={h2Style}>1. Objet</h2>
            <p style={pStyle}>
              Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation du service <strong>QRaft</strong>, accessible à l&apos;adresse <a href="https://qr-aft.vercel.app" style={{ color: "var(--ink)" }}>qr-aft.vercel.app</a>, édité par DVS Web (Evan Davison). En utilisant QRaft, vous acceptez sans réserve les présentes CGU.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>2. Description du service</h2>
            <p style={pStyle}>
              QRaft est un service de génération, personnalisation et partage de QR codes. Il est accessible gratuitement après création d&apos;un compte. Les fonctionnalités incluent la création de QR codes de types variés (URL, texte, Wi-Fi, vCard, etc.), l&apos;export en PNG/JPEG/PDF, le partage public et les statistiques de scan.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>3. Accès au service</h2>
            <p style={pStyle}>
              L&apos;inscription est gratuite et ouverte à toute personne physique majeure. Vous êtes responsable de la confidentialité de vos identifiants. Tout accès frauduleux ou utilisation abusive peut entraîner la suspension du compte.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>4. Utilisation acceptable</h2>
            <p style={pStyle}>Il est interdit d&apos;utiliser QRaft pour :</p>
            <ul style={{ ...pStyle, paddingLeft: "1.25rem", marginTop: "0.5rem" }}>
              <li>Créer des QR codes renvoyant vers du contenu illégal, malveillant ou trompeur</li>
              <li>Porter atteinte aux droits de tiers (marques, droits d&apos;auteur, données personnelles)</li>
              <li>Tenter de compromettre la sécurité ou le fonctionnement du service</li>
              <li>Utiliser des scripts automatisés sans autorisation écrite</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>5. Propriété des données</h2>
            <p style={pStyle}>
              Vous conservez l&apos;intégralité des droits sur le contenu que vous encodez dans vos QR codes. DVS Web ne revendique aucun droit sur vos données. Vous pouvez supprimer votre compte et toutes vos données à tout moment depuis votre profil.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>6. Disponibilité du service</h2>
            <p style={pStyle}>
              QRaft est fourni &quot;tel quel&quot;, sans garantie de disponibilité continue. DVS Web se réserve le droit de modifier, suspendre ou interrompre le service à tout moment, notamment pour maintenance. Aucune indemnité ne saurait être réclamée à ce titre.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>7. Responsabilité</h2>
            <p style={pStyle}>
              DVS Web ne saurait être tenu responsable des dommages directs ou indirects résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le service, ni du contenu des QR codes créés par les utilisateurs.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>8. Modification des CGU</h2>
            <p style={pStyle}>
              Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés par email ou via une notification sur le service en cas de modification substantielle. La poursuite de l&apos;utilisation du service vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section style={{ padding: "1.5rem 0" }}>
            <h2 style={h2Style}>9. Droit applicable</h2>
            <p style={pStyle}>
              Les présentes CGU sont soumises au droit français. En cas de litige, les parties s&apos;efforceront de trouver une solution amiable. À défaut, les tribunaux français seront seuls compétents.
            </p>
          </section>
        </div>

        <div style={{ marginTop: "2rem", display: "flex", gap: "2rem" }}>
          <Link href="/" style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", textDecoration: "none" }}>
            ← Accueil
          </Link>
          <Link href="/politique-confidentialite" style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", textDecoration: "none" }}>
            Politique de confidentialité →
          </Link>
        </div>
      </main>
    </div>
  );
}
