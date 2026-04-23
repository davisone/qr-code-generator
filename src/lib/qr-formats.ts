export type QRType =
  | "url"
  | "text"
  | "wifi"
  | "vcard"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "geo"
  | "social"
  | "event"
  | "crypto";

export const QR_TYPE_LIST: { type: QRType; labelKey: string }[] = [
  { type: "url",       labelKey: "type_url" },
  { type: "text",      labelKey: "type_text" },
  { type: "wifi",      labelKey: "type_wifi" },
  { type: "vcard",     labelKey: "type_vcard" },
  { type: "email",     labelKey: "type_email" },
  { type: "phone",     labelKey: "type_phone" },
  { type: "sms",       labelKey: "type_sms" },
  { type: "whatsapp",  labelKey: "type_whatsapp" },
  { type: "geo",       labelKey: "type_geo" },
  { type: "social",    labelKey: "type_social" },
  { type: "event",     labelKey: "type_event" },
  { type: "crypto",    labelKey: "type_crypto" },
];

export function buildContent(type: QRType, fields: Record<string, string>): string {
  switch (type) {
    case "url":
      return fields.url || "";

    case "text":
      return fields.text || "";

    case "wifi": {
      const ssid = fields.ssid || "";
      const security = fields.security || "WPA";
      const password = fields.password || "";
      const p = password ? `P:${password};` : "";
      return `WIFI:S:${ssid};T:${security};${p};`;
    }

    case "vcard": {
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${fields.fullname || ""}`];
      if (fields.phone)   lines.push(`TEL:${fields.phone}`);
      if (fields.email)   lines.push(`EMAIL:${fields.email}`);
      if (fields.org)     lines.push(`ORG:${fields.org}`);
      if (fields.url)     lines.push(`URL:${fields.url}`);
      if (fields.note)    lines.push(`NOTE:${fields.note}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }

    case "email": {
      const params = new URLSearchParams();
      if (fields.subject) params.set("subject", fields.subject);
      if (fields.body)    params.set("body", fields.body);
      const qs = params.toString();
      return `mailto:${fields.to || ""}${qs ? "?" + qs : ""}`;
    }

    case "phone":
      return `tel:${fields.phone || ""}`;

    case "sms": {
      const phone = fields.phone || "";
      const message = fields.message || "";
      return message ? `sms:${phone}?body=${encodeURIComponent(message)}` : `sms:${phone}`;
    }

    case "whatsapp": {
      const num = (fields.phone || "").replace(/\D/g, "");
      const msg = fields.message || "";
      return msg
        ? `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/${num}`;
    }

    case "geo": {
      const lat   = fields.lat   || "";
      const lng   = fields.lng   || "";
      const label = fields.label || "";
      return label
        ? `geo:${lat},${lng}?q=${encodeURIComponent(label)}`
        : `geo:${lat},${lng}`;
    }

    case "social":
      return fields.url || "";

    case "event": {
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//useqraft//EN",
        "BEGIN:VEVENT",
        `SUMMARY:${fields.title || ""}`,
        `DTSTART:${fields.start || ""}`,
        `DTEND:${fields.end || ""}`,
        `LOCATION:${fields.location || ""}`,
        `DESCRIPTION:${fields.description || ""}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ];
      return lines.join("\r\n");
    }

    case "crypto": {
      const address = fields.address || "";
      const amount = fields.amount ? `?amount=${fields.amount}` : "";
      const prefix =
        fields.currency === "ETH" ? "ethereum" :
        fields.currency === "LTC" ? "litecoin" : "bitcoin";
      return `${prefix}:${address}${amount}`;
    }

    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
