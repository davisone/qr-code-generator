import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte gratuit",
  description:
    "Inscrivez-vous gratuitement sur QRaft pour créer des QR codes personnalisés illimités. Ajoutez votre logo, choisissez vos couleurs, exportez en PNG, JPEG ou PDF.",
  keywords: [
    "inscription QRaft",
    "créer compte QR code",
    "générateur QR code gratuit",
    "QR code personnalisé gratuit",
  ],
  openGraph: {
    title: "Créer un compte gratuit | QRaft",
    description:
      "Inscrivez-vous gratuitement pour créer des QR codes personnalisés illimités.",
    url: "https://qr-dvsweb.vercel.app/register",
  },
  alternates: {
    canonical: "https://qr-dvsweb.vercel.app/register",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
