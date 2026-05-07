import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const locales = new Set<string>(routing.locales);

const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirection 301 permanente pour les URLs sans préfixe de locale
  // (ex: /qr-code/hotel → /en/qr-code/hotel)
  const firstSegment = pathname.split("/")[1];
  if (firstSegment && !locales.has(firstSegment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}${pathname}`;
    return NextResponse.redirect(url, 301);
  }

  const response = intlMiddleware(request);

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|opengraph-image|sitemap|robots|.*\\..*).*)",
  ],
};
