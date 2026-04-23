import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vérification email | useqraft",
  description: "Vérifiez votre adresse email pour activer votre compte useqraft.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
