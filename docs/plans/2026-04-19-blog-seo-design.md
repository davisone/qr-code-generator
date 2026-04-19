# Blog SEO — Design Document

## Objectif

Créer un blog SEO multilingue (12 langues) pour QRaft afin de capter du trafic organique via des tutoriels, use-cases par industrie et articles comparatifs. Cible : 216 URLs indexables au lancement (18 articles × 12 langues).

## Architecture

### Stack

- **Fichiers MDX** dans `content/blog/{locale}/{slug}.mdx`
- **next-mdx-remote** pour le parsing (App Router compatible)
- **gray-matter** pour le frontmatter
- **SSG** via `generateStaticParams` (pages statiques au build)
- **Design** : dark mode cohérent avec QRaft (emerald/orange)

### Structure fichiers

```
content/
└── blog/
    ├── fr/
    │   ├── comment-creer-qr-code-wifi.mdx
    │   └── ...
    ├── en/
    │   ├── how-to-create-wifi-qr-code.mdx
    │   └── ...
    └── ... (12 langues)

src/app/[locale]/blog/
├── page.tsx                    # Index blog (grille + filtres)
├── [slug]/
│   └── page.tsx                # Article individuel
└── category/
    └── [category]/
        └── page.tsx            # Articles par catégorie
```

### Frontmatter MDX

```yaml
---
title: "Comment créer un QR code WiFi gratuitement"
description: "Guide complet pour générer un QR code WiFi..."
date: "2026-04-19"
category: "tutorial"          # tutorial | use-case | comparison
image: "/blog/wifi-qr.webp"
author: "QRaft"
readingTime: 5
relatedGenerator: "wifi"      # CTA vers /qr-code-generator/wifi
---
```

## Pages

### Index blog (`/blog`)

- Grille de cards dark avec image, titre, catégorie, date, temps de lecture
- Filtres par catégorie (tutorial / use-case / comparison)
- Pagination (9 articles par page)

### Article (`/blog/[slug]`)

- Layout lecture : prose max-width ~720px, fond dark
- Table des matières auto-générée (H2/H3)
- CTA contextuel vers le générateur lié (relatedGenerator)
- Articles similaires en bas (même catégorie)
- Schema.org Article + BreadcrumbList
- Meta OG/Twitter avec image de couverture

### Catégorie (`/blog/category/[category]`)

- Même layout que l'index filtré par catégorie
- Meta title adapté : "Tutoriels QR Code | QRaft"

## Composants MDX custom

- `<CallToAction generator="wifi" />` — bannière CTA vers un générateur
- `<QRPreview content="..." />` — preview QR inline
- `<InfoBox type="tip|warning|info">` — encadré info
- `<ComparisonTable rows={[...]} />` — tableau comparatif stylisé

## Articles au lancement (18)

### Tutoriels (8)

1. Comment créer un QR code WiFi (wifi)
2. Comment créer un QR code vCard (vcard)
3. Comment créer un QR code pour un menu restaurant (menu-restaurant)
4. Comment obtenir plus d'avis Google avec un QR code (google-reviews)
5. Comment créer un QR code WhatsApp (whatsapp)
6. Comment créer un QR code pour un événement (event)
7. Comment créer un QR code pour un PDF (pdf)
8. Comment accepter des paiements crypto par QR code (crypto)

### Use-cases par industrie (6)

1. QR codes pour les restaurants et cafés
2. QR codes pour l'immobilier
3. QR codes pour les hôtels et l'hôtellerie
4. QR codes pour le retail et e-commerce
5. QR codes pour les événements et salons
6. QR codes pour l'éducation

### Comparatifs (4)

1. Meilleur générateur de QR code gratuit 2026
2. QR code dynamique vs statique : lequel choisir ?
3. QR code vs NFC : quelle technologie choisir ?
4. Comment choisir le bon type de QR code

## i18n

- 12 langues : fr, en, es, de, it, pt, nl, pt-BR, es-MX, ja, zh, ko
- Slugs localisés par langue (ex: FR `comment-creer-qr-code-wifi`, EN `how-to-create-wifi-qr-code`)
- Labels UI du blog dans les fichiers messages/{lang}.json (namespace `blog`)
- 18 articles × 12 langues = 216 URLs indexables
