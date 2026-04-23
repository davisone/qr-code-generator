import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | useqraft",
  description:
    "Gérez vos QR codes, consultez les statistiques et la carte des scans.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
