import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/qrcode/"],
    },
    sitemap: "https://qr-dvsweb.vercel.app/sitemap.xml",
  };
}