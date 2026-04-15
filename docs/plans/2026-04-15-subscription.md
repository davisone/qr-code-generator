# Système d'abonnement Stripe — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implémenter un système d'abonnement freemium avec Stripe : QR codes expirant après 30j pour les gratuits, analytics floutées, plan Pro 9,99€/mois.

**Architecture:** Stripe Checkout hébergé + webhook pour synchroniser l'état DB. `isPro` calculé via helper côté serveur et exposé via `GET /api/user/subscription`. Les QR codes ont un champ `expiresAt` : null pour les Pro, date dans 30j pour les gratuits.

**Tech Stack:** Next.js 16 App Router, Prisma 7 + PostgreSQL, NextAuth 4, stripe npm, CSS vars existantes (--red, --ink, --bg, --card, --mid, Bebas Neue + Barlow).

---

## Contexte important

- **DB push** : toujours `npx prisma db push` puis `npx prisma generate` (jamais migrate dev)
- **Prisma output** : `src/generated/prisma` (chemin custom)
- **12 langues** : fr, en, es, de, it, pt, nl, pl, ru, zh, ja, ar — fichiers dans `messages/`
- **CSS vars** : `--bg`, `--ink`, `--red`, `--yellow`, `--mid`, `--light`, `--card`, `--rule`, `--rule-thin`
- **Polices** : `var(--font-display)` = Bebas Neue, `var(--font-sans)` = Barlow, `var(--font-mono)` = Courier Prime
- **Variables Stripe** (à mettre dans `.env.local` ET dans Vercel env vars, jamais commitées) :
  ```
  STRIPE_SECRET_KEY=rk_live_REDACTED
  STRIPE_WEBHOOK_SECRET=whsec_REDACTED
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_REDACTED
  STRIPE_SUBSCRIPTION_PRICE_ID=price_1TH35YRpu70AsgEIPpUWYBxB
  NEXT_PUBLIC_APP_URL=https://qr-aft.vercel.app
  ```

---

### Task 1 : Schema Prisma — champs Stripe + expiresAt

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1 : Ajouter les champs sur User**

Dans le modèle `User`, après `image String?`, ajouter :
```prisma
stripeCustomerId       String?   @unique
stripePriceId          String?
stripeStatus           String?
stripeCurrentPeriodEnd DateTime?
```

**Step 2 : Ajouter expiresAt sur QRCode**

Dans le modèle `QRCode`, après `updatedAt DateTime @updatedAt`, ajouter :
```prisma
expiresAt DateTime?
```

**Step 3 : Appliquer le schema**

```bash
npx prisma db push
npx prisma generate
```

Expected : "Your database is now in sync with your Prisma schema"

**Step 4 : Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): champs Stripe sur User + expiresAt sur QRCode"
```

---

### Task 2 : src/lib/stripe.ts — client Stripe + helpers

**Files:**
- Create: `src/lib/stripe.ts`

**Step 1 : Installer le package stripe**

```bash
npm install stripe
```

Expected : stripe ajouté dans package.json

**Step 2 : Créer src/lib/stripe.ts**

```typescript
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

/**
 * Retourne true si l'utilisateur a un abonnement Pro actif (+ grace period 7j).
 */
export function isPro(user: {
  stripeStatus?: string | null;
  stripeCurrentPeriodEnd?: Date | null;
}): boolean {
  if (user.stripeStatus !== "active") return false;
  if (!user.stripeCurrentPeriodEnd) return false;
  const graceEnd = new Date(user.stripeCurrentPeriodEnd);
  graceEnd.setDate(graceEnd.getDate() + 7);
  return graceEnd > new Date();
}

/**
 * Réactive tous les QR codes d'un utilisateur (expiresAt = null) quand il passe Pro.
 */
export async function reactivateUserQRCodes(userId: string): Promise<void> {
  await prisma.qRCode.updateMany({
    where: { userId },
    data: { expiresAt: null },
  });
}

/**
 * Marque les QR codes Pro comme expirant dans 7j (grace period) quand le sub expire.
 */
