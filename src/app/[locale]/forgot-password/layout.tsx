import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié | useqraft",
  description:
    "Réinitialisez votre mot de passe useqraft en quelques secondes.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
