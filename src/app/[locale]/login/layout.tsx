import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous à QRaft pour créer, personnaliser et gérer vos QR codes. Accédez à votre espace personnel gratuit.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Connexion | QRaft",
    description:
      "Connectez-vous à QRaft pour créer et gérer vos QR codes personnalisés.",
    url: "https://qr-aft.vercel.app/login",
    type: "website",
  },
  alternates: {
    canonical: "https://qr-aft.vercel.app/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
