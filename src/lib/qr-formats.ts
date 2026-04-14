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
  | "social";

export const QR_TYPE_LIST: { type: QRType; icon: string; labelKey: string }[] = [
  { type: "url",       icon: "🔗", labelKey: "type_url" },
  { type: "text",      icon: "📝", labelKey: "type_text" },
  { type: "wifi",      icon: "📶", labelKey: "type_wifi" },
  { type: "vcard",     icon: "👤", labelKey: "type_vcard" },
  { type: "email",     icon: "✉️", labelKey: "type_email" },
  { type: "phone",     icon: "📞", labelKey: "type_phone" },
  { type: "sms",       icon: "💬", labelKey: "type_sms" },
  { type: "whatsapp",  icon: "📱", labelKey: "type_whatsapp" },
  { type: "geo",       icon: "📍", labelKey: "type_geo" },
  { type: "social",    icon: "🌐", labelKey: "type_social" },
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

    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
