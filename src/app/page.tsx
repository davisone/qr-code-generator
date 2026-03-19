import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen bg-[#fafafa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar */}
      <nav className="navbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="logo">
            <Image
              src="/QRaft.png"
              alt="QRaft"
              width={32}
              height={32}
              className="rounded-lg"
            />
            QRaft
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm">
              Connexion
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="badge badge-emerald mb-4">100% Gratuit</span>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-[#0a0a0a] leading-[1.1]">
            Créez des QR codes<br />
            <span className="text-gradient-emerald">en quelques secondes</span>
          </h1>
          <p className="mt-6 text-lg text-[#525252] max-w-xl mx-auto">
            Générez, personnalisez et partagez vos QR codes. Simple, rapide, et totalement gratuit.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/register" className="btn btn-primary btn-lg">
              Créer mon premier QR
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Grid - Fonctionnalités */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="sr-only">Fonctionnalités de QRaft</h2>
        <div className="bento-grid">

          {/* Hero Card - QR Preview */}
          <div className="bento-card span-2 row-2 dark flex flex-col justify-between p-8">
            <div>
              <span className="badge bg-white/10 text-white mb-4">Aperçu</span>
              <h3 className="text-2xl font-bold mb-2">Visualisation en temps réel</h3>
              <p className="text-white/70">Voyez votre QR code se mettre à jour instantanément.</p>
            </div>
            <div className="flex justify-center mt-8">
              <div className="bg-white rounded-2xl p-6 animate-float">
                <svg viewBox="0 0 100 100" className="w-32 h-32" aria-hidden="true">
                  <rect fill="#0a0a0a" x="10" y="10" width="20" height="20" rx="2"/>
                  <rect fill="#0a0a0a" x="70" y="10" width="20" height="20" rx="2"/>
                  <rect fill="#0a0a0a" x="10" y="70" width="20" height="20" rx="2"/>
                  <rect fill="#0a0a0a" x="40" y="10" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="52" y="10" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="40" y="22" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="10" y="40" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="22" y="40" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="10" y="52" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="40" y="40" width="20" height="20" rx="4"/>
                  <rect fill="#0a0a0a" x="70" y="40" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="82" y="40" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="70" y="52" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="40" y="70" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="52" y="70" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="40" y="82" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="70" y="70" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="82" y="70" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="70" y="82" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="82" y="82" width="8" height="8" rx="1"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Stat Card 1 */}
          <div className="bento-card gradient p-6">
            <p className="stat-number">∞</p>
            <p className="text-white/80 mt-2 font-medium">QR codes illimités</p>
          </div>

          {/* Stat Card 2 */}
          <div className="bento-card p-6">
            <p className="stat-number text-[#0a0a0a]">3</p>
            <p className="text-[#525252] mt-2 font-medium">Formats d&apos;export</p>
            <div className="flex gap-2 mt-4">
              <span className="badge badge-gray">PNG</span>
              <span className="badge badge-gray">JPG</span>
              <span className="badge badge-gray">PDF</span>
            </div>
          </div>

          {/* Feature: Colors */}
          <div className="bento-card p-6">
            <div className="flex gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#0a0a0a]"></div>
              <div className="w-8 h-8 rounded-full bg-[#10b981]"></div>
              <div className="w-8 h-8 rounded-full bg-[#8b5cf6]"></div>
              <div className="w-8 h-8 rounded-full bg-[#f97316]"></div>
            </div>
            <h3 className="font-bold text-lg text-[#0a0a0a]">Couleurs</h3>
            <p className="text-[#525252] text-sm mt-1">Personnalisez chaque détail</p>
          </div>

          {/* Feature: Logo */}
          <div className="bento-card gradient-purple p-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">Ajoutez votre logo</h3>
            <p className="text-white/80 text-sm mt-1">Au centre du QR code</p>
          </div>

          {/* Feature: Share */}
          <div className="bento-card p-6">
            <div className="icon-box emerald mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-[#0a0a0a]">Partage facile</h3>
            <p className="text-[#525252] text-sm mt-1">Lien public en un clic</p>
          </div>

          {/* Feature: Analytics */}
          <div className="bento-card gradient p-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">Statistiques de scan</h3>
            <p className="text-white/80 text-sm mt-1">Suivez qui scanne vos QR codes</p>
          </div>

          {/* Feature: Batch Export */}
          <div className="bento-card span-2 p-6 flex items-center gap-6">
            <div className="icon-box dark shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0a0a0a]">Export en masse</h3>
              <p className="text-[#525252] text-sm mt-1">Téléchargez tous vos QR codes en une archive ZIP</p>
            </div>
          </div>

          {/* CTA Card */}
          <div className="bento-card span-4 gradient-orange p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Prêt à créer votre premier QR code ?</h2>
            <p className="text-white/80 mb-6">Inscrivez-vous gratuitement et commencez en quelques secondes.</p>
            <Link href="/register" className="btn bg-white text-[#f97316] hover:bg-white/90 btn-lg">
              Créer mon compte gratuit
            </Link>
          </div>

        </div>
      </section>

      {/* Section Comment ça marche */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="badge badge-emerald mb-4">Simple</span>
          <h2 className="text-4xl font-bold tracking-tight text-[#0a0a0a]">
            Comment créer un QR code ?
          </h2>
          <p className="mt-4 text-[#525252] max-w-xl mx-auto">
            Trois étapes suffisent pour générer votre QR code personnalisé et commencer à suivre vos scans en temps réel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Ligne de connexion (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(33%-1px)] right-[calc(33%-1px)] h-px border-t-2 border-dashed border-[#e5e5e5]" />

          {/* Étape 1 */}
          <div className="flex flex-col items-center text-center px-4">
            <div className="relative w-20 h-20 rounded-2xl bg-[#0a0a0a] flex items-center justify-center mb-6 z-10">
              <span className="text-3xl font-bold text-[#10b981]">01</span>
            </div>
            <h3 className="text-xl font-bold text-[#0a0a0a] mb-3">Créez votre compte</h3>
            <p className="text-[#525252] text-sm leading-relaxed">
              Inscription gratuite en quelques secondes. Aucune carte bancaire requise, aucun engagement.
            </p>
          </div>

          {/* Étape 2 */}
          <div className="flex flex-col items-center text-center px-4">
            <div className="relative w-20 h-20 rounded-2xl bg-[#10b981] flex items-center justify-center mb-6 z-10">
              <span className="text-3xl font-bold text-white">02</span>
            </div>
            <h3 className="text-xl font-bold text-[#0a0a0a] mb-3">Personnalisez votre QR</h3>
            <p className="text-[#525252] text-sm leading-relaxed">
              Choisissez vos couleurs, ajoutez votre logo et configurez votre QR code. L&apos;aperçu se met à jour en temps réel.
            </p>
          </div>

          {/* Étape 3 */}
          <div className="flex flex-col items-center text-center px-4">
            <div className="relative w-20 h-20 rounded-2xl bg-[#f97316] flex items-center justify-center mb-6 z-10">
              <span className="text-3xl font-bold text-white">03</span>
            </div>
            <h3 className="text-xl font-bold text-[#0a0a0a] mb-3">Exportez et suivez</h3>
            <p className="text-[#525252] text-sm leading-relaxed">
              Téléchargez en PNG, JPEG ou PDF haute qualité. Partagez par lien public et analysez chaque scan en temps réel.
            </p>
          </div>
        </div>
      </section>

      {/* Section Cas d'utilisation */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="badge badge-emerald mb-4">Polyvalent</span>
          <h2 className="text-4xl font-bold tracking-tight text-[#0a0a0a]">
            À qui s&apos;adresse QRaft ?
          </h2>
          <p className="mt-4 text-[#525252] max-w-xl mx-auto">
            Des QR codes personnalisés pour tous vos besoins professionnels et créatifs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Restaurants */}
          <div className="bento-card p-6">
            <div className="icon-box emerald mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-[#0a0a0a] mb-2">Restaurants &amp; Cafés</h3>
            <p className="text-[#525252] text-sm leading-relaxed">
              Affichez votre menu numérique sur les tables. Mettez-le à jour à tout moment sans rien réimprimer.
            </p>
          </div>

          {/* Carte de visite */}
          <div className="bento-card p-6">
            <div className="icon-box emerald mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-[#0a0a0a] mb-2">Cartes de visite</h3>
            <p className="text-[#525252] text-sm leading-relaxed">
              Ajoutez un QR code sur votre carte de visite pour diriger vers votre LinkedIn, portfolio ou site web.
            </p>
          </div>

          {/* Événement */}
          <div className="bento-card p-6">
            <div className="icon-box emerald mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-[#0a0a0a] mb-2">Événements</h3>
            <p className="text-[#525252] text-sm leading-relaxed">
              Partagez le programme, les billets ou les formulaires d&apos;inscription en un simple scan.
            </p>
          </div>

          {/* E-commerce */}
          <div className="bento-card p-6">
            <div className="icon-box emerald mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-[#0a0a0a] mb-2">E-commerce</h3>
            <p className="text-[#525252] text-sm leading-relaxed">
              Liez vos emballages à vos fiches produit, tutoriels vidéo ou promotions en ligne.
            </p>
          </div>

          {/* Marketing */}
          <div className="bento-card p-6">
            <div className="icon-box emerald mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-[#0a0a0a] mb-2">Flyers &amp; Publicité</h3>
            <p className="text-[#525252] text-sm leading-relaxed">
              Redirigez vos supports papier vers vos pages web, offres spéciales ou landing pages.
            </p>
          </div>

          {/* PME */}
          <div className="bento-card p-6">
            <div className="icon-box emerald mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-[#0a0a0a] mb-2">TPE &amp; PME</h3>
            <p className="text-[#525252] text-sm leading-relaxed">
              Modernisez votre communication en reliant vos supports physiques à votre présence digitale.
            </p>
          </div>
        </div>
      </section>

      {/* Section FAQ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <span className="badge badge-emerald mb-4">FAQ</span>
            <h2 className="text-4xl font-bold tracking-tight text-[#0a0a0a]">
              Questions fréquentes
            </h2>
          </div>
          <p className="text-[#525252] text-sm max-w-xs md:text-right leading-relaxed">
            Tout ce que vous devez savoir avant de commencer.
          </p>
        </div>

        <div className="divide-y divide-[#f0f0f0]">
          <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-16 -mx-4 px-4 rounded-2xl hover:bg-white transition-colors duration-200">
            <div className="flex gap-4 items-start">
              <span className="font-mono text-xs font-bold text-[#10b981] mt-1.5 shrink-0 tracking-widest">01</span>
              <h3 className="font-bold text-lg text-[#0a0a0a] leading-snug">
                QRaft est-il vraiment gratuit ?
              </h3>
            </div>
            <p className="text-[#525252] text-sm leading-relaxed md:pt-1 pl-8 md:pl-0">
              Oui, QRaft est 100% gratuit. Vous pouvez créer des QR codes illimités, les personnaliser avec vos couleurs et votre logo, et les exporter en PNG, JPEG ou PDF — sans aucun frais ni carte bancaire.
            </p>
          </div>

          <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-16 -mx-4 px-4 rounded-2xl hover:bg-white transition-colors duration-200">
            <div className="flex gap-4 items-start">
              <span className="font-mono text-xs font-bold text-[#10b981] mt-1.5 shrink-0 tracking-widest">02</span>
              <h3 className="font-bold text-lg text-[#0a0a0a] leading-snug">
                Puis-je ajouter mon logo sur un QR code ?
              </h3>
            </div>
            <p className="text-[#525252] text-sm leading-relaxed md:pt-1 pl-8 md:pl-0">
              Oui. QRaft vous permet d&apos;intégrer votre logo au centre de votre QR code pour une personnalisation complète de votre identité visuelle. Le QR reste lisible grâce au niveau de correction d&apos;erreur élevé.
            </p>
          </div>

          <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-16 -mx-4 px-4 rounded-2xl hover:bg-white transition-colors duration-200">
            <div className="flex gap-4 items-start">
              <span className="font-mono text-xs font-bold text-[#10b981] mt-1.5 shrink-0 tracking-widest">03</span>
              <h3 className="font-bold text-lg text-[#0a0a0a] leading-snug">
                Quels formats d&apos;export sont disponibles ?
              </h3>
            </div>
            <p className="text-[#525252] text-sm leading-relaxed md:pt-1 pl-8 md:pl-0">
              QRaft propose trois formats : <strong className="text-[#0a0a0a] font-semibold">PNG</strong> pour le web et les réseaux sociaux, <strong className="text-[#0a0a0a] font-semibold">JPEG</strong> pour l&apos;impression standard, et <strong className="text-[#0a0a0a] font-semibold">PDF</strong> vectoriel pour une qualité parfaite quelle que soit la taille.
            </p>
          </div>

          <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-16 -mx-4 px-4 rounded-2xl hover:bg-white transition-colors duration-200">
            <div className="flex gap-4 items-start">
              <span className="font-mono text-xs font-bold text-[#10b981] mt-1.5 shrink-0 tracking-widest">04</span>
              <h3 className="font-bold text-lg text-[#0a0a0a] leading-snug">
                Puis-je suivre les scans de mes QR codes ?
              </h3>
            </div>
            <p className="text-[#525252] text-sm leading-relaxed md:pt-1 pl-8 md:pl-0">
              Oui. Chaque QR code dispose de statistiques complètes : nombre total de scans, évolution dans le temps, répartition par appareil (mobile/desktop), navigateur et système d&apos;exploitation, ainsi qu&apos;une carte géographique des scans.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
