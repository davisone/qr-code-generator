import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous à QRaft pour créer, personnaliser et gérer vos QR codes.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}