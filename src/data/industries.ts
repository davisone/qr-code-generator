export interface Industry {
  slug: string;
  /** Clé i18n dans le namespace "use_cases" */
  nameKey: string;
  /** Types de QR recommandés pour cette industrie */
  recommendedGenerators: string[];
  /** Slug vertical existant dans verticals.ts (si applicable) */
  verticalSlug?: string;
}

export const industries: Industry[] = [
  { slug: "restaurant", nameKey: "restaurant", recommendedGenerators: ["menu-restaurant", "google-reviews", "wifi"], verticalSlug: "restaurant" },
  { slug: "retail", nameKey: "retail", recommendedGenerators: ["text", "social-media", "google-reviews"], verticalSlug: "retail" },
  { slug: "hotel", nameKey: "hotel", recommendedGenerators: ["wifi", "menu-restaurant", "google-reviews"], verticalSlug: "hotel" },
  { slug: "real-estate", nameKey: "real_estate", recommendedGenerators: ["location", "vcard", "pdf"], verticalSlug: "real-estate" },
  { slug: "event", nameKey: "event", recommendedGenerators: ["event", "wifi", "social-media"], verticalSlug: "event" },
  { slug: "museum", nameKey: "museum", recommendedGenerators: ["text", "pdf", "location"], verticalSlug: "museum" },
  { slug: "salon", nameKey: "salon", recommendedGenerators: ["google-reviews", "vcard", "social-media"], verticalSlug: "salon" },
  { slug: "gym", nameKey: "gym", recommendedGenerators: ["social-media", "wifi", "vcard"], verticalSlug: "gym" },
  { slug: "healthcare", nameKey: "healthcare", recommendedGenerators: ["vcard", "pdf", "location"] },
  { slug: "logistics", nameKey: "logistics", recommendedGenerators: ["text", "pdf", "location"] },
  { slug: "education", nameKey: "education", recommendedGenerators: ["wifi", "pdf", "event"] },
  { slug: "tourism", nameKey: "tourism", recommendedGenerators: ["location", "wifi", "text"] },
  { slug: "construction", nameKey: "construction", recommendedGenerators: ["pdf", "vcard", "location"] },
  { slug: "automotive", nameKey: "automotive", recommendedGenerators: ["vcard", "google-reviews", "pdf"] },
  { slug: "nonprofit", nameKey: "nonprofit", recommendedGenerators: ["social-media", "event", "pdf"] },
  { slug: "fitness", nameKey: "fitness", recommendedGenerators: ["social-media", "wifi", "event"] },
  { slug: "beauty", nameKey: "beauty", recommendedGenerators: ["google-reviews", "social-media", "vcard"] },
  { slug: "agriculture", nameKey: "agriculture", recommendedGenerators: ["text", "pdf", "location"] },
];

export const industrySlugs = industries.map((i) => i.slug);
