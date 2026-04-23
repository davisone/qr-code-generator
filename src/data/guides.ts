export interface Guide {
  slug: string;
  /** Clé i18n dans le namespace "guides" */
  guideKey: string;
  /** Nombre de sections dans le guide */
  sectionCount: number;
  /** Termes du glossaire liés */
  relatedGlossary: string[];
  /** Industries liées */
  relatedIndustries: string[];
  /** Générateurs liés */
  relatedGenerators: string[];
}

export const guides: Guide[] = [
  {
    slug: "complete-qr-code-guide-2026",
    guideKey: "complete_guide",
    sectionCount: 8,
    relatedGlossary: ["dynamic-qr-code", "static-qr-code", "error-correction", "qr-code-encoding", "qr-code-version"],
    relatedIndustries: ["restaurant", "retail", "event", "hotel"],
    relatedGenerators: ["text", "wifi", "vcard", "menu-restaurant"],
  },
  {
    slug: "dynamic-vs-static-qr-code",
    guideKey: "dynamic_vs_static",
    sectionCount: 6,
    relatedGlossary: ["dynamic-qr-code", "static-qr-code", "qr-code-tracking", "qr-code-expiration", "short-url-redirect"],
    relatedIndustries: ["restaurant", "retail", "event"],
    relatedGenerators: ["text", "menu-restaurant"],
  },
  {
    slug: "qr-codes-for-business",
    guideKey: "business_guide",
    sectionCount: 7,
    relatedGlossary: ["scan-analytics", "qr-code-tracking", "batch-qr-codes", "qr-code-api", "utm-tracking-qr"],
    relatedIndustries: ["restaurant", "retail", "hotel", "real-estate", "healthcare", "logistics"],
    relatedGenerators: ["vcard", "menu-restaurant", "google-reviews", "wifi", "pdf"],
  },
  {
    slug: "customize-qr-code-design",
    guideKey: "design_guide",
    sectionCount: 6,
    relatedGlossary: ["qr-code-logo", "qr-code-colors", "error-correction", "qr-code-size", "qr-code-resolution", "svg-vs-png-qr"],
    relatedIndustries: ["restaurant", "retail", "event"],
    relatedGenerators: ["text", "wifi", "vcard"],
  },
];

export const guideSlugs = guides.map((g) => g.slug);
