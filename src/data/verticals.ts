export interface Vertical {
  slug: string;
  /** Clé i18n dans le namespace "programmatic" */
  nameKey: string;
  generatorPath: string;
}

/**
 * 8 verticales métier avec le générateur QR le plus pertinent.
 * Les noms sont traduits via i18n — on stocke ici uniquement les slugs.
 */
export const verticals: Vertical[] = [
  { slug: "restaurant",  nameKey: "vertical_restaurant",  generatorPath: "/qr-code-generator/menu-restaurant" },
  { slug: "retail",       nameKey: "vertical_retail",       generatorPath: "/qr-code-generator/text" },
  { slug: "event",        nameKey: "vertical_event",        generatorPath: "/qr-code-generator/event" },
  { slug: "real-estate",  nameKey: "vertical_real_estate",  generatorPath: "/qr-code-generator/location" },
  { slug: "hotel",        nameKey: "vertical_hotel",        generatorPath: "/qr-code-generator/wifi" },
  { slug: "museum",       nameKey: "vertical_museum",       generatorPath: "/qr-code-generator/text" },
  { slug: "salon",        nameKey: "vertical_salon",        generatorPath: "/qr-code-generator/google-reviews" },
  { slug: "gym",          nameKey: "vertical_gym",          generatorPath: "/qr-code-generator/social-media" },
];

export const verticalSlugs = verticals.map((v) => v.slug);
