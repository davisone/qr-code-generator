import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Éditeur de QR code | useqraft",
  description:
    "Personnalisez votre QR code : couleurs, logo, taille et niveau de correction.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function QRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
