import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clés API | useqraft",
  description: "Gérez vos clés API pour accéder à l'API useqraft.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApiKeysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
