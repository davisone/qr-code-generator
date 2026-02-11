import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous à QRaft pour créer, personnaliser et gérer vos QR codes. Accédez à votre espace personnel gratuit.",
  openGraph: {
    title: "Connexion | QRaft",
    description:
      "Connectez-vous à QRaft pour créer et gérer vos QR codes personnalisés.",
    url: "https://qr-dvsweb.vercel.app/login",
  },
  alternates: {
    canonical: "https://qr-dvsweb.vercel.app/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
