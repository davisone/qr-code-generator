import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "QRaft — Générateur de QR codes gratuit et personnalisable",
    template: "%s | QRaft",
  },
  description:
    "Créez des QR codes personnalisés gratuitement en quelques secondes. Ajoutez votre logo, choisissez vos couleurs, exportez en PNG, JPEG ou PDF. Simple, rapide et 100% gratuit.",
  keywords: [
    "QR code",
    "générateur QR code",
    "QR code gratuit",
    "QR code personnalisé",
    "créer QR code",
    "QR code logo",
    "QR code couleur",
    "QR code en ligne",
    "générateur QR code gratuit",
    "QR code maker",
    "code QR",
    "faire un QR code",
    "QR code PNG",
    "QR code PDF",
    "QR code haute qualité",
    "QRaft",
    "DVS Web",
  ],
  authors: [{ name: "Evan Davison", url: "https://qr-dvsweb.vercel.app" }],
  creator: "DVS Web",
  publisher: "DVS Web",
  applicationName: "QRaft",
  referrer: "origin-when-cross-origin",
  metadataBase: new URL("https://qr-dvsweb.vercel.app"),
  alternates: {
    canonical: "https://qr-dvsweb.vercel.app",
    languages: {
      "fr-FR": "https://qr-dvsweb.vercel.app",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://qr-dvsweb.vercel.app",
    siteName: "QRaft",
    title: "QRaft — Générateur de QR codes gratuit et personnalisable",
    description:
      "Créez des QR codes personnalisés gratuitement. Logo, couleurs, export PNG/JPEG/PDF. Simple et rapide.",
    images: [
      {
        url: "/QRaft.png",
        width: 512,
        height: 512,
        alt: "QRaft - Générateur de QR codes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QRaft — Générateur de QR codes gratuit",
    description:
      "Créez des QR codes personnalisés gratuitement. Logo, couleurs, export PNG/JPEG/PDF.",
    images: ["/QRaft.png"],
    creator: "@dvsweb",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/QRaft.png" },
      { url: "/QRaft.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/QRaft.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BVWND63T0M"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BVWND63T0M');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
