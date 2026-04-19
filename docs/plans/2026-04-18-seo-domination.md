# SEO Domination — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Passer de ~50 pages indexées à ~5 000+ pages, capter du trafic organique international massif via générateurs gratuits, pages programmatiques ville×vertical, et autorité backlinks.

**Architecture:** 4 piliers — (1) 11 nouveaux générateurs QR standalone, (2) pages programmatiques `[vertical]/[city]` auto-générées via fichiers JSON, (3) SEO technique (sitemap étendu, schema.org enrichi, robots.txt, internal linking), (4) autorité (widget embed, badge powered-by, annuaires SaaS).

**Tech Stack:** Next.js 16 App Router, next-intl (12 langues), Prisma 7, Tailwind CSS v4, schema.org JSON-LD.

**Domaine :** `useqraft.com`

---

## Contexte existant

### Pattern générateur déjà en place (WiFi, vCard, Menu, Google Reviews)
- Page server : `src/app/[locale]/qr-code-generator/[type]/page.tsx`
- Client interactif : `[Type]GeneratorClient.tsx` dans le même dossier
- Layout partagé : `src/app/[locale]/qr-code-generator/layout.tsx` (navbar + breadcrumb)
- Metadata helper : `src/app/[locale]/qr-code-generator/metadata-helpers.ts`
- Composants réutilisables : `GeneratorHero`, `GeneratorForm`, `GeneratorGuide`, `GeneratorFAQ`, `GeneratorCTA`, `FormField`, `JsonLd`
- JSON-LD : WebApplication + BreadcrumbList + FAQPage
- Formats QR existants dans `src/lib/qr-formats.ts` : url, text, wifi, vcard, email, phone, sms, whatsapp, geo, social

### Namespace i18n manquant
Le namespace `seo_generator` est référencé par les pages mais **n'existe pas** dans `messages/*.json`. Il faut le créer pour les 12 langues.

---

