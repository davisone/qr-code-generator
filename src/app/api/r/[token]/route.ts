import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geolocateIp } from "@/lib/geolocation";
import { checkScanRateLimit } from "@/lib/rate-limit";

function parseUserAgent(ua: string | null): { device: string; browser: string; os: string } {
  if (!ua) return { device: "unknown", browser: "unknown", os: "unknown" };

  let device = "desktop";
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    device = /iPad|Tablet/i.test(ua) ? "tablet" : "mobile";
  }

  let browser = "unknown";
  if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua)) browser = "Safari";
  else if (/Opera|OPR/i.test(ua)) browser = "Opera";

  let os = "unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS|Macintosh/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iOS|iPhone|iPad|iPod/i.test(ua)) os = "iOS";

  return { device, browser, os };
}

interface VariantLike {
  id: string;
  content: string;
  weight: number;
}

/**
 * Sélection pondérée d'une variante A/B.
 */
function pickWeightedVariant(variants: VariantLike[]): VariantLike | null {
  if (variants.length === 0) return null;
  const total = variants.reduce((sum, v) => sum + Math.max(0, v.weight), 0);
  if (total <= 0) return variants[0] ?? null;
  const r = Math.random() * total;
  let acc = 0;
  for (const v of variants) {
    acc += Math.max(0, v.weight);
    if (r < acc) return v;
  }
  return variants[variants.length - 1] ?? null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const qrCode = await prisma.qRCode.findUnique({
    where: { shareToken: token, isPublic: true },
    select: {
      id: true,
      content: true,
      type: true,
      expiresAt: true,
      shareToken: true,
      passwordHash: true,
      splitMode: true,
      variants: {
        select: { id: true, content: true, weight: true },
      },
    },
  });

  if (!qrCode) {
    return NextResponse.redirect(new URL("/", req.url), { status: 302 });
  }

  // Protection par mot de passe : check du cookie unlock
  if (qrCode.passwordHash) {
    const cookie = req.cookies.get(`qraft_unlock_${token}`);
    if (cookie?.value !== "1") {
      return NextResponse.redirect(new URL(`/r/${token}/password`, req.url), {
        status: 302,
      });
    }
  }

  // QR expiré → page d'expiration
  if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/qrcode/expired", req.url), { status: 302 });
  }

  // Sélection variante A/B testing
  let targetContent = qrCode.content;
  let targetVariantId: string | null = null;
  if (qrCode.splitMode === "ab" && qrCode.variants.length > 0) {
    const picked = pickWeightedVariant(qrCode.variants);
    if (picked) {
      targetContent = picked.content;
      targetVariantId = picked.id;
    }
  }

  // Types avec contenu non-URL : rediriger vers la page de display
  const isRedirectableContent =
    targetContent.startsWith("http://") || targetContent.startsWith("https://");
  if (qrCode.type !== "url" && !isRedirectableContent) {
    return NextResponse.redirect(
      new URL(`/qrcode/display/${qrCode.shareToken}`, req.url),
      { status: 302 }
    );
  }

  const userAgent = req.headers.get("user-agent");
  const referer = req.headers.get("referer");
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const { device, browser, os } = parseUserAgent(userAgent);

  const allowed = await checkScanRateLimit(ipAddress);
  if (allowed) {
    const geo = await geolocateIp(ipAddress);
    await prisma.scan.create({
      data: {
        qrCodeId: qrCode.id,
        ipAddress,
        userAgent,
        referer,
        device,
        browser,
        os,
        variantId: targetVariantId,
        ...(geo && {
          latitude: geo.latitude,
          longitude: geo.longitude,
          country: geo.country,
          city: geo.city,
        }),
      },
    });
  }

  return NextResponse.redirect(targetContent, { status: 302 });
}
