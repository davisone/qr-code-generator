import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réinitialisation mot de passe | useqraft",
  description:
    "Choisissez un nouveau mot de passe pour votre compte useqraft.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