## Task 1 : Créer le namespace `seo_generator` dans les 12 fichiers i18n

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/fr.json`
- Modify: les 10 autres fichiers de langue

**Ce namespace contient :**
- Clés communes : `common.badge_free`, `common.preview_label`, `common.download_png/svg/pdf`, `common.cta_title/body/button`, `common.faq_label`, `breadcrumb_home`, `breadcrumb_generators`, `errors.required`
- Pour chaque type de générateur : `[type].meta_title`, `[type].meta_description`, `[type].breadcrumb`, `[type].kicker`, `[type].title`, `[type].subtitle`, `[type].empty_hint`, `[type].form.*`, `[type].guide.*` (4 steps), `[type].faq.*` (5 Q&A)

**Langues :** en, fr, es, de, it, pt, nl, pt-BR, es-MX, ja, zh, ko

**Ordre :** D'abord `en` complet comme référence, puis traduire dans les 11 autres langues.

**Types à couvrir (15 total) :**
wifi ✅, vcard ✅, menu_restaurant ✅, google_reviews ✅, whatsapp, email, sms, location, event, social_media, pdf, crypto, phone, text, app_store

---

## Task 2 : Créer les 11 nouvelles pages générateur

Pour chaque nouveau type, créer dans `src/app/[locale]/qr-code-generator/` :

### 2.1 — WhatsApp (`whatsapp/`)
- `page.tsx` — metadata + JSON-LD + composants serveur
- `WhatsAppGeneratorClient.tsx` — form : numéro de téléphone + message pré-rempli
- Utilise `buildContent("whatsapp", { phone, message })`

### 2.2 — Email (`email/`)
- `page.tsx` + `EmailGeneratorClient.tsx`
- Form : adresse email + sujet + corps
- Utilise `buildContent("email", { to, subject, body })`

### 2.3 — SMS (`sms/`)
- `page.tsx` + `SmsGeneratorClient.tsx`
- Form : numéro + message
- Utilise `buildContent("sms", { phone, message })`

### 2.4 — Location / Maps (`location/`)
- `page.tsx` + `LocationGeneratorClient.tsx`
- Form : latitude, longitude, label (ou recherche adresse)
- Utilise `buildContent("geo", { lat, lng, label })`

### 2.5 — Event / Calendar (`event/`)
- `page.tsx` + `EventGeneratorClient.tsx`
- Form : titre, date début, date fin, lieu, description
- Génère format iCalendar (VCALENDAR/VEVENT)
- **Nouveau format** : ajouter `"event"` dans `qr-formats.ts`

### 2.6 — Social Media (`social-media/`)
- `page.tsx` + `SocialMediaGeneratorClient.tsx`
- Form : URL du profil (Instagram, TikTok, LinkedIn, Facebook, X, YouTube)
- Utilise `buildContent("social", { url })`

### 2.7 — PDF (`pdf/`)
- `page.tsx` + `PdfGeneratorClient.tsx`
- Form : URL du PDF
- Utilise `buildContent("url", { url })` (c'est une URL classique, mais la page est ciblée SEO)

### 2.8 — Crypto / Bitcoin (`crypto/`)
- `page.tsx` + `CryptoGeneratorClient.tsx`
- Form : type (BTC/ETH/LTC), adresse, montant optionnel
- **Nouveau format** : ajouter `"crypto"` dans `qr-formats.ts` (format BIP21 : `bitcoin:ADDRESS?amount=X`)

### 2.9 — Phone Call (`phone/`)
- `page.tsx` + `PhoneGeneratorClient.tsx`
- Form : numéro de téléphone
- Utilise `buildContent("phone", { phone })`

### 2.10 — Plain Text (`text/`)
- `page.tsx` + `TextGeneratorClient.tsx`
- Form : textarea pour texte libre
- Utilise `buildContent("text", { text })`

### 2.11 — App Store (`app-store/`)
- `page.tsx` + `AppStoreGeneratorClient.tsx`
- Form : URL App Store ou Google Play
- Utilise `buildContent("url", { url })`

**Pattern identique pour chaque page :**
```tsx
// page.tsx
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo_generator" });
  return buildGeneratorMetadata({ locale, path: "/qr-code-generator/[type]", title: t("[type].meta_title"), description: t("[type].meta_description") });
}

export default async function Page({ params }) {
  // JSON-LD (WebApplication + BreadcrumbList + FAQPage)
  // GeneratorHero + ClientComponent + GeneratorGuide + GeneratorCTA + GeneratorFAQ
}
```

---

## Task 3 : Ajouter les formats manquants dans `qr-formats.ts`

**File:** `src/lib/qr-formats.ts`

Ajouter 2 nouveaux types :

```typescript
// Ajouter au type QRType
| "event"
| "crypto"

// Ajouter au QR_TYPE_LIST
{ type: "event",  labelKey: "type_event" },
{ type: "crypto", labelKey: "type_crypto" },

