import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BASE_URL } from "@/lib/config";

const DEFAULT_OG_IMAGE = "/opengraph-image";

function getShareDescription(type: string, content: string): string {
  if (type === "url") {
    try {
      const url = new URL(content);
      const host = url.hostname.replace(/^www\./, "");
      return `QR code public vers ${host}. Scannez pour accéder au contenu.`;
    } catch {
      return "QR code public partagé avec QRaft.";
    }
  }

  const normalizedContent = content.replace(/\s+/g, " ").trim();
  if (!normalizedContent) {
    return "QR code texte partagé avec QRaft.";
  }

  const preview =
    normalizedContent.length > 120
      ? `${normalizedContent.slice(0, 117)}...`
      : normalizedContent;

  return `QR code contenant: ${preview}`;
}

// Métadonnées dynamiques basées sur le QR code partagé
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;

  const qrCode = await prisma.qRCode.findUnique({
    where: { shareToken: token, isPublic: true },
    select: { name: true, content: true, type: true },
  });

  if (!qrCode) {
    return {
      title: "QR Code partagé | QRaft",
      description: "Ce QR code n'existe pas ou n'est plus partagé.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = getShareDescription(qrCode.type, qrCode.content);
  const title = `${qrCode.name} | QRaft`;
  const canonicalUrl = `${BASE_URL}/share/${token}`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "QRaft",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 512,
          height: 512,
          alt: "QRaft - QR code partagé",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
