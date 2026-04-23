import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil | useqraft",
  description: "Gérez votre profil et vos paramètres de compte useqraft.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
