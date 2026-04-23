import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation API | useqraft",
  description:
    "Documentation complète de l'API useqraft : endpoints, authentification et exemples.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
