import { NextRequest, NextResponse } from "next/server";
import { stripe, reactivateUserQRCodes, expireUserQRCodes } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Stripe v17+ : current_period_end est sur SubscriptionItem, pas sur Subscription
function getPeriodEnd(subscription: Stripe.Subscription): Date {
  const periodEnd = subscription.items.data[0]?.current_period_end;
  if (!periodEnd) throw new Error("current_period_end introuvable sur les items de l'abonnement");
  return new Date(periodEnd * 1000);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook secret manquant" }, { status: 500 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.userId;
        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const periodEnd = getPeriodEnd(subscription);

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: session.customer as string,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeStatus: subscription.status,
            stripeCurrentPeriodEnd: periodEnd,
          },
        });

        await reactivateUserQRCodes(userId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : (subscription.customer as { id: string }).id;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        });
        if (!user) break;

        const wasPastDue = (event.data.previous_attributes as Record<string, unknown>)?.status === "past_due";
        const isNowActive = subscription.status === "active";
        const periodEnd = getPeriodEnd(subscription);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeStatus: subscription.status,
            stripeCurrentPeriodEnd: periodEnd,
          },
        });

        if (wasPastDue && isNowActive) {
          await reactivateUserQRCodes(user.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : (subscription.customer as { id: string }).id;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        });
        if (!user) break;

        const periodEnd = getPeriodEnd(subscription);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripeStatus: "canceled",
            stripeCurrentPeriodEnd: periodEnd,
          },
        });

        await expireUserQRCodes(user.id, periodEnd);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
