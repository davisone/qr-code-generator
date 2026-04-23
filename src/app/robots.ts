import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/share/", "/qr-code-generator/", "/qr-code/", "/compare/", "/use-cases/", "/glossary/", "/guides/", "/qr-templates/"],
      disallow: ["/api/", "/dashboard/", "/qrcode/", "/login", "/register", "/profile", "/api-keys/", "/bulk/", "/verify-email"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
