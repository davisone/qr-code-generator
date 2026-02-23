import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geolocateIp } from "@/lib/geolocation";

function parseUserAgent(ua: string | null): { device: string; browser: string; os: string } {
  if (!ua) return { device: "unknown", browser: "unknown", os: "unknown" };

  // Detect device
  let device = "desktop";
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    device = /iPad|Tablet/i.test(ua) ? "tablet" : "mobile";
  }

  // Detect browser
  let browser = "unknown";
  if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua)) browser = "Safari";
  else if (/Opera|OPR/i.test(ua)) browser = "Opera";

  // Detect OS
  let os = "unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS|Macintosh/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iOS|iPhone|iPad|iPod/i.test(ua)) os = "iOS";

  return { device, browser, os };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qrCodeId } = body;

    if (!qrCodeId) {
      return NextResponse.json({ error: "qrCodeId requis" }, { status: 400 });
    }

    // Verify QR code exists and is public
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
    });

    if (!qrCode) {
      return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });
    }

    // Get request info
    const userAgent = req.headers.get("user-agent");
    const referer = req.headers.get("referer");
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddress = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    const { device, browser, os } = parseUserAgent(userAgent);

    // Create scan record
    const scan = await prisma.scan.create({
      data: {
        qrCodeId,
        ipAddress,
        userAgent,
        referer,
        device,
        browser,
        os,
      },
    });

    // Géolocalisation non bloquante
    geolocateIp(ipAddress).then(async (geo) => {
      if (geo) {
        await prisma.scan.update({
          where: { id: scan.id },
          data: {
            latitude: geo.latitude,
            longitude: geo.longitude,
            country: geo.country,
            city: geo.city,
          },
        });
      }
    }).catch(() => {
      // Ignorer les erreurs de géolocalisation
    });

    return NextResponse.json({ success: true, scanId: scan.id }, { status: 201 });
  } catch (error) {
    console.error("Error tracking scan:", error);
    return NextResponse.json({ error: "Erreur lors du tracking" }, { status: 500 });
  }
}
