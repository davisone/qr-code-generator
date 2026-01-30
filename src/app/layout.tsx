import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "QR Generator — Créez des QR codes personnalisés gratuitement",
    template: "%s | QR Generator",
  },
  description:
    "Générez, personnalisez et partagez vos QR codes gratuitement. Couleurs, logo, export PNG/JPEG/PDF. Créé par DVS Web.",
  keywords: [
    "QR code",
    "générateur QR code",
    "QR code gratuit",
    "QR code personnalisé",
    "créer QR code",
    "QR code logo",
    "QR code couleur",
    "DVS Web",
  ],
  authors: [{ name: "Evan Davison", url: "https://qr-dvsweb.vercel.app" }],
  creator: "DVS Web",
  metadataBase: new URL("https://qr-dvsweb.vercel.app"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://qr-dvsweb.vercel.app",
    siteName: "QR Generator",
    title: "QR Generator — Créez des QR codes personnalisés gratuitement",
    description:
      "Générez, personnalisez et partagez vos QR codes gratuitement. Couleurs, logo, export PNG/JPEG/PDF.",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Generator — QR codes personnalisés gratuits",
    description:
      "Générez, personnalisez et partagez vos QR codes gratuitement. Couleurs, logo, export PNG/JPEG/PDF.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
