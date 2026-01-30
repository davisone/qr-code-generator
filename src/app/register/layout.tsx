import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Inscrivez-vous gratuitement sur QR Generator pour créer des QR codes personnalisés avec couleurs, logo et export multi-formats.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}