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
    default: "QRaft — Créez des QR codes personnalisés gratuitement",
    template: "%s | QRaft",
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
    "QRaft",
    "DVS Web",
  ],
  authors: [{ name: "Evan Davison", url: "https://qr-dvsweb.vercel.app" }],
  creator: "DVS Web",
  metadataBase: new URL("https://qr-dvsweb.vercel.app"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://qr-dvsweb.vercel.app",
    siteName: "QRaft",
    title: "QRaft — Créez des QR codes personnalisés gratuitement",
    description:
      "Générez, personnalisez et partagez vos QR codes gratuitement. Couleurs, logo, export PNG/JPEG/PDF.",
  },
  twitter: {
    card: "summary_large_image",
    title: "QRaft — QR codes personnalisés gratuits",
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PHPS0KM3EM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PHPS0KM3EM');
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
