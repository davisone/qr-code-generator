import type { QRType } from "@/lib/qr-formats";

// Catégories de templates couvertes par le marketplace
export type TemplateCategory =
  | "business"
  | "restaurant"
  | "event"
  | "retail"
  | "personal"
  | "real_estate"
  | "hospitality"
  | "education";

// Palette couleurs partagée avec les CSS vars du site
const INK = "#1a1410";
const BG = "#f0ebe1";
const CARD = "#e8e2d6";
const RED = "#d4290f";
const YELLOW = "#f0b500";
const WHITE = "#ffffff";

export interface QRTemplate {
  id: string;
  name: string; // clé i18n — templates.items.<id>.name
  descriptionKey: string; // clé i18n — templates.items.<id>.description
  category: TemplateCategory;
  type: QRType;
  isPro: boolean;
  defaultMetadata?: Record<string, unknown>;
  defaultContent?: string;
  defaultStyle: {
    foregroundColor: string;
    backgroundColor: string;
    errorCorrection: "L" | "M" | "Q" | "H";
    logoEmoji?: string;
  };
}

// ──────────────────────────────────────────────────────────────────────
// 24 templates — 3 par catégorie × 8 catégories
// ──────────────────────────────────────────────────────────────────────

export const QR_TEMPLATES: QRTemplate[] = [
  // ── BUSINESS ─────────────────────────────────────────────
  {
    id: "business-card-pro",
    name: "templates.items.business-card-pro.name",
    descriptionKey: "templates.items.business-card-pro.description",
    category: "business",
    type: "vcard",
    isPro: false,
    defaultMetadata: {
      fullname: "",
      phone: "",
      email: "",
      org: "",
      url: "",
      note: "",
    },
    defaultStyle: {
      foregroundColor: INK,
      backgroundColor: YELLOW,
      errorCorrection: "H",
      logoEmoji: "💼",
    },
  },
  {
    id: "linkedin-profile",
    name: "templates.items.linkedin-profile.name",
    descriptionKey: "templates.items.linkedin-profile.description",
    category: "business",
    type: "url",
    isPro: false,
    defaultContent: "https://www.linkedin.com/in/",
    defaultStyle: {
      foregroundColor: "#0a66c2",
      backgroundColor: BG,
      errorCorrection: "M",
      logoEmoji: "💼",
    },
  },
  {
    id: "corporate-website",
    name: "templates.items.corporate-website.name",
    descriptionKey: "templates.items.corporate-website.description",
    category: "business",
    type: "url",
    isPro: true,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: INK,
      backgroundColor: WHITE,
      errorCorrection: "M",
      logoEmoji: "🏢",
    },
  },

  // ── RESTAURANT ───────────────────────────────────────────
  {
    id: "menu-qr",
    name: "templates.items.menu-qr.name",
    descriptionKey: "templates.items.menu-qr.description",
    category: "restaurant",
    type: "url",
    isPro: false,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: RED,
      backgroundColor: CARD,
      errorCorrection: "M",
      logoEmoji: "🍽️",
    },
  },
  {
    id: "google-reviews",
    name: "templates.items.google-reviews.name",
    descriptionKey: "templates.items.google-reviews.description",
    category: "restaurant",
    type: "url",
    isPro: false,
    defaultContent: "https://g.page/r/",
    defaultStyle: {
      foregroundColor: "#f0b500",
      backgroundColor: "#1a1410",
      errorCorrection: "M",
      logoEmoji: "⭐",
    },
  },
  {
    id: "instagram-food",
    name: "templates.items.instagram-food.name",
    descriptionKey: "templates.items.instagram-food.description",
    category: "restaurant",
    type: "social",
    isPro: true,
    defaultMetadata: { platform: "instagram" },
    defaultContent: "https://instagram.com/",
    defaultStyle: {
      foregroundColor: "#d4290f",
      backgroundColor: "#f0ebe1",
      errorCorrection: "M",
      logoEmoji: "📸",
    },
  },

  // ── EVENT ────────────────────────────────────────────────
  {
    id: "ticket-qr",
    name: "templates.items.ticket-qr.name",
    descriptionKey: "templates.items.ticket-qr.description",
    category: "event",
    type: "text",
    isPro: false,
    defaultMetadata: { text: "" },
    defaultStyle: {
      foregroundColor: INK,
      backgroundColor: YELLOW,
      errorCorrection: "H",
      logoEmoji: "🎫",
    },
  },
  {
    id: "save-the-date",
    name: "templates.items.save-the-date.name",
    descriptionKey: "templates.items.save-the-date.description",
    category: "event",
    type: "url",
    isPro: false,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: RED,
      backgroundColor: CARD,
      errorCorrection: "M",
      logoEmoji: "📅",
    },
  },
  {
    id: "agenda-calendar",
    name: "templates.items.agenda-calendar.name",
    descriptionKey: "templates.items.agenda-calendar.description",
    category: "event",
    type: "url",
    isPro: true,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: YELLOW,
      backgroundColor: INK,
      errorCorrection: "M",
      logoEmoji: "🗓️",
    },
  },

  // ── RETAIL ───────────────────────────────────────────────
  {
    id: "promo-code",
    name: "templates.items.promo-code.name",
    descriptionKey: "templates.items.promo-code.description",
    category: "retail",
    type: "text",
    isPro: false,
    defaultMetadata: { text: "" },
    defaultStyle: {
      foregroundColor: RED,
      backgroundColor: WHITE,
      errorCorrection: "H",
      logoEmoji: "🏷️",
    },
  },
  {
    id: "loyalty-card",
    name: "templates.items.loyalty-card.name",
    descriptionKey: "templates.items.loyalty-card.description",
    category: "retail",
    type: "url",
    isPro: true,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: INK,
      backgroundColor: YELLOW,
      errorCorrection: "M",
      logoEmoji: "🎁",
    },
  },
  {
    id: "product-info",
    name: "templates.items.product-info.name",
    descriptionKey: "templates.items.product-info.description",
    category: "retail",
    type: "url",
    isPro: true,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: INK,
      backgroundColor: CARD,
      errorCorrection: "M",
      logoEmoji: "📦",
    },
  },

  // ── PERSONAL ─────────────────────────────────────────────
  {
    id: "wifi-home",
    name: "templates.items.wifi-home.name",
    descriptionKey: "templates.items.wifi-home.description",
    category: "personal",
    type: "wifi",
    isPro: false,
    defaultMetadata: { ssid: "", password: "", security: "WPA" },
    defaultStyle: {
      foregroundColor: INK,
      backgroundColor: CARD,
      errorCorrection: "M",
      logoEmoji: "📶",
    },
  },
  {
    id: "personal-vcard",
    name: "templates.items.personal-vcard.name",
    descriptionKey: "templates.items.personal-vcard.description",
    category: "personal",
    type: "vcard",
    isPro: false,
    defaultMetadata: {
      fullname: "",
      phone: "",
      email: "",
      org: "",
      url: "",
      note: "",
    },
    defaultStyle: {
      foregroundColor: INK,
      backgroundColor: BG,
      errorCorrection: "H",
      logoEmoji: "👤",
    },
  },
  {
    id: "social-bio-link",
    name: "templates.items.social-bio-link.name",
    descriptionKey: "templates.items.social-bio-link.description",
    category: "personal",
    type: "url",
    isPro: true,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: RED,
      backgroundColor: YELLOW,
      errorCorrection: "M",
      logoEmoji: "🔗",
    },
  },

  // ── REAL ESTATE ──────────────────────────────────────────
  {
    id: "property-listing",
    name: "templates.items.property-listing.name",
    descriptionKey: "templates.items.property-listing.description",
    category: "real_estate",
    type: "url",
    isPro: true,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: INK,
      backgroundColor: YELLOW,
      errorCorrection: "M",
      logoEmoji: "🏠",
    },
  },
  {
    id: "virtual-tour",
    name: "templates.items.virtual-tour.name",
    descriptionKey: "templates.items.virtual-tour.description",
    category: "real_estate",
    type: "url",
    isPro: true,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: RED,
      backgroundColor: CARD,
      errorCorrection: "M",
      logoEmoji: "🎥",
    },
  },
  {
    id: "agent-contact",
    name: "templates.items.agent-contact.name",
    descriptionKey: "templates.items.agent-contact.description",
    category: "real_estate",
    type: "vcard",
    isPro: false,
    defaultMetadata: {
      fullname: "",
      phone: "",
      email: "",
      org: "",
      url: "",
      note: "",
    },
    defaultStyle: {
      foregroundColor: INK,
      backgroundColor: CARD,
      errorCorrection: "H",
      logoEmoji: "🏢",
    },
  },

  // ── HOSPITALITY ──────────────────────────────────────────
  {
    id: "hotel-wifi",
    name: "templates.items.hotel-wifi.name",
    descriptionKey: "templates.items.hotel-wifi.description",
    category: "hospitality",
    type: "wifi",
    isPro: false,
    defaultMetadata: { ssid: "", password: "", security: "WPA" },
    defaultStyle: {
      foregroundColor: INK,
      backgroundColor: CARD,
      errorCorrection: "M",
      logoEmoji: "🏨",
    },
  },
  {
    id: "room-checkin",
    name: "templates.items.room-checkin.name",
    descriptionKey: "templates.items.room-checkin.description",
    category: "hospitality",
    type: "url",
    isPro: true,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: YELLOW,
      backgroundColor: INK,
      errorCorrection: "M",
      logoEmoji: "🔑",
    },
  },
  {
    id: "room-service-menu",
    name: "templates.items.room-service-menu.name",
    descriptionKey: "templates.items.room-service-menu.description",
    category: "hospitality",
    type: "url",
    isPro: true,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: RED,
      backgroundColor: CARD,
      errorCorrection: "M",
      logoEmoji: "🛎️",
    },
  },

  // ── EDUCATION ────────────────────────────────────────────
  {
    id: "course-resource",
    name: "templates.items.course-resource.name",
    descriptionKey: "templates.items.course-resource.description",
    category: "education",
    type: "url",
    isPro: false,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: INK,
      backgroundColor: BG,
      errorCorrection: "M",
      logoEmoji: "📚",
    },
  },
  {
    id: "class-materials",
    name: "templates.items.class-materials.name",
    descriptionKey: "templates.items.class-materials.description",
    category: "education",
    type: "url",
    isPro: true,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: YELLOW,
      backgroundColor: CARD,
      errorCorrection: "M",
      logoEmoji: "📖",
    },
  },
  {
    id: "event-signup",
    name: "templates.items.event-signup.name",
    descriptionKey: "templates.items.event-signup.description",
    category: "education",
    type: "url",
    isPro: true,
    defaultContent: "",
    defaultStyle: {
      foregroundColor: RED,
      backgroundColor: YELLOW,
      errorCorrection: "M",
      logoEmoji: "✍️",
    },
  },
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "business",
  "restaurant",
  "event",
  "retail",
  "personal",
  "real_estate",
  "hospitality",
  "education",
];

export function getTemplateById(id: string): QRTemplate | undefined {
  return QR_TEMPLATES.find((t) => t.id === id);
}
