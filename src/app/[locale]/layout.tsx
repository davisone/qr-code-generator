import type { Metadata } from "next";
import { Bebas_Neue, Barlow, Courier_Prime } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/config";
import Providers from "@/components/Providers";
import { Footer } from "@/components/Footer";
import { ReviewBadge } from "@/components/ReviewBadge";
import { BottomTabs } from "@/components/BottomTabs";
import { Toaster } from "sonner";
import "../globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const barlow = Barlow({
  variable: "--font-sans",
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const courierPrime = Courier_Prime({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const localeDescriptions: Record<string, string> = {
  fr: "Générateur de QR codes gratuit et personnalisable",
  en: "Free and Customizable QR Code Generator",
  es: "Generador de códigos QR gratuito y personalizable",
  de: "Kostenloser und anpassbarer QR-Code-Generator",
  it: "Generatore di codici QR gratuito e personalizzabile",
  pt: "Gerador de códigos QR gratuito e personalizável",
  nl: "Gratis en aanpasbare QR-codegenerator",
  "pt-BR": "Gerador de QR codes gratuito e personalizável",
  "es-MX": "Generador de códigos QR gratuito y personalizable",
  ja: "無料でカスタマイズできるQRコードジェネレーター",
  zh: "免费可定制的二维码生成器",
  ko: "무료 맞춤형 QR 코드 생성기",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const desc = localeDescriptions[locale] ?? localeDescriptions.en;

  const hreflangAlternates: Record<string, string> = {};
  for (const l of routing.locales) {
    hreflangAlternates[l] = `${BASE_URL}/${l}`;
  }
  hreflangAlternates["x-default"] = `${BASE_URL}/en`;

  return {
    title: {
      default: `QRaft — ${desc}`,
      template: "%s | QRaft",
    },
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: hreflangAlternates,
    },
    openGraph: {
      type: "website",
      url: `${BASE_URL}/${locale}`,
      siteName: "QRaft",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "QRaft - QR Code Generator",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/opengraph-image"],
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
    authors: [{ name: "Evan Davison", url: BASE_URL }],
    creator: "DVS Web",
    publisher: "DVS Web",
    applicationName: "QRaft",
    category: "technology",
    verification: {
      google: "25Uq5WlF-uXpP54WzrYhkWNH1PuCrE6gphEpqzpvxOg",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Anti-FOUC theme script — static string, no user data, safe */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;document.documentElement.setAttribute('data-theme',(t==='dark'||(t===null&&d))?'dark':'light');}catch(e){}})();`,
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BKKJSJ30BS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BKKJSJ30BS');
          `}
        </Script>
      </head>
      <body
        className={`${bebasNeue.variable} ${barlow.variable} ${courierPrime.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "var(--card)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f0ebe1",
                  fontFamily: "var(--font-sans, sans-serif)",
                  fontSize: "0.8rem",
                },
              }}
            />
            <BottomTabs />
          </Providers>
          <Footer />
          <ReviewBadge />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