// Ajouter dans buildContent switch
case "event": {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${fields.title || ""}`,
    `DTSTART:${fields.start || ""}`,
    `DTEND:${fields.end || ""}`,
    `LOCATION:${fields.location || ""}`,
    `DESCRIPTION:${fields.description || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\n");
}

case "crypto": {
  const address = fields.address || "";
  const amount = fields.amount ? `?amount=${fields.amount}` : "";
  const prefix = fields.currency === "ETH" ? "ethereum" : fields.currency === "LTC" ? "litecoin" : "bitcoin";
  return `${prefix}:${address}${amount}`;
}
```

---

## Task 4 : Pages programmatiques ville × vertical

### 4.1 — Créer les fichiers de données

**File:** `src/data/cities.ts`

Objet structuré par locale, chaque locale contient les top 30-50 villes du/des pays de cette langue :
```typescript
export const cities: Record<string, { slug: string; name: string; country: string }[]> = {
  en: [
    { slug: "london", name: "London", country: "UK" },
    { slug: "new-york", name: "New York", country: "US" },
    // ... 48 autres
  ],
  fr: [
    { slug: "paris", name: "Paris", country: "FR" },
    { slug: "lyon", name: "Lyon", country: "FR" },
    // ...
  ],
  // ... 10 autres langues
};
```

**File:** `src/data/verticals.ts`

```typescript
export const verticals: Record<string, { slug: string; name: string; icon: string; description: string }[]> = {
  en: [
    { slug: "restaurant", name: "Restaurant", icon: "🍽️", description: "..." },
    { slug: "retail", name: "Retail Store", icon: "🛍️", description: "..." },
    { slug: "event", name: "Event", icon: "🎫", description: "..." },
    { slug: "real-estate", name: "Real Estate", icon: "🏠", description: "..." },
    { slug: "hotel", name: "Hotel", icon: "🏨", description: "..." },
    { slug: "museum", name: "Museum", icon: "🏛️", description: "..." },
    { slug: "salon", name: "Hair & Beauty Salon", icon: "💇", description: "..." },
    { slug: "gym", name: "Gym & Fitness", icon: "💪", description: "..." },
  ],
  // ... 11 autres langues
};
```

### 4.2 — Créer la route dynamique

**Files:**
- Create: `src/app/[locale]/qr-code/[vertical]/[city]/page.tsx`
- Create: `src/app/[locale]/qr-code/[vertical]/[city]/layout.tsx`
- Create: `src/app/[locale]/qr-code/layout.tsx` (réutiliser le même layout que les générateurs)

**`page.tsx` :**
- `generateStaticParams()` — itère `cities × verticals × locales` pour pré-générer toutes les combinaisons
- `generateMetadata()` — titre/description dynamique : "QR Code for {vertical} in {city} — Free Generator | QRaft"
- JSON-LD : `WebApplication` + `BreadcrumbList` (Home > QR Code > {Vertical} > {City}) + `FAQPage` (5 Q&A contextualisées)
- Contenu de la page :
  - Hero avec H1 : "QR CODE FOR {VERTICAL} IN {CITY}"
  - Section "Why use QR codes for {vertical} in {city}" (3-4 paragraphes templated)
  - Section "How to create" (réutiliser `GeneratorGuide` avec steps contextualisés)
  - CTA vers le générateur correspondant (`/qr-code-generator/[type-associé]`)
  - FAQ section (5 Q&A contextualisées ville+vertical)
  - Internal links vers les autres villes de la même vertical
  - Internal links vers les autres verticals de la même ville

### 4.3 — Pages index par vertical

**File:** `src/app/[locale]/qr-code/[vertical]/page.tsx`

- Page listant toutes les villes disponibles pour cette vertical
- H1 : "QR CODE FOR {VERTICAL}"
- Grille de liens vers chaque ville
- JSON-LD : `CollectionPage` + `BreadcrumbList`

### 4.4 — Page index hub

**File:** `src/app/[locale]/qr-code/page.tsx`

- Page hub listant toutes les verticales
- H1 : "QR CODE BY INDUSTRY"
- Grille de cards par vertical avec nombre de villes
- JSON-LD : `CollectionPage`

---

## Task 5 : Étendre le sitemap

**File:** `src/app/sitemap.ts`

Ajouter :
1. Toutes les pages générateurs (15 types × 12 langues = 180 URLs)
2. Toutes les pages programmatiques (8 verticals × ~40 villes × 12 langues = ~3 840 URLs)
3. Pages index vertical (8 × 12 = 96 URLs)
4. Page hub qr-code (12 URLs)
5. Page pricing par locale (12 URLs)

**Stratégie :** Utiliser un sitemap index avec sous-sitemaps si > 5 000 URLs (limite Google recommandée par sitemap).

```typescript
// Approche : multiple sitemaps
// /sitemap.xml → sitemap index
// /sitemap/0.xml → pages statiques + home + pricing + legal
// /sitemap/1.xml → générateurs
// /sitemap/2.xml → pages programmatiques (villes)
// /sitemap/3.xml → QR codes publics partagés
```

**Fichier à créer :** `src/app/sitemap.ts` → refactorer en sitemap index avec `generateSitemaps()`.

---

## Task 6 : Mettre à jour robots.txt

**File:** `src/app/robots.ts`

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/share/", "/qr-code-generator/", "/qr-code/"],
      disallow: ["/api/", "/dashboard/", "/qrcode/", "/login", "/register", "/profile", "/api-keys/", "/bulk/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

---

## Task 7 : Schema.org enrichi

### 7.1 — Page pricing : `Product` schema
**File:** `src/app/[locale]/pricing/PricingClient.tsx` ou `page.tsx`

Ajouter JSON-LD `Product` avec 2 offres (Free/Pro), `AggregateRating` si reviews disponibles.

### 7.2 — Guides générateurs : `HowTo` schema
**File:** Chaque `page.tsx` de générateur

Ajouter `HowTo` au `@graph` JSON-LD :
```json
{
  "@type": "HowTo",
  "name": "How to create a WiFi QR code",
  "step": [
    { "@type": "HowToStep", "name": "...", "text": "..." },
    ...
  ]
}
```

### 7.3 — Organization enrichi
**File:** `src/app/[locale]/page.tsx`

Ajouter `sameAs` (liens réseaux sociaux), `logo`, `contactPoint`.

---

## Task 8 : SEO technique — quick wins

### 8.1 — dns-prefetch / preconnect
**File:** `src/app/[locale]/layout.tsx`

Ajouter dans `<head>` :
```html
<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

### 8.2 — Canonical dynamique sur pages légales
**Files:** `src/app/[locale]/cgu/page.tsx`, `mentions-legales/page.tsx`, `politique-confidentialite/page.tsx`

Remplacer le canonical hardcodé `/fr/...` par `/${locale}/...`.

### 8.3 — Internal linking automatique
**File:** Créer `src/components/seo-generator/InternalLinks.tsx`

Composant qui affiche des liens vers les générateurs connexes et les pages villes populaires. Ajouté en bas de chaque page générateur et chaque page programmatique.

---

## Task 9 : Widget embed + badge powered-by

### 9.1 — Widget embed
**File:** Créer `src/app/[locale]/embed/page.tsx`

Page `/embed` qui sert un générateur QR minimaliste dans un iframe. Les sites tiers peuvent l'intégrer avec :
```html
<iframe src="https://useqraft.com/en/embed" width="400" height="500"></iframe>
```

Ajouter un lien "Powered by QRaft" dans le widget → backlink naturel.

### 9.2 — Page "Embed our widget"
**File:** Créer `src/app/[locale]/embed/docs/page.tsx`

Documentation pour intégrateurs avec code snippet à copier.

---

## Ordre d'exécution recommandé

1. **Task 1** — i18n `seo_generator` (bloque tout le reste)
2. **Task 3** — Formats QR manquants (event, crypto)
3. **Task 2** — 11 nouvelles pages générateur (le plus gros impact SEO immédiat)
4. **Task 6** — Robots.txt (ouvrir le crawl)
5. **Task 8** — Quick wins techniques
6. **Task 7** — Schema.org enrichi
7. **Task 4** — Pages programmatiques (le plus gros volume)
8. **Task 5** — Sitemap étendu
9. **Task 9** — Widget embed (backlinks)

---

## Impact estimé

| Pilier | Pages | Trafic estimé (6 mois) |
|--------|-------|----------------------|
| Générateurs (15) | 180 | 8-15K/mois |
| Pages villes (8×40×12) | ~3 840 | 5-12K/mois |
| Pages index verticales | 108 | 500-1K/mois |
| SEO technique | — | +15-25% sur existant |
| Widget/backlinks | — | Autorité domaine ↑ |
| **Total** | **~4 130** | **15-30K/mois** |
