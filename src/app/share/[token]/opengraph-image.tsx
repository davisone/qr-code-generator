import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const qrCode = await prisma.qRCode.findUnique({
    where: { shareToken: token, isPublic: true },
    select: { name: true, type: true, content: true },
  });

  const title = qrCode?.name ?? "QR Code partagé";

  let subtitle = "QR code partagé via QRaft";
  if (qrCode?.type === "url") {
    try {
      const host = new URL(qrCode.content).hostname.replace(/^www\./, "");
      subtitle = `Lien vers ${host}`;
    } catch {
      subtitle = "QR code URL";
    }
  } else if (qrCode?.type === "text") {
    subtitle = "QR code texte";
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent vert */}
        <div
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            width: "6px",
            height: "100%",
            background: "#10b981",
          }}
        />

        {/* Décoration */}
        <div
          style={{
            position: "absolute",
            right: "80px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "200px",
            height: "200px",
            borderRadius: "24px",
            background: "#10b98115",
            border: "2px solid #10b98130",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg viewBox="0 0 100 100" width="140" height="140">
            <rect fill="#10b981" x="10" y="10" width="30" height="30" rx="3" />
            <rect fill="#10b981" x="60" y="10" width="30" height="30" rx="3" />
            <rect fill="#10b981" x="10" y="60" width="30" height="30" rx="3" />
            <rect fill="#0a0a0a" x="15" y="15" width="20" height="20" rx="2" />
            <rect fill="#0a0a0a" x="65" y="15" width="20" height="20" rx="2" />
            <rect fill="#0a0a0a" x="15" y="65" width="20" height="20" rx="2" />
            <rect fill="#10b981" x="45" y="10" width="10" height="10" rx="1" />
            <rect fill="#10b981" x="45" y="25" width="10" height="10" rx="1" />
            <rect fill="#10b981" x="10" y="45" width="10" height="10" rx="1" />
            <rect fill="#10b981" x="45" y="45" width="25" height="25" rx="4" />
            <rect fill="#10b981" x="75" y="45" width="15" height="10" rx="1" />
            <rect fill="#10b981" x="45" y="75" width="10" height="15" rx="1" />
            <rect fill="#10b981" x="60" y="75" width="10" height="15" rx="1" />
            <rect fill="#10b981" x="75" y="60" width="15" height="10" rx="1" />
          </svg>
        </div>

        {/* Tag QRaft */}
        <div
          style={{
            background: "#10b98120",
            border: "1px solid #10b98140",
            borderRadius: "100px",
            padding: "8px 20px",
            display: "flex",
            marginBottom: "32px",
          }}
        >
          <span style={{ color: "#10b981", fontSize: "18px", fontWeight: 600 }}>
            QRaft
          </span>
        </div>

        {/* Titre */}
        <div
          style={{
            color: "white",
            fontSize: "64px",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-2px",
            maxWidth: "720px",
            marginBottom: "24px",
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* Sous-titre */}
        <div
          style={{
            color: "#a3a3a3",
            fontSize: "26px",
            display: "flex",
            marginBottom: "20px",
          }}
        >
          {subtitle}
        </div>

        {/* CTA */}
        <div
          style={{
            color: "#525252",
            fontSize: "20px",
            display: "flex",
          }}
        >
          qr-aft.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
