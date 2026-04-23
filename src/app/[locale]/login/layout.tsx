import type { Metadata } from "next";
import { BASE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous à useqraft pour créer, personnaliser et gérer vos QR codes. Accédez à votre espace personnel gratuit.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Connexion | useqraft",
    description:
      "Connectez-vous à useqraft pour créer et gérer vos QR codes personnalisés.",
    url: `${BASE_URL}/login`,
    type: "website",
  },
  alternates: {
    canonical: `${BASE_URL}/login`,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