export async function expireUserQRCodes(userId: string, periodEnd: Date): Promise<void> {
  const expiresAt = new Date(periodEnd);
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.qRCode.updateMany({
    where: { userId, expiresAt: null },
    data: { expiresAt },
  });
}
```

**Step 3 : Commit**

```bash
git add src/lib/stripe.ts package.json package-lock.json
git commit -m "feat(stripe): client Stripe + helpers isPro / reactivate / expire"
```

---

### Task 3 : POST /api/qrcodes — expiresAt à la création

**Files:**
- Modify: `src/app/api/qrcodes/route.ts`

**Step 1 : Importer isPro**

En haut du fichier, après les imports existants :
```typescript
import { isPro } from "@/lib/stripe";
```

**Step 2 : Récupérer les champs Stripe du user**

Remplacer la ligne :
```typescript
const user = await prisma.user.findUnique({ where: { email: session.user.email } });
```
Par :
```typescript
const user = await prisma.user.findUnique({
  where: { email: session.user.email },
  select: {
    id: true,
    stripeStatus: true,
    stripeCurrentPeriodEnd: true,
  },
});
```

**Step 3 : Calculer expiresAt dans le create**

Dans `prisma.qRCode.create({ data: { ... } })`, ajouter après `shareToken: makePublic ? uuidv4() : null,` :
```typescript
expiresAt: isPro(user) ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
```

**Step 4 : Vérifier le build**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```

Expected : aucune erreur TypeScript

**Step 5 : Commit**

```bash
git add src/app/api/qrcodes/route.ts
git commit -m "feat(qrcodes): expiresAt 30j à la création pour les non-Pro"
```

---

### Task 4 : GET /api/r/[token] — check expiration

**Files:**
- Modify: `src/app/api/r/[token]/route.ts`

**Step 1 : Ajouter expiresAt dans le select**

Dans `prisma.qRCode.findUnique`, le select actuel est `{ id, content, type }`. Ajouter `expiresAt` :
```typescript
select: { id: true, content: true, type: true, expiresAt: true },
```

**Step 2 : Vérifier l'expiration avant le scan**

Juste après la vérification `if (!qrCode || qrCode.type !== "url")`, ajouter :
```typescript
// QR expiré → page d'expiration
if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
  return NextResponse.redirect(new URL("/qrcode/expired", req.url), { status: 302 });
}
```

**Note :** La page `/qrcode/expired` sera créée à la Task 5. Le middleware next-intl va automatiquement rediriger `/qrcode/expired` vers `/fr/qrcode/expired` (ou la locale détectée).

**Step 3 : Commit**

```bash
git add src/app/api/r/\[token\]/route.ts
git commit -m "feat(redirect): vérification expiration QR avant redirection"
```

---

### Task 5 : Page /[locale]/qrcode/expired

**Files:**
- Create: `src/app/[locale]/qrcode/expired/page.tsx`

**Step 1 : Créer la page**

```typescript
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";

export default function QRExpiredPage() {
  const t = useTranslations("expired");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(5rem, 20vw, 12rem)",
            color: "var(--red)",
            lineHeight: 1,
            opacity: 0.15,
            userSelect: "none",
            marginBottom: "-2rem",
          }}
        >
          QR
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 6vw, 4rem)",
            letterSpacing: "0.04em",
            color: "var(--ink)",
            marginBottom: "1rem",
          }}
        >
          {t("title")}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.95rem",
            color: "var(--mid)",
            marginBottom: "2.5rem",
            maxWidth: "36ch",
            margin: "0 auto 2.5rem",
          }}
        >
          {t("desc")}
        </p>
        <Link
          href="/pricing"
          style={{
            display: "inline-block",
            background: "var(--red)",
            color: "white",
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0.9rem 2rem",
            textDecoration: "none",
            border: "none",
          }}
        >
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
```

**Step 2 : Vérifier build**

```bash
npm run build 2>&1 | grep -E "error|Error|expired"
```

Expected : `/[locale]/qrcode/expired` apparaît dans les routes

