import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/stripe";
import Navbar from "@/components/Navbar";
import { PricingClient } from "./PricingClient";

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
