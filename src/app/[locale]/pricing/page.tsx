import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/stripe";
import { BASE_URL, buildHreflang } from "@/lib/config";
import Navbar from "@/components/Navbar";
import { PricingClient } from "./PricingClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const url = `${BASE_URL}/${locale}/pricing`;
  return {
    title: "Tarifs — Plans Gratuit et Pro | QRaft",
    description: "Comparez les plans QRaft : gratuit avec 5 QR codes et analytics de base, ou Pro à 9,99€/mois avec QR codes illimités, analytics complètes et export batch.",
    alternates: { canonical: url, languages: buildHreflang("/pricing") },
    openGraph: { title: "Tarifs QRaft", description: "Plans gratuit et Pro pour vos QR codes.", url, type: "website" },
  };
}

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

  let userIsPro = false;
  let hasStripeCustomer = false;

  if (session?.user) {
    const userId = (session.user as { id?: string }).id;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          stripeStatus: true,
          stripeCurrentPeriodEnd: true,
          stripeCustomerId: true,
        },
      });

      if (user) {
        userIsPro = isPro(user);
        hasStripeCustomer = !!user.stripeCustomerId;
      }
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <PricingClient
        isPro={userIsPro}
        hasStripeCustomer={hasStripeCustomer}
        isLoggedIn={!!session}
      />
    </div>
  );
}