**Step 3 : Commit**

```bash
git add src/app/\[locale\]/qrcode/expired/page.tsx
git commit -m "feat: page QR code expiré avec CTA vers /pricing"
```

---

### Task 6 : API Stripe Checkout + Portal

**Files:**
- Create: `src/app/api/stripe/checkout/route.ts`
- Create: `src/app/api/stripe/portal/route.ts`

**Step 1 : Créer src/app/api/stripe/checkout/route.ts**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, stripeCustomerId: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: user.stripeCustomerId || undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
    line_items: [
      {
        price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard?upgrade=success`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

**Step 2 : Créer src/app/api/stripe/portal/route.ts**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${baseUrl}/dashboard`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

**Step 3 : Vérifier build**

```bash
npm run build 2>&1 | grep -E "error|stripe"
```

**Step 4 : Commit**

```bash
git add src/app/api/stripe/checkout/route.ts src/app/api/stripe/portal/route.ts
git commit -m "feat(stripe): API checkout + portail client"
```

---

### Task 7 : POST /api/stripe/webhook

**Files:**
- Create: `src/app/api/stripe/webhook/route.ts`

**Step 1 : Créer le webhook**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe, reactivateUserQRCodes, expireUserQRCodes } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
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

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: session.customer as string,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeStatus: subscription.status,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        await reactivateUserQRCodes(userId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
          select: { id: true },
        });
        if (!user) break;

        const wasActive = (event.data.previous_attributes as Record<string, unknown>)?.status === "active";
        const isNowActive = subscription.status === "active";

        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeStatus: subscription.status,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        // Réactivation si le paiement passe (past_due → active)
        if (!wasActive && isNowActive) {
          await reactivateUserQRCodes(user.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
          select: { id: true },
        });
        if (!user) break;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripeStatus: "canceled",
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        // Grace period 7j : les QR expirent à periodEnd + 7j
        await expireUserQRCodes(user.id, new Date(subscription.current_period_end * 1000));
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
```

**Step 2 : Vérifier build**

```bash
npm run build 2>&1 | grep -E "error|webhook"
```

**Step 3 : Commit**

```bash
git add src/app/api/stripe/webhook/route.ts
git commit -m "feat(stripe): webhook — checkout, subscription updated/deleted"
```

---

### Task 8 : GET /api/user/subscription

**Files:**
- Create: `src/app/api/user/subscription/route.ts`

Ce endpoint permet aux composants client (Navbar, Dashboard, Analytics) de savoir si l'utilisateur est Pro sans modifier la session NextAuth.

**Step 1 : Créer le fichier**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/stripe";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ isPro: false, status: null, periodEnd: null });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { stripeStatus: true, stripeCurrentPeriodEnd: true },
  });

  if (!user) return NextResponse.json({ isPro: false, status: null, periodEnd: null });

  return NextResponse.json({
    isPro: isPro(user),
    status: user.stripeStatus,
    periodEnd: user.stripeCurrentPeriodEnd?.toISOString() ?? null,
  });
}
```

**Step 2 : Commit**

```bash
git add src/app/api/user/subscription/route.ts
git commit -m "feat(api): GET /api/user/subscription — statut Pro de l'utilisateur"
```

---

### Task 9 : Page /[locale]/pricing

**Files:**
- Create: `src/app/[locale]/pricing/page.tsx`

**Step 1 : Créer la page**

La page suit le design system existant : fond `--bg`, titres Bebas Neue, boutons style `btn`. Elle est un Server Component qui lit l'état Pro via l'API session côté serveur.

```typescript
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

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { stripeStatus: true, stripeCurrentPeriodEnd: true, stripeCustomerId: true },
    });
    if (user) {
      userIsPro = isPro(user);
      hasStripeCustomer = !!user.stripeCustomerId;
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <PricingClient isPro={userIsPro} hasStripeCustomer={hasStripeCustomer} isLoggedIn={!!session} />
    </div>
  );
}
```

**Step 2 : Créer src/app/[locale]/pricing/PricingClient.tsx**

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState } from "react";

