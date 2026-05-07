import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/share/", "/qr-code-generator/", "/qr-code/", "/compare/", "/use-cases/", "/glossary/", "/guides/", "/qr-templates/"],
      disallow: [
        "/api/",
        "/qrcode/",
        "/bulk/",
        "*/dashboard",
        "*/login",
        "*/register",
        "*/profile",
        "*/api-keys",
        "*/forgot-password",
        "*/reset-password",
        "*/verify-email",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
