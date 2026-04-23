export interface Competitor {
  slug: string;
  name: string;
  url: string;
  /** Clé i18n dans le namespace "compare" */
  nameKey: string;
  features: {
    freeQrCodes: boolean;
    dynamicQr: boolean;
    analytics: boolean;
    customColors: boolean;
    logoUpload: boolean;
    batchExport: boolean;
    api: boolean;
    scanMap: boolean;
  };
  pricingNote: string;
  freeTier: string;
}

export const competitors: Competitor[] = [
  {
    slug: "useqraft-vs-qr-code-generator",
    name: "QR Code Generator",
    url: "https://www.qr-code-generator.com",
    nameKey: "qr_code_generator",
    features: { freeQrCodes: true, dynamicQr: true, analytics: true, customColors: true, logoUpload: true, batchExport: true, api: true, scanMap: true },
    pricingNote: "12.99€/mo",
    freeTier: "1 dynamic QR",
  },
  {
    slug: "useqraft-vs-qr-monkey",
    name: "QR Monkey",
    url: "https://www.qrcode-monkey.com",
    nameKey: "qr_monkey",
    features: { freeQrCodes: true, dynamicQr: false, analytics: false, customColors: true, logoUpload: true, batchExport: false, api: false, scanMap: false },
    pricingNote: "Free",
    freeTier: "Unlimited static",
  },
  {
    slug: "useqraft-vs-qr-code-ai",
    name: "QR Code AI",
    url: "https://www.qrcode-ai.com",
    nameKey: "qr_code_ai",
    features: { freeQrCodes: true, dynamicQr: true, analytics: true, customColors: true, logoUpload: true, batchExport: false, api: true, scanMap: false },
    pricingNote: "9.99$/mo",
    freeTier: "3 dynamic QR",
  },
  {
    slug: "useqraft-vs-beaconstac",
    name: "Beaconstac",
    url: "https://www.beaconstac.com",
    nameKey: "beaconstac",
    features: { freeQrCodes: true, dynamicQr: true, analytics: true, customColors: true, logoUpload: true, batchExport: true, api: true, scanMap: true },
    pricingNote: "5$/mo",
    freeTier: "1 dynamic QR",
  },
  {
    slug: "useqraft-vs-uniqode",
    name: "Uniqode",
    url: "https://www.uniqode.com",
    nameKey: "uniqode",
    features: { freeQrCodes: true, dynamicQr: true, analytics: true, customColors: true, logoUpload: true, batchExport: true, api: true, scanMap: true },
    pricingNote: "5$/mo",
    freeTier: "1 dynamic QR",
  },
  {
    slug: "useqraft-vs-flowcode",
    name: "Flowcode",
    url: "https://www.flowcode.com",
    nameKey: "flowcode",
    features: { freeQrCodes: true, dynamicQr: true, analytics: true, customColors: true, logoUpload: false, batchExport: false, api: false, scanMap: false },
    pricingNote: "11$/mo",
    freeTier: "Unlimited static",
  },
  {
    slug: "useqraft-vs-qr-tiger",
    name: "QR Tiger",
    url: "https://www.qrcode-tiger.com",
    nameKey: "qr_tiger",
    features: { freeQrCodes: true, dynamicQr: true, analytics: true, customColors: true, logoUpload: true, batchExport: true, api: true, scanMap: true },
    pricingNote: "7$/mo",
    freeTier: "3 dynamic QR",
  },
  {
    slug: "useqraft-vs-scanova",
    name: "Scanova",
    url: "https://scanova.io",
    nameKey: "scanova",
    features: { freeQrCodes: true, dynamicQr: true, analytics: true, customColors: true, logoUpload: true, batchExport: false, api: true, scanMap: false },
    pricingNote: "5$/mo",
    freeTier: "2 dynamic QR",
  },
];

export const competitorSlugs = competitors.map((c) => c.slug);
