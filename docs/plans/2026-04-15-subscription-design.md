# Système d'abonnement QRaft — Design

## Plans & règles métier

**Plan Gratuit**
- QR codes actifs 30 jours après création, puis inactifs (`expiresAt` dépassé)
- Le scan `/r/[token]` d'un QR expiré redirige vers `/qrcode/expired` au lieu de l'URL cible
- Analytics : total scans uniquement, graphiques floutés + overlay "Passer Pro"
- Toutes les autres features disponibles (couleurs, logo, export, partage)

**Plan Pro — 9,99€/mois (annuel 79,99€/an à ajouter plus tard)**
- QR codes actifs indéfiniment (`expiresAt` null)
- Analytics complètes débloquées
- Si abonnement expire : grace period 7 jours, puis QR repassent inactifs

---

## Architecture technique

### Stripe
- 1 `Price` actuellement : `price_1TH35YRpu70AsgEIPpUWYBxB` (mensuel 9,99€)
- Plan annuel 79,99€ à créer dans le dashboard Stripe et ajouter comme `STRIPE_ANNUAL_PRICE_ID`
- Stripe Checkout hébergé (aucune page de paiement custom)
- Portail client Stripe auto-géré (annulation, factures)
- Webhook → `/api/stripe/webhook`

### Variables d'environnement (jamais commitées)
```
STRIPE_SECRET_KEY=rk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SUBSCRIPTION_PRICE_ID=price_1TH35Y...
```

### Prisma — ajouts sur `User`
```prisma
stripeCustomerId       String?   @unique
stripePriceId          String?
stripeStatus           String?   // "active" | "past_due" | "canceled" | "trialing"
stripeCurrentPeriodEnd DateTime?
```

### Prisma — ajout sur `QRCode`
```prisma
expiresAt DateTime?   // null = jamais (Pro) ; sinon date d'expiration
```

### Helper `isPro(user)`
```ts
export function isPro(user: { stripeStatus?: string | null; stripeCurrentPeriodEnd?: Date | null }): boolean {
  if (user.stripeStatus !== "active") return false;
  if (!user.stripeCurrentPeriodEnd) return false;
  const graceEnd = new Date(user.stripeCurrentPeriodEnd);
  graceEnd.setDate(graceEnd.getDate() + 7);
  return graceEnd > new Date();
}
```

### Logique d'expiration des QR
- À la création (`POST /api/qrcodes`) : si `!isPro(user)` → `expiresAt = now + 30j`
- Endpoint `/api/r/[token]` : si `qrCode.expiresAt && qrCode.expiresAt < now` → redirect `/qrcode/expired`
- Upgrade Pro → webhook met à jour le user, les QR existants sont réactivés (`expiresAt = null`) via une fonction `reactivateUserQRCodes(userId)`

### API routes
- `POST /api/stripe/checkout` — crée session Checkout, redirige vers Stripe
- `POST /api/stripe/portal` — crée session portail client, redirige vers Stripe
- `POST /api/stripe/webhook` — reçoit events Stripe, met à jour DB

### Events Stripe à gérer
- `checkout.session.completed` → activer abonnement, réactiver QR
- `customer.subscription.updated` → mettre à jour status + period end
- `customer.subscription.deleted` → marquer canceled

---

## UX

### Page `/pricing`
- Deux cartes côte à côte : Gratuit vs Pro
- Bouton "Choisir Pro" → `POST /api/stripe/checkout` → Stripe Checkout
- Si Pro actif : bouton "Gérer mon abonnement" → `POST /api/stripe/portal`
- Redirect après paiement : `/dashboard?upgrade=success`

### Dashboard
- Badge "PRO" dans la navbar si abonnement actif
- QR code avec `expiresAt` dans les 7 prochains jours : badge "Expire dans X jours"
- QR code expiré : grisé + badge "Expiré" + CTA "Passer Pro"

### Analytics (composant `Analytics.tsx`)
- Plan gratuit : total scans affiché, graphiques rendus mais `filter: blur(6px)` + overlay cadenas "Débloquer avec Pro → /pricing"
- Plan Pro : rien de flou

### Page `/qrcode/expired`
- Page publique simple : "Ce QR code n'est plus actif" + CTA vers `/pricing`
- Scannée par les visiteurs d'un QR code expiré

---

## Ordre d'implémentation

1. Schema Prisma (`stripeCustomerId`, `stripeStatus`, `stripeCurrentPeriodEnd`, `stripePriceId` sur User ; `expiresAt` sur QRCode) + `prisma db push`
2. Helper `isPro` dans `src/lib/stripe.ts` + install `stripe` npm
3. Logique expiration : `POST /api/qrcodes` ajoute `expiresAt` si pas Pro
4. Endpoint `/api/r/[token]` : check expiration → redirect `/qrcode/expired`
5. Page `/[locale]/qrcode/expired`
6. API `/api/stripe/checkout` + `/api/stripe/portal`
7. Webhook `/api/stripe/webhook` (checkout.completed, subscription.updated, subscription.deleted) + `reactivateUserQRCodes`
8. Page `/[locale]/pricing`
9. Dashboard : badges expiration + QR grisés
10. Analytics : blur + overlay Pro sur les graphiques
11. Navbar : badge PRO
12. Traductions 12 langues (pricing, expiration, upgrade)
13. Build final + push
