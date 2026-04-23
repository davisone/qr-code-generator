export interface GlossaryTerm {
  slug: string;
  /** Clé i18n dans le namespace "glossary" */
  termKey: string;
  /** Slugs de termes liés */
  relatedTerms: string[];
  /** Type de générateur QR pertinent */
  relatedGenerator?: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  { slug: "dynamic-qr-code", termKey: "dynamic_qr_code", relatedTerms: ["static-qr-code", "qr-code-tracking", "short-url-redirect"], relatedGenerator: "text" },
  { slug: "static-qr-code", termKey: "static_qr_code", relatedTerms: ["dynamic-qr-code", "qr-code-encoding"], relatedGenerator: "text" },
  { slug: "error-correction", termKey: "error_correction", relatedTerms: ["qr-code-logo", "qr-code-size", "qr-code-version"] },
  { slug: "qr-code-vs-barcode", termKey: "qr_code_vs_barcode", relatedTerms: ["qr-code-encoding", "micro-qr-code"] },
  { slug: "qr-code-size", termKey: "qr_code_size", relatedTerms: ["qr-code-resolution", "error-correction", "qr-code-version"] },
  { slug: "qr-code-resolution", termKey: "qr_code_resolution", relatedTerms: ["svg-vs-png-qr", "qr-code-size"] },
  { slug: "vcard-qr-code", termKey: "vcard_qr_code", relatedTerms: ["mecard-format", "qr-code-encoding"], relatedGenerator: "vcard" },
  { slug: "wifi-qr-code", termKey: "wifi_qr_code", relatedTerms: ["qr-code-security", "qr-code-encoding"], relatedGenerator: "wifi" },
  { slug: "scan-analytics", termKey: "scan_analytics", relatedTerms: ["qr-code-tracking", "utm-tracking-qr", "dynamic-qr-code"] },
  { slug: "qr-code-tracking", termKey: "qr_code_tracking", relatedTerms: ["scan-analytics", "dynamic-qr-code", "utm-tracking-qr"] },
  { slug: "qr-code-expiration", termKey: "qr_code_expiration", relatedTerms: ["dynamic-qr-code", "static-qr-code"] },
  { slug: "qr-code-logo", termKey: "qr_code_logo", relatedTerms: ["error-correction", "qr-code-colors", "qr-code-size"] },
  { slug: "qr-code-colors", termKey: "qr_code_colors", relatedTerms: ["qr-code-logo", "error-correction"] },
  { slug: "svg-vs-png-qr", termKey: "svg_vs_png_qr", relatedTerms: ["qr-code-resolution", "batch-qr-codes"] },
  { slug: "batch-qr-codes", termKey: "batch_qr_codes", relatedTerms: ["qr-code-api", "svg-vs-png-qr"] },
  { slug: "qr-code-api", termKey: "qr_code_api", relatedTerms: ["batch-qr-codes", "dynamic-qr-code"] },
  { slug: "short-url-redirect", termKey: "short_url_redirect", relatedTerms: ["dynamic-qr-code", "qr-code-tracking"] },
  { slug: "utm-tracking-qr", termKey: "utm_tracking_qr", relatedTerms: ["scan-analytics", "qr-code-tracking", "short-url-redirect"] },
  { slug: "qr-code-security", termKey: "qr_code_security", relatedTerms: ["wifi-qr-code", "dynamic-qr-code"] },
  { slug: "nfc-vs-qr", termKey: "nfc_vs_qr", relatedTerms: ["qr-code-vs-barcode", "static-qr-code"] },
  { slug: "mecard-format", termKey: "mecard_format", relatedTerms: ["vcard-qr-code", "qr-code-encoding"], relatedGenerator: "vcard" },
  { slug: "epc-qr-code", termKey: "epc_qr_code", relatedTerms: ["qr-code-encoding", "qr-code-version"] },
  { slug: "qr-code-version", termKey: "qr_code_version", relatedTerms: ["qr-code-size", "error-correction", "micro-qr-code"] },
  { slug: "micro-qr-code", termKey: "micro_qr_code", relatedTerms: ["qr-code-version", "qr-code-vs-barcode"] },
  { slug: "qr-code-encoding", termKey: "qr_code_encoding", relatedTerms: ["qr-code-version", "static-qr-code", "vcard-qr-code"] },
];

export const glossaryTermSlugs = glossaryTerms.map((t) => t.slug);