interface Props {
  isPro: boolean;
  hasStripeCustomer: boolean;
  isLoggedIn: boolean;
}

export function PricingClient({ isPro, hasStripeCustomer, isLoggedIn }: Props) {
  const t = useTranslations("pricing");
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  const sectionStyle = { borderBottom: "var(--rule)" };
  const labelStyle = {
    fontSize: "0.65rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "var(--mid)",
    fontFamily: "var(--font-sans)",
  };

  const featureRow = (text: string, pro = false) => (
    <div
      key={text}
      className="flex items-center gap-3 py-2"
      style={{ borderBottom: "var(--rule-thin)" }}
    >
      <span style={{ color: pro ? "var(--red)" : "var(--mid)", fontSize: "1rem", flexShrink: 0 }}>
        {pro ? "✓" : "✓"}
      </span>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--ink)" }}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <p style={{ ...labelStyle, marginBottom: "0.75rem" }}>{t("label")}</p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 8vw, 6rem)",
            letterSpacing: "0.04em",
            color: "var(--ink)",
            lineHeight: 1,
            marginBottom: "1rem",
          }}
        >
          {t("title")}
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--mid)", maxWidth: "40ch", margin: "0 auto" }}>
          {t("subtitle")}
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-0" style={{ border: "var(--rule)" }}>

        {/* Free */}
        <div style={{ ...sectionStyle, borderRight: "2px solid #1a1410", padding: "2rem" }}>
          <p style={labelStyle}>{t("free_label")}</p>
          <div className="flex items-baseline gap-2 my-4">
            <span style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", color: "var(--ink)", lineHeight: 1 }}>0€</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--mid)" }}>/{t("month")}</span>
          </div>
          <div className="space-y-1 mb-8">
            {featureRow(t("feature_create"))}
            {featureRow(t("feature_customize"))}
            {featureRow(t("feature_export"))}
            {featureRow(t("feature_share"))}
            {featureRow(t("feature_expire"))}
            {featureRow(t("feature_analytics_limited"))}
          </div>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              style={{
                display: "block",
                textAlign: "center",
                padding: "0.75rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--mid)",
                border: "var(--rule)",
                textDecoration: "none",
              }}
            >
              {t("free_cta_connected")}
            </Link>
          ) : (
            <Link
              href="/register"
              style={{
                display: "block",
                textAlign: "center",
                padding: "0.75rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--mid)",
                border: "var(--rule)",
                textDecoration: "none",
              }}
            >
              {t("free_cta")}
            </Link>
          )}
        </div>

        {/* Pro */}
        <div style={{ padding: "2rem", background: "var(--ink)", position: "relative" }}>
          <p style={{ ...labelStyle, color: "rgba(240,235,225,0.5)" }}>{t("pro_label")}</p>
          <div className="flex items-baseline gap-2 my-4">
            <span style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", color: "#f0ebe1", lineHeight: 1 }}>9,99€</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "rgba(240,235,225,0.5)" }}>/{t("month")}</span>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--red)", marginBottom: "1.25rem" }}>
            {t("annual_hint")}
          </p>
          <div className="space-y-1 mb-8">
            {[
              t("feature_create"),
              t("feature_customize"),
              t("feature_export"),
              t("feature_share"),
              t("feature_no_expire"),
              t("feature_analytics_full"),
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color: "var(--red)", fontSize: "1rem", flexShrink: 0 }}>✓</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#f0ebe1" }}>{f}</span>
              </div>
            ))}
          </div>

          {isPro ? (
            <button
              onClick={handlePortal}
              disabled={loading}
              style={{
                display: "block",
                width: "100%",
                padding: "0.9rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                background: "rgba(255,255,255,0.15)",
                color: "#f0ebe1",
                border: "1px solid rgba(255,255,255,0.3)",
                cursor: "pointer",
              }}
            >
              {loading ? t("loading") : t("manage_cta")}
            </button>
          ) : isLoggedIn ? (
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                display: "block",
                width: "100%",
                padding: "0.9rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                background: "var(--red)",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              {loading ? t("loading") : t("pro_cta")}
            </button>
          ) : (
            <Link
              href="/register"
              style={{
                display: "block",
                textAlign: "center",
                padding: "0.9rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                background: "var(--red)",
                color: "white",
                textDecoration: "none",
              }}
            >
              {t("pro_cta_guest")}
            </Link>
          )}
        </div>
      </div>

      {/* FAQ rapide */}
      <div className="mt-16 grid sm:grid-cols-2 gap-6">
        {[
          { q: t("faq_1_q"), a: t("faq_1_a") },
          { q: t("faq_2_q"), a: t("faq_2_a") },
          { q: t("faq_3_q"), a: t("faq_3_a") },
          { q: t("faq_4_q"), a: t("faq_4_a") },
        ].map(({ q, a }) => (
          <div key={q} style={{ borderTop: "var(--rule)", paddingTop: "1.25rem" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.04em", color: "var(--ink)", marginBottom: "0.5rem" }}>{q}</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--mid)", lineHeight: 1.6 }}>{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 3 : Vérifier build**

```bash
npm run build 2>&1 | grep -E "error|pricing"
```

**Step 4 : Commit**

```bash
git add src/app/\[locale\]/pricing/page.tsx src/app/\[locale\]/pricing/PricingClient.tsx
git commit -m "feat: page pricing Free vs Pro avec Stripe Checkout"
```

---

### Task 10 : Dashboard — badges expiration + QR grisés + toast upgrade

**Files:**
- Modify: `src/app/[locale]/dashboard/page.tsx`

**Step 1 : Ajouter les imports et états**

Ajouter après les imports existants :
```typescript
import { useSearchParams } from "next/navigation";
```

Ajouter dans le composant, après `const [deleting, setDeleting] = useState(false);` :
```typescript
const [proStatus, setProStatus] = useState<{ isPro: boolean } | null>(null);
const searchParams = useSearchParams();
```

**Step 2 : Charger le statut Pro au mount**

Dans le `useEffect` qui appelle `loadQRCodes` (celui conditionné par `status === "authenticated"`), ajouter l'appel parallèle :
```typescript
useEffect(() => {
  if (status === "authenticated") {
    loadQRCodes();
    fetch("/api/user/subscription")
      .then((r) => r.json())
      .then(setProStatus)
      .catch(() => {});
  }
}, [status, loadQRCodes]);
```

**Step 3 : Toast upgrade=success**

Ajouter un useEffect pour détecter le param `upgrade=success` :
```typescript
useEffect(() => {
  if (searchParams?.get("upgrade") === "success") {
    toast.success(t("toast_upgrade_success"));
    // Recharger le statut Pro
    fetch("/api/user/subscription").then((r) => r.json()).then(setProStatus).catch(() => {});
  }
}, [searchParams, t]);
```

**Step 4 : Ajouter expiresAt et shareToken dans QRCodeItem**

Dans l'interface `QRCodeItem`, ajouter :
```typescript
expiresAt: string | null;
```
(shareToken est déjà présent)

**Step 5 : Helpers expiration**

Ajouter ces fonctions dans le composant, avant le return :
```typescript
function getDaysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}
```

**Step 6 : Badge expiration sur les cartes QR**

Dans le JSX qui affiche chaque QR code (chercher l'endroit où `qr.name` est affiché sur les cartes), ajouter conditionnellement après le nom :

```tsx
{(() => {
  if (isExpired(qr.expiresAt)) {
    return (
      <span style={{
        fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.08em", background: "var(--mid)", color: "var(--bg)",
        padding: "0.15rem 0.4rem", fontFamily: "var(--font-sans)",
      }}>
        {t("badge_expired")}
      </span>
    );
  }
  const days = getDaysUntilExpiry(qr.expiresAt);
  if (days !== null && days <= 7) {
    return (
      <span style={{
        fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.08em", background: "var(--red)", color: "white",
        padding: "0.15rem 0.4rem", fontFamily: "var(--font-sans)",
      }}>
        {t("badge_expires_soon", { days })}
      </span>
    );
  }
  return null;
})()}
```

**Step 7 : QR expiré grisé**

Sur le conteneur de chaque carte QR, ajouter `opacity: isExpired(qr.expiresAt) ? 0.45 : 1` dans le style.

**Step 8 : Commit**

```bash
git add src/app/\[locale\]/dashboard/page.tsx
git commit -m "feat(dashboard): badges expiration + toast upgrade success"
```

---

### Task 11 : Analytics — blur + overlay Pro

**Files:**
- Modify: `src/components/Analytics.tsx`

**Step 1 : Ajouter la prop isPro**

Changer la signature du composant :
```typescript
export default function Analytics({ qrCodeId, isPro = false }: { qrCodeId: string; isPro?: boolean }) {
```

**Step 2 : Wrapper blur pour les sections payantes**

Ajouter ce composant inline dans le fichier, avant le `return` principal :
```typescript
const ProGate = ({ children }: { children: React.ReactNode }) => {
  if (isPro) return <>{children}</>;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ filter: "blur(6px)", pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "0.75rem",
        background: "rgba(26, 20, 16, 0.55)",
      }}>
        <span style={{ fontSize: "1.5rem" }}>🔒</span>
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.08em", color: "#f0ebe1",
        }}>
          Fonctionnalité Pro
        </p>
        <a href="/pricing" style={{
          fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.08em",
          background: "var(--red)", color: "white", padding: "0.5rem 1.25rem",
          textDecoration: "none", border: "none",
        }}>
          Passer Pro →
        </a>
      </div>
    </div>
  );
};
```

**Step 3 : Appliquer ProGate sur les sections**

- Laisser les 4 stat cards (totalScans, scansToday, scansThisWeek, scansThisMonth) **toutes visibles**
- Envelopper dans `<ProGate>` : la section Daily Chart, la section Device Stats, la section Browser Stats, la section OS Stats, la section Recent Scans

Exemple :
```tsx
<ProGate>
  <div className="bento-card p-6">
    <h3 ...>Scans des 30 derniers jours</h3>
    ...AreaChart...
  </div>
</ProGate>
```

**Step 4 : Passer isPro depuis le Dashboard**

Dans `src/app/[locale]/dashboard/page.tsx`, trouver l'usage de `<Analytics qrCodeId={...} />` et passer la prop :
```tsx
<Analytics qrCodeId={selectedQRCodeForAnalytics} isPro={proStatus?.isPro ?? false} />
```

**Step 5 : Commit**

```bash
git add src/components/Analytics.tsx src/app/\[locale\]/dashboard/page.tsx
git commit -m "feat(analytics): blur + overlay Pro sur graphiques pour plan gratuit"
```

---

### Task 12 : Navbar — badge PRO + lien Pricing

**Files:**
- Modify: `src/components/Navbar.tsx`

**Step 1 : Ajouter le hook pour le statut Pro**

En haut du composant, après `const { data: session } = useSession();` :
```typescript
const [isPro, setIsPro] = useState(false);

useEffect(() => {
  if (session) {
    fetch("/api/user/subscription")
      .then((r) => r.json())
      .then((d) => setIsPro(d.isPro ?? false))
      .catch(() => {});
  }
}, [session]);
```

Ajouter `useState, useEffect` aux imports de React si pas déjà présents.

**Step 2 : Ajouter le badge PRO dans le nav**

Dans la partie droite de la navbar (div avec `flex items-stretch`), après le nom d'utilisateur et avant le lien Profil, ajouter :
```tsx
{isPro && (
  <span
    className="hidden sm:flex items-center px-3 text-xs font-bold uppercase tracking-widest border-l"
    style={{
      color: "var(--red)",
      borderColor: "rgba(255,255,255,0.08)",
      fontFamily: "var(--font-sans)",
      letterSpacing: "0.12em",
    }}
  >
    PRO
  </span>
)}
```

**Step 3 : Ajouter lien Pricing dans la navbar (si non connecté)**

Après le lien Profil existant, ajouter un lien vers /pricing visible pour tous :
```tsx
<Link
  href="/pricing"
  className="flex items-center px-4 text-xs uppercase tracking-widest font-bold border-l transition-colors"
  style={{
    color: "rgba(240,235,225,0.45)",
    borderColor: "rgba(255,255,255,0.08)",
    fontFamily: "var(--font-sans)",
    textDecoration: "none",
  }}
  onMouseEnter={e => (e.currentTarget.style.color = "#f0ebe1")}
  onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
>
  {t("pricing")}
</Link>
```

**Step 4 : Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat(navbar): badge PRO + lien Pricing"
```

---

### Task 13 : Traductions 12 langues

**Files:**
- Modify: `messages/fr.json`, `messages/en.json`, `messages/es.json`, `messages/de.json`, `messages/it.json`, `messages/pt.json`, `messages/nl.json`, `messages/pl.json`, `messages/ru.json`, `messages/zh.json`, `messages/ja.json`, `messages/ar.json`

**Step 1 : Clés à ajouter**

**Namespace `nav`** — 1 clé :
```json
"pricing": "Tarifs"
```

**Namespace `pricing`** — 20 clés :
```json
"label": "Plans",
"title": "Simple et transparent",
"subtitle": "Un seul plan Pro pour débloquer tout QRaft. Sans engagement, annulable à tout moment.",
"month": "mois",
"free_label": "Gratuit",
"pro_label": "Pro",
"annual_hint": "Abonnement annuel bientôt disponible à 79,99€/an",
"feature_create": "QR codes illimités",
"feature_customize": "Personnalisation couleurs + logo",
"feature_export": "Export PNG / JPEG / PDF",
"feature_share": "Partage public",
"feature_expire": "QR codes valables 30 jours",
"feature_no_expire": "QR codes permanents",
"feature_analytics_limited": "Analytics : total scans uniquement",
"feature_analytics_full": "Analytics complètes (courbes, appareils, OS)",
"free_cta": "Créer un compte gratuit",
"free_cta_connected": "Continuer avec le plan gratuit",
"pro_cta": "Passer Pro",
"pro_cta_guest": "Commencer — Passer Pro",
"manage_cta": "Gérer mon abonnement",
"loading": "Chargement...",
"faq_1_q": "Puis-je annuler à tout moment ?",
"faq_1_a": "Oui. Annulez depuis le portail client Stripe, aucun engagement ni frais de résiliation.",
"faq_2_q": "Que se passe-t-il avec mes QR si j'annule ?",
"faq_2_a": "Vos QR restent actifs pendant 7 jours après la fin de la période payée, puis deviennent inactifs.",
"faq_3_q": "Les paiements sont-ils sécurisés ?",
"faq_3_a": "Oui. Les paiements sont gérés par Stripe, certifié PCI DSS. Aucune donnée bancaire n'est stockée sur nos serveurs.",
"faq_4_q": "Y a-t-il un plan annuel ?",
"faq_4_a": "Un abonnement annuel à 79,99€ (soit 6,67€/mois) sera prochainement disponible."
```

**Namespace `dashboard`** — 3 clés :
```json
"toast_upgrade_success": "Bienvenue dans Pro ! Vos QR codes sont maintenant permanents.",
"badge_expired": "Expiré",
"badge_expires_soon": "Expire dans {days}j"
```

**Namespace `expired`** — 3 clés :
```json
"title": "QR code expiré",
"desc": "Ce QR code n'est plus actif. L'auteur doit passer au plan Pro pour le réactiver.",
"cta": "Découvrir QRaft Pro →"
```

**Step 2 : Traduire dans les 12 fichiers**

Ajouter les clés ci-dessus traduits dans chaque fichier. Les namespaces `pricing` et `expired` sont nouveaux (créer les blocs). Les namespaces `nav` et `dashboard` sont à compléter.

**Traductions EN :**
```json
"nav.pricing": "Pricing",
"pricing.label": "Plans",
"pricing.title": "Simple and transparent",
"pricing.subtitle": "One Pro plan to unlock everything. No commitment, cancel anytime.",
"pricing.month": "month",
"pricing.free_label": "Free",
"pricing.pro_label": "Pro",
"pricing.annual_hint": "Annual plan coming soon at €79.99/year",
"pricing.feature_create": "Unlimited QR codes",
"pricing.feature_customize": "Color + logo customization",
"pricing.feature_export": "PNG / JPEG / PDF export",
"pricing.feature_share": "Public sharing",
"pricing.feature_expire": "QR codes valid 30 days",
"pricing.feature_no_expire": "Permanent QR codes",
"pricing.feature_analytics_limited": "Analytics: total scans only",
"pricing.feature_analytics_full": "Full analytics (charts, devices, OS)",
"pricing.free_cta": "Create free account",
"pricing.free_cta_connected": "Continue with free plan",
"pricing.pro_cta": "Go Pro",
"pricing.pro_cta_guest": "Get started — Go Pro",
"pricing.manage_cta": "Manage subscription",
"pricing.loading": "Loading...",
"pricing.faq_1_q": "Can I cancel anytime?",
"pricing.faq_1_a": "Yes. Cancel from the Stripe customer portal, no commitment or cancellation fees.",
"pricing.faq_2_q": "What happens to my QRs if I cancel?",
"pricing.faq_2_a": "Your QR codes stay active for 7 days after your paid period ends, then become inactive.",
"pricing.faq_3_q": "Are payments secure?",
"pricing.faq_3_a": "Yes. Payments are handled by Stripe, PCI DSS certified. No banking data is stored on our servers.",
"pricing.faq_4_q": "Is there an annual plan?",
"pricing.faq_4_a": "An annual plan at €79.99 (€6.67/month) is coming soon.",
"dashboard.toast_upgrade_success": "Welcome to Pro! Your QR codes are now permanent.",
"dashboard.badge_expired": "Expired",
"dashboard.badge_expires_soon": "Expires in {days}d",
"expired.title": "QR code expired",
"expired.desc": "This QR code is no longer active. The author needs to upgrade to Pro to reactivate it.",
"expired.cta": "Discover QRaft Pro →"
```

Pour les 10 autres langues, traduire de manière cohérente (voir les traductions existantes comme référence de style et ton).

**Step 3 : Vérifier build**

```bash
npm run build 2>&1 | grep -E "error|Error"
```

Expected : aucune erreur

**Step 4 : Commit**

```bash
git add messages/
git commit -m "feat(i18n): traductions pricing + expired + badges dashboard (12 langues)"
```

---

### Task 14 : Build final + push

**Step 1 : Vérifier .env.local**

S'assurer que `.env.local` contient les variables Stripe (voir Task 0 / Contexte). Ces variables ne doivent **jamais** être commitées — vérifier `.gitignore` contient bien `.env*`.

**Step 2 : Build complet**

```bash
npm run build
```

Expected : ✓ Compiled successfully, aucune erreur TypeScript

**Step 3 : Vérifier les routes générées**

Le build doit lister :
- `ƒ /api/stripe/checkout`
- `ƒ /api/stripe/portal`
- `ƒ /api/stripe/webhook`
- `ƒ /api/user/subscription`
- `ƒ /[locale]/pricing`
- `ƒ /[locale]/qrcode/expired`

**Step 4 : Configurer le webhook Stripe sur Vercel**

Avant de push, configurer dans Vercel Dashboard → Settings → Environment Variables :
```
STRIPE_SECRET_KEY=rk_live_REDACTED...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_REDACTED...
STRIPE_SUBSCRIPTION_PRICE_ID=price_1TH35Y...
NEXT_PUBLIC_APP_URL=https://qr-aft.vercel.app
```

Et dans le dashboard Stripe → Webhooks, pointer vers :
`https://qr-aft.vercel.app/api/stripe/webhook`
Events à écouter : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

**Step 5 : Push**

```bash
git push origin main
```
