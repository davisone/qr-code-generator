# Auth Critical Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implémenter les 3 fonctionnalités critiques d'auth : reset mot de passe, vérification email (bloquante), et page profil complète avec avatar.

**Architecture:** Tokens UUID en base de données (VerificationToken + PasswordResetToken), emails via Resend SDK, avatar via Vercel Blob. Le blocage des non-vérifiés se fait dans le `authorize()` de NextAuth — si `emailVerified === null`, la connexion échoue avec une erreur spécifique. Page profil avec 3 sections : identité, sécurité, zone danger.

**Tech Stack:** Next.js 16 App Router, NextAuth 4 JWT, Prisma 7, Resend, @vercel/blob, next-intl (12 langues), CSS variables rétro Swiss existantes.

---

## Notes contexte codebase

- Middleware i18n : `src/proxy.ts` (pas middleware.ts — Next.js 16)
- Client Prisma custom : `src/generated/prisma` (pas `@prisma/client`)
- CSS variables : `--bg`, `--ink`, `--red`, `--yellow`, `--mid`, `--light`, `--card`, `--rule`, `--rule-thin`
- Polices : `var(--font-display)` Bebas Neue, `var(--font-sans)` Barlow, `var(--font-mono)` Courier Prime
- Classes utilitaires : `btn btn-primary`, `input`
- Import Prisma : `import { prisma } from "@/lib/prisma"`
- BASE_URL : `import { BASE_URL } from "@/lib/config"`
- Navigation i18n : `import { Link, useRouter } from "@/i18n/navigation"`
- Traductions : `useTranslations("namespace")` (client) / `getTranslations("namespace")` (server)
- Toutes les pages sous `src/app/[locale]/`
- 12 langues : en, fr, es, de, it, pt, nl, pt-BR, es-MX, ja, zh, ko

---

## Task 1: Installer les dépendances

**Files:**
- Modify: `package.json`

**Step 1: Installer Resend et Vercel Blob**

```bash
npm install resend @vercel/blob
```

**Step 2: Vérifier l'installation**

```bash
node -e "require('resend'); require('@vercel/blob'); console.log('OK')"
```
Expected: `OK`

**Step 3: Ajouter les variables d'env dans .env.local**

Ajouter à `.env.local` :
```
RESEND_API_KEY=re_xxxxxxxxxxxx
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxx
```

> Note: `RESEND_API_KEY` → obtenir sur resend.com (gratuit jusqu'à 3000 emails/mois)
> Note: `BLOB_READ_WRITE_TOKEN` → Vercel Dashboard → Storage → Create Blob Store → copier le token

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: ajout dépendances resend et @vercel/blob"
```

---

## Task 2: Modèles Prisma

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Ajouter les deux modèles à la fin du fichier `prisma/schema.prisma`**

```prisma
model VerificationToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expiresAt DateTime

  @@index([email])
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expiresAt DateTime

  @@index([email])
}
```

**Step 2: Pousser le schéma en base**

```bash
npx prisma db push
```
Expected: `Your database is now in sync with your Prisma schema`

**Step 3: Régénérer le client**

```bash
npx prisma generate
```
Expected: `Generated Prisma Client`

**Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(db): ajout modèles VerificationToken et PasswordResetToken"
```

---

## Task 3: Service email (src/lib/email.ts)

**Files:**
- Create: `src/lib/email.ts`

**Step 1: Créer `src/lib/email.ts`**

```typescript
import { Resend } from "resend";
import { BASE_URL } from "./config";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "QRaft <noreply@useqraft.com>";

export async function sendVerificationEmail(email: string, token: string, locale: string = "fr") {
  const url = `${BASE_URL}/${locale}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Vérifiez votre adresse email — QRaft",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f0ebe1; padding: 32px;">
        <h1 style="font-size: 2rem; letter-spacing: 0.06em; color: #1a1410; margin: 0 0 8px;">QRaft</h1>
        <p style="color: #6b5f52; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 24px;">Vérification email</p>
        <div style="background: #1a1410; padding: 24px; margin-bottom: 24px;">
          <p style="color: #f0ebe1; margin: 0 0 16px; font-size: 0.9rem;">Cliquez sur le bouton ci-dessous pour vérifier votre adresse email. Ce lien expire dans 24 heures.</p>
          <a href="${url}" style="display: inline-block; background: #d4290f; color: #f0ebe1; padding: 12px 24px; text-decoration: none; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em;">
            Vérifier mon email →
          </a>
        </div>
        <p style="color: #b5a898; font-size: 0.75rem;">Si vous n'avez pas créé de compte sur QRaft, ignorez cet email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, locale: string = "fr") {
  const url = `${BASE_URL}/${locale}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Réinitialisation de mot de passe — QRaft",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f0ebe1; padding: 32px;">
        <h1 style="font-size: 2rem; letter-spacing: 0.06em; color: #1a1410; margin: 0 0 8px;">QRaft</h1>
        <p style="color: #6b5f52; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 24px;">Réinitialisation de mot de passe</p>
        <div style="background: #1a1410; padding: 24px; margin-bottom: 24px;">
          <p style="color: #f0ebe1; margin: 0 0 16px; font-size: 0.9rem;">Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe. Ce lien expire dans 1 heure.</p>
          <a href="${url}" style="display: inline-block; background: #d4290f; color: #f0ebe1; padding: 12px 24px; text-decoration: none; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em;">
            Réinitialiser mon mot de passe →
          </a>
        </div>
        <p style="color: #b5a898; font-size: 0.75rem;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.</p>
      </div>
    `,
  });
}
```

**Step 2: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat(email): service Resend — templates vérification et reset"
```

---

## Task 4: API routes — reset mot de passe

**Files:**
- Create: `src/app/api/auth/forgot-password/route.ts`
- Create: `src/app/api/auth/reset-password/route.ts`

**Step 1: Créer `src/app/api/auth/forgot-password/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, locale } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });

    // Réponse neutre si email inconnu (anti-énumération)
    if (!user || !user.password) {
      return NextResponse.json({ ok: true });
    }

    // Supprimer les anciens tokens pour cet email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    await sendPasswordResetEmail(email, token, locale ?? "fr");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

**Step 2: Créer `src/app/api/auth/reset-password/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Mot de passe trop court" }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken) {
      return NextResponse.json({ error: "Lien invalide" }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return NextResponse.json({ error: "Lien expiré" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/auth/
git commit -m "feat(api): routes forgot-password et reset-password"
```

---

## Task 5: Pages forgot-password et reset-password

**Files:**
- Create: `src/app/[locale]/forgot-password/page.tsx`
- Create: `src/app/[locale]/reset-password/page.tsx`
- Modify: `src/app/[locale]/login/page.tsx` (ajouter lien "Mot de passe oublié ?")

**Step 1: Créer `src/app/[locale]/forgot-password/page.tsx`**

```tsx
"use client";

import { FormEvent, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.65rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mid)",
  marginBottom: "0.4rem",
};

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });

    setLoading(false);

    if (res.ok) {
      setSent(true);
    } else {
      setError(t("error_generic"));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--mid)", textDecoration: "none" }}
          >
            {t("back")}
          </Link>
        </div>

        <div style={{ border: "var(--rule)", background: "var(--card)" }}>
          <div style={{ background: "var(--ink)", padding: "1.5rem", textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
                fontSize: "2.8rem",
                color: "var(--bg)",
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}
            >
              QRaft
            </h1>
            <p
              style={{
                color: "rgba(240,235,225,0.5)",
                fontSize: "0.62rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                marginTop: "0.3rem",
                fontFamily: "var(--font-sans)",
              }}
            >
              {t("forgot_password_subtitle")}
            </p>
          </div>

          <div style={{ padding: "1.5rem" }}>
            {sent ? (
              <div style={{ textAlign: "center" }}>
                <div
                  className="mb-4 p-3 text-sm"
                  style={{ background: "rgba(16,185,129,0.08)", border: "1px solid #10b981", color: "#10b981" }}
                >
                  {t("reset_link_sent")}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--mid)", marginTop: "1rem" }}>
                  <Link href="/login" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline" }}>
                    {t("back_to_login")}
                  </Link>
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div
                    className="mb-4 p-3 text-sm"
                    style={{ background: "rgba(212,41,15,0.06)", border: "1px solid var(--red)", color: "var(--red)" }}
                  >
                    {error}
                  </div>
                )}
                <p style={{ fontSize: "0.78rem", color: "var(--mid)", marginBottom: "1.25rem", fontFamily: "var(--font-sans)" }}>
                  {t("forgot_password_desc")}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" style={labelStyle}>{t("email")}</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder={t("email_placeholder")}
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: "0.5rem" }}>
                    {loading ? t("sending") : t("send_reset_link")}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Créer `src/app/[locale]/reset-password/page.tsx`**

```tsx
"use client";

import { FormEvent, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.65rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mid)",
  marginBottom: "0.4rem",
};

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t("password_too_short"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwords_mismatch"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      const data = await res.json();
      setError(data.error ?? t("error_generic"));
    }
  }

  if (!token) {
    return (
      <div style={{ padding: "1.5rem", textAlign: "center" }}>
        <p style={{ color: "var(--red)", fontSize: "0.85rem" }}>{t("reset_link_invalid")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--mid)", textDecoration: "none" }}>
            {t("back")}
          </Link>
        </div>

        <div style={{ border: "var(--rule)", background: "var(--card)" }}>
          <div style={{ background: "var(--ink)", padding: "1.5rem", textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-display, 'Bebas Neue'), cursive", fontSize: "2.8rem", color: "var(--bg)", letterSpacing: "0.06em", lineHeight: 1 }}>
              QRaft
            </h1>
            <p style={{ color: "rgba(240,235,225,0.5)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: "0.3rem", fontFamily: "var(--font-sans)" }}>
              {t("reset_password_subtitle")}
            </p>
          </div>

          <div style={{ padding: "1.5rem" }}>
            {success ? (
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid #10b981", color: "#10b981", padding: "0.75rem", fontSize: "0.85rem", textAlign: "center" }}>
                {t("reset_success")}
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 text-sm" style={{ background: "rgba(212,41,15,0.06)", border: "1px solid var(--red)", color: "var(--red)" }}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="password" style={labelStyle}>{t("new_password")}</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder={t("password_placeholder")} required minLength={6} />
                  </div>
                  <div>
                    <label htmlFor="confirm" style={labelStyle}>{t("password_confirm")}</label>
                    <input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" placeholder="••••••••" required minLength={6} />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: "0.5rem" }}>
                    {loading ? t("saving") : t("reset_password_button")}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}><span style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.5rem", color: "var(--mid)" }}>...</span></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
```

**Step 3: Ajouter le lien "Mot de passe oublié ?" dans `src/app/[locale]/login/page.tsx`**

Juste après le champ `password` et avant le bouton submit, ajouter :
```tsx
<div style={{ textAlign: "right", marginTop: "-0.5rem" }}>
  <Link href="/forgot-password" style={{ fontSize: "0.7rem", color: "var(--mid)", textDecoration: "underline" }}>
    {t("forgot_password")}
  </Link>
</div>
```

**Step 4: Commit**

```bash
git add src/app/[locale]/forgot-password/ src/app/[locale]/reset-password/ src/app/[locale]/login/page.tsx
git commit -m "feat(auth): pages forgot-password et reset-password"
```

---

## Task 6: API routes — vérification email

**Files:**
- Create: `src/app/api/auth/verify-email/route.ts`
- Create: `src/app/api/auth/resend-verification/route.ts`

**Step 1: Créer `src/app/api/auth/verify-email/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({ where: { token } });

    if (!verificationToken) {
      return NextResponse.json({ error: "Lien invalide" }, { status: 400 });
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Lien expiré" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

**Step 2: Créer `src/app/api/auth/resend-verification/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, locale } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ ok: true }); // réponse neutre
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email déjà vérifié" }, { status: 400 });
    }

    // Supprimer les anciens tokens
    await prisma.verificationToken.deleteMany({ where: { email } });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    await prisma.verificationToken.create({
      data: { email, token, expiresAt },
    });

    await sendVerificationEmail(email, token, locale ?? "fr");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/auth/verify-email/ src/app/api/auth/resend-verification/
git commit -m "feat(api): routes verify-email et resend-verification"
```

---

## Task 7: Vérification email — inscription + login + page verify

**Files:**
- Modify: `src/lib/auth.ts`
- Create: `src/app/[locale]/verify-email/page.tsx`
- Modify: `src/app/[locale]/register/page.tsx`

**Step 1: Modifier `src/lib/auth.ts`**

Dans la fonction `authorize()`, remplacer le bloc "register" par :

```typescript
if (action === "register") {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Cet email est déjà utilisé");
  }
  if (!name) {
    throw new Error("Le nom est requis");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { email, name, password: hashedPassword },
  });

  // Créer token de vérification et envoyer email
  const { randomUUID } = await import("crypto");
  const { sendVerificationEmail } = await import("./email");
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.verificationToken.create({ data: { email, token, expiresAt } });
  await sendVerificationEmail(email, token, "fr"); // locale par défaut

  return { id: newUser.id, email: newUser.email, name: newUser.name };
}
```

Et dans le bloc login (après `isValid`), ajouter la vérification :

```typescript
// Vérifier email confirmé
if (!user.emailVerified) {
  throw new Error("email_not_verified");
}
```

**Step 2: Modifier `src/app/[locale]/register/page.tsx`**

Changer la redirection après inscription réussie :
```typescript
// Remplacer :
router.push("/login?registered=true");
// Par :
router.push(`/login?verify=pending&email=${encodeURIComponent(email)}`);
```

**Step 3: Modifier `src/app/[locale]/login/page.tsx`**

Ajouter la gestion de l'erreur `email_not_verified` et le paramètre `verify=pending` :

```typescript
// Ajouter en haut avec les useState :
const verifyPending = searchParams.get("verify") === "pending";
const pendingEmail = searchParams.get("email") ?? "";
const [resendLoading, setResendLoading] = useState(false);
const [resendSent, setResendSent] = useState(false);

// Fonction pour renvoyer l'email :
async function handleResend() {
  setResendLoading(true);
  await fetch("/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: pendingEmail, locale }),
  });
  setResendLoading(false);
  setResendSent(true);
}
```

Ajouter dans le JSX (après le bloc `registered`) :
```tsx
{verifyPending && (
  <div className="mb-4 p-3 text-sm" style={{ background: "rgba(240,181,0,0.08)", border: "1px solid var(--yellow)", color: "var(--ink)" }}>
    {t("verify_email_pending")}
    {pendingEmail && !resendSent && (
      <button onClick={handleResend} disabled={resendLoading} style={{ display: "block", marginTop: "0.5rem", fontSize: "0.7rem", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "var(--ink)", padding: 0 }}>
        {resendLoading ? t("sending") : t("resend_verification")}
      </button>
    )}
    {resendSent && <span style={{ display: "block", marginTop: "0.5rem", color: "#10b981" }}>{t("verification_sent")}</span>}
  </div>
)}
```

Gérer l'erreur `email_not_verified` dans `handleSubmit` :
```typescript
if (result?.error === "email_not_verified") {
  setError(t("email_not_verified_error"));
  setLoading(false);
  return;
}
```

**Step 4: Créer `src/app/[locale]/verify-email/page.tsx`**

```tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function VerifyEmailContent() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(async (res) => {
      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        setStatus(data.error === "Lien expiré" ? "expired" : "error");
      }
    });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div style={{ border: "var(--rule)", background: "var(--card)" }}>
          <div style={{ background: "var(--ink)", padding: "1.5rem", textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-display, 'Bebas Neue'), cursive", fontSize: "2.8rem", color: "var(--bg)", letterSpacing: "0.06em", lineHeight: 1 }}>
              QRaft
            </h1>
            <p style={{ color: "rgba(240,235,225,0.5)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: "0.3rem", fontFamily: "var(--font-sans)" }}>
              {t("verify_email_title")}
            </p>
          </div>

          <div style={{ padding: "1.5rem", textAlign: "center" }}>
            {status === "loading" && (
              <p style={{ color: "var(--mid)", fontSize: "0.85rem" }}>...</p>
            )}
            {status === "success" && (
              <>
                <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid #10b981", color: "#10b981", padding: "0.75rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {t("verify_email_success")}
                </div>
                <Link href="/login" className="btn btn-primary" style={{ display: "inline-block" }}>
                  {t("sign_in")}
                </Link>
              </>
            )}
            {(status === "error" || status === "expired") && (
              <>
                <div style={{ background: "rgba(212,41,15,0.06)", border: "1px solid var(--red)", color: "var(--red)", padding: "0.75rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {status === "expired" ? t("verify_email_expired") : t("verify_email_error")}
                </div>
                <Link href="/login" style={{ fontSize: "0.75rem", color: "var(--ink)", fontWeight: 700, textDecoration: "underline" }}>
                  {t("back_to_login")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}><span style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.5rem", color: "var(--mid)" }}>...</span></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
```

**Step 5: Commit**

```bash
git add src/lib/auth.ts src/app/[locale]/register/page.tsx src/app/[locale]/login/page.tsx src/app/[locale]/verify-email/
git commit -m "feat(auth): vérification email bloquante à l'inscription"
```

---

## Task 8: API routes — profil utilisateur

**Files:**
- Create: `src/app/api/user/route.ts`
- Create: `src/app/api/user/profile/route.ts`
- Create: `src/app/api/user/password/route.ts`
- Create: `src/app/api/user/avatar/route.ts`

**Step 1: Créer `src/app/api/user/route.ts`** (DELETE account)

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    await prisma.user.delete({ where: { email: session.user.email } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

**Step 2: Créer `src/app/api/user/profile/route.ts`** (PUT name)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { name, image } = await req.json();

    const updateData: { name?: string; image?: string } = {};
    if (name !== undefined) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: { id: true, name: true, email: true, image: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

**Step 3: Créer `src/app/api/user/password/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Mot de passe trop court" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user?.password) {
      return NextResponse.json({ error: "Compte OAuth sans mot de passe" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashed },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

**Step 4: Créer `src/app/api/user/avatar/route.ts`** (Vercel Blob upload)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 2 Mo)" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Type de fichier non supporté" }, { status: 400 });
    }

    const userId = session.user.email.replace(/[^a-z0-9]/gi, "_");
    const ext = file.name.split(".").pop();
    const filename = `avatars/${userId}.${ext}`;

    const blob = await put(filename, file, { access: "public", addRandomSuffix: false });

    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

**Step 5: Commit**

```bash
git add src/app/api/user/
git commit -m "feat(api): routes profil utilisateur — update, password, avatar, delete"
```

---

## Task 9: Page profil

**Files:**
- Create: `src/app/[locale]/profile/page.tsx`
- Modify: `src/components/Navbar.tsx` (ajouter lien profil)

**Step 1: Créer `src/app/[locale]/profile/page.tsx`**

```tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.65rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mid)",
  marginBottom: "0.4rem",
};

const sectionStyle: React.CSSProperties = {
  border: "var(--rule)",
  background: "var(--card)",
  marginBottom: "1.5rem",
};

const sectionHeaderStyle: React.CSSProperties = {
  background: "var(--ink)",
  padding: "0.75rem 1.25rem",
  fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
  fontSize: "1.1rem",
  letterSpacing: "0.08em",
  color: "var(--bg)",
};

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const t = useTranslations("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(session?.user?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image ?? "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [avatarLoading, setAvatarLoading] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      setAvatarUrl(data.url);
      await update({ image: data.url });
    }
    setAvatarLoading(false);
  }

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setProfileLoading(false);
    if (res.ok) {
      await update({ name });
      setProfileMsg(t("saved"));
      setTimeout(() => setProfileMsg(""), 3000);
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMsg("");

    if (newPassword.length < 6) {
      setPasswordError(t("password_too_short"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwords_mismatch"));
      return;
    }

    setPasswordLoading(true);
    const res = await fetch("/api/user/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setPasswordLoading(false);

    if (res.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg(t("password_changed"));
      setTimeout(() => setPasswordMsg(""), 3000);
    } else {
      const data = await res.json();
      setPasswordError(data.error ?? t("error_generic"));
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "SUPPRIMER") {
      setDeleteError(t("delete_confirm_wrong"));
      return;
    }

    setDeleteLoading(true);
    const res = await fetch("/api/user", { method: "DELETE" });
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      setDeleteError(t("error_generic"));
      setDeleteLoading(false);
    }
  }

  const isOAuthOnly = !session?.user?.email || session.user.image?.includes("googleusercontent") || session.user.image?.includes("avatars.githubusercontent");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", paddingTop: "3.5rem" }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1
          style={{
            fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
            fontSize: "2.5rem",
            letterSpacing: "0.06em",
            color: "var(--ink)",
            marginBottom: "2rem",
          }}
        >
          {t("title")}
        </h1>

        {/* IDENTITÉ */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>{t("identity_title")}</div>
          <div style={{ padding: "1.5rem" }}>
            <form onSubmit={handleProfileSave} className="space-y-4">
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    border: "var(--rule)",
                    background: "var(--mid)",
                    backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {!avatarUrl && <span style={{ color: "var(--bg)", fontSize: "1.5rem" }}>?</span>}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", padding: 0 }}
                  >
                    {avatarLoading ? t("uploading") : t("avatar_change")}
                  </button>
                  <p style={{ fontSize: "0.65rem", color: "var(--light)", marginTop: "0.25rem" }}>{t("avatar_hint")}</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="name" style={labelStyle}>{t("name_label")}</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder={t("name_placeholder")}
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button type="submit" disabled={profileLoading} className="btn btn-primary">
                  {profileLoading ? t("saving") : t("save")}
                </button>
                {profileMsg && <span style={{ fontSize: "0.75rem", color: "#10b981" }}>{profileMsg}</span>}
              </div>
            </form>
          </div>
        </div>

        {/* SÉCURITÉ — mot de passe */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>{t("security_title")}</div>
          <div style={{ padding: "1.5rem" }}>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordError && (
                <div style={{ background: "rgba(212,41,15,0.06)", border: "1px solid var(--red)", color: "var(--red)", padding: "0.6rem 0.75rem", fontSize: "0.8rem" }}>
                  {passwordError}
                </div>
              )}
              <div>
                <label htmlFor="current_password" style={labelStyle}>{t("current_password")}</label>
                <input id="current_password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input" placeholder="••••••••" required />
              </div>
              <div>
                <label htmlFor="new_password" style={labelStyle}>{t("new_password")}</label>
                <input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="••••••••" required minLength={6} />
              </div>
              <div>
                <label htmlFor="confirm_password" style={labelStyle}>{t("password_confirm")}</label>
                <input id="confirm_password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" placeholder="••••••••" required minLength={6} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button type="submit" disabled={passwordLoading} className="btn btn-primary">
                  {passwordLoading ? t("saving") : t("change_password")}
                </button>
                {passwordMsg && <span style={{ fontSize: "0.75rem", color: "#10b981" }}>{passwordMsg}</span>}
              </div>
            </form>
          </div>
        </div>

        {/* ZONE DANGER */}
        <div style={{ ...sectionStyle, borderColor: "var(--red)" }}>
          <div style={{ ...sectionHeaderStyle, background: "var(--red)" }}>{t("danger_title")}</div>
          <div style={{ padding: "1.5rem" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--mid)", marginBottom: "1rem" }}>{t("delete_account_desc")}</p>
            {deleteError && (
              <div style={{ background: "rgba(212,41,15,0.06)", border: "1px solid var(--red)", color: "var(--red)", padding: "0.6rem 0.75rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
                {deleteError}
              </div>
            )}
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="delete_confirm" style={labelStyle}>{t("delete_confirm_label")}</label>
              <input
                id="delete_confirm"
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="input"
                placeholder={t("delete_confirm_placeholder")}
              />
            </div>
            <button
              type="button"
              disabled={deleteLoading || deleteConfirm !== "SUPPRIMER"}
              onClick={handleDeleteAccount}
              style={{
                background: deleteConfirm === "SUPPRIMER" ? "var(--red)" : "transparent",
                color: deleteConfirm === "SUPPRIMER" ? "var(--bg)" : "var(--red)",
                border: "1px solid var(--red)",
                padding: "0.6rem 1.25rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: deleteConfirm === "SUPPRIMER" ? "pointer" : "not-allowed",
                fontFamily: "var(--font-sans)",
                opacity: deleteLoading ? 0.5 : 1,
              }}
            >
              {deleteLoading ? t("deleting") : t("delete_button")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Modifier `src/components/Navbar.tsx`** — ajouter lien Profil entre le nom et logout

```tsx
// Ajouter import Link
import { Link } from "@/i18n/navigation";

// Ajouter entre le span du nom et le bouton logout :
<Link
  href="/profile"
  className="hidden sm:flex items-center px-4 text-xs uppercase tracking-widest font-bold border-l transition-colors"
  style={{
    color: "rgba(240,235,225,0.45)",
    borderColor: "rgba(255,255,255,0.08)",
    fontFamily: "var(--font-sans, sans-serif)",
    textDecoration: "none",
  }}
  onMouseEnter={e => (e.currentTarget.style.color = "#f0ebe1")}
  onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
>
  {t("profile")}
</Link>
```

Et ajouter `"profile": "Profil"` dans les clés nav de `src/lib/auth.ts` — non, dans les fichiers messages.

**Step 3: Commit**

```bash
git add src/app/[locale]/profile/ src/components/Navbar.tsx
git commit -m "feat(profile): page profil — identité, avatar, mot de passe, suppression compte"
```

---

## Task 10: Traductions — toutes les nouvelles clés (12 langues)

**Files:**
- Modify: `messages/fr.json`, `messages/en.json`, `messages/es.json`, `messages/de.json`, `messages/it.json`, `messages/pt.json`, `messages/nl.json`, `messages/pt-BR.json`, `messages/es-MX.json`, `messages/ja.json`, `messages/zh.json`, `messages/ko.json`

**Step 1: Ajouter les nouvelles clés dans le namespace `auth` de chaque fichier**

Nouvelles clés à ajouter dans `auth` :
```json
"forgot_password": "Mot de passe oublié ?",
"forgot_password_subtitle": "Réinitialisation",
"forgot_password_desc": "Entrez votre email pour recevoir un lien de réinitialisation.",
"send_reset_link": "Envoyer le lien",
"sending": "Envoi...",
"reset_link_sent": "Lien envoyé ! Vérifiez votre boîte email.",
"back_to_login": "Retour à la connexion",
"reset_password_subtitle": "Nouveau mot de passe",
"reset_password_button": "Réinitialiser",
"reset_success": "Mot de passe modifié. Redirection...",
"reset_link_invalid": "Lien invalide ou manquant.",
"new_password": "Nouveau mot de passe",
"saving": "Enregistrement...",
"error_generic": "Une erreur est survenue. Réessayez.",
"verify_email_title": "Vérification email",
"verify_email_pending": "Vérifiez votre email avant de vous connecter.",
"resend_verification": "Renvoyer l'email",
"verification_sent": "Email renvoyé !",
"email_not_verified_error": "Email non vérifié. Vérifiez votre boîte mail.",
"verify_email_success": "Email vérifié ! Vous pouvez vous connecter.",
"verify_email_error": "Lien invalide.",
"verify_email_expired": "Lien expiré. Reconnectez-vous pour en recevoir un nouveau."
```

**Step 2: Ajouter le namespace `profile` dans chaque fichier**

```json
"profile": {
  "title": "Mon profil",
  "identity_title": "Identité",
  "name_label": "Nom",
  "name_placeholder": "Votre nom",
  "avatar_change": "Changer l'avatar",
  "avatar_hint": "PNG, JPG ou SVG — max 2 Mo",
  "uploading": "Envoi...",
  "save": "Sauvegarder",
  "saving": "Sauvegarde...",
  "saved": "Sauvegardé !",
  "security_title": "Sécurité",
  "current_password": "Mot de passe actuel",
  "new_password": "Nouveau mot de passe",
  "password_confirm": "Confirmer",
  "change_password": "Changer le mot de passe",
  "password_changed": "Mot de passe modifié !",
  "password_too_short": "Minimum 6 caractères",
  "passwords_mismatch": "Les mots de passe ne correspondent pas",
  "danger_title": "Zone danger",
  "delete_account_desc": "La suppression est irréversible. Tous vos QR codes et données seront supprimés définitivement.",
  "delete_confirm_label": "Tapez SUPPRIMER pour confirmer",
  "delete_confirm_placeholder": "SUPPRIMER",
  "delete_confirm_wrong": "Confirmation incorrecte",
  "delete_button": "Supprimer mon compte",
  "deleting": "Suppression...",
  "error_generic": "Une erreur est survenue."
}
```

**Step 3: Ajouter `"profile"` dans le namespace `nav` de chaque fichier**

```json
"nav": {
  "login": "Connexion",
  "start": "Commencer",
  "logout": "Déconnexion",
  "profile": "Profil"
}
```

**Step 4: Traduire les clés dans les 11 autres langues**

Traductions pour chaque langue — clés `auth` nouvelles et `profile` complet :

**EN:**
```json
"forgot_password": "Forgot password?",
"forgot_password_subtitle": "Password reset",
"forgot_password_desc": "Enter your email to receive a reset link.",
"send_reset_link": "Send reset link",
"sending": "Sending...",
"reset_link_sent": "Link sent! Check your inbox.",
"back_to_login": "Back to login",
"reset_password_subtitle": "New password",
"reset_password_button": "Reset password",
"reset_success": "Password updated. Redirecting...",
"reset_link_invalid": "Invalid or missing link.",
"new_password": "New password",
"saving": "Saving...",
"error_generic": "An error occurred. Please try again.",
"verify_email_title": "Email verification",
"verify_email_pending": "Please verify your email before signing in.",
"resend_verification": "Resend email",
"verification_sent": "Email sent!",
"email_not_verified_error": "Email not verified. Check your inbox.",
"verify_email_success": "Email verified! You can now sign in.",
"verify_email_error": "Invalid link.",
"verify_email_expired": "Link expired. Sign in again to get a new one."
```
```json
"profile": {
  "title": "My profile",
  "identity_title": "Identity",
  "name_label": "Name",
  "name_placeholder": "Your name",
  "avatar_change": "Change avatar",
  "avatar_hint": "PNG, JPG or SVG — max 2 MB",
  "uploading": "Uploading...",
  "save": "Save",
  "saving": "Saving...",
  "saved": "Saved!",
  "security_title": "Security",
  "current_password": "Current password",
  "new_password": "New password",
  "password_confirm": "Confirm",
  "change_password": "Change password",
  "password_changed": "Password updated!",
  "password_too_short": "Minimum 6 characters",
  "passwords_mismatch": "Passwords do not match",
  "danger_title": "Danger zone",
  "delete_account_desc": "Deletion is irreversible. All your QR codes and data will be permanently deleted.",
  "delete_confirm_label": "Type DELETE to confirm",
  "delete_confirm_placeholder": "DELETE",
  "delete_confirm_wrong": "Incorrect confirmation",
  "delete_button": "Delete my account",
  "deleting": "Deleting...",
  "error_generic": "An error occurred."
}
```

> Pour les 10 autres langues (es, de, it, pt, nl, pt-BR, es-MX, ja, zh, ko), traduire les mêmes clés de manière appropriée. La logique des clés est identique, seule la langue change.

**Step 5: Vérifier que toutes les langues ont le même nombre de clés**

```bash
node -e "
const langs = ['fr','en','es','de','it','pt','nl','pt-BR','es-MX','ja','zh','ko'];
langs.forEach(l => {
  const d = require('./messages/' + l + '.json');
  console.log(l, 'auth:', Object.keys(d.auth).length, 'profile:', Object.keys(d.profile).length, 'nav:', Object.keys(d.nav).length);
});
"
```
Expected: même nombre pour chaque namespace dans toutes les langues.

**Step 6: Commit**

```bash
git add messages/
git commit -m "feat(i18n): traductions reset mdp, vérification email et profil — 12 langues"
```

---

## Task 11: Build final et vérification

**Step 1: Lancer le build local**

```bash
npm run build
```
Expected: `✓ Compiled successfully`

Si erreurs TypeScript : corriger avant de continuer.

**Step 2: Vérifier que les nouvelles pages compilent**

Dans l'output du build, chercher :
- `[locale]/forgot-password`
- `[locale]/reset-password`
- `[locale]/verify-email`
- `[locale]/profile`

**Step 3: Commit final**

```bash
git add -A
git commit -m "chore: build vérifié — auth critique + profil + traductions"
```

**Step 4: Push**

```bash
git push origin main
```

**Step 5: Vérifier sur Vercel**

Attendre le déploiement (~2 min) puis tester :
1. `/fr/forgot-password` → formulaire email
2. `/fr/verify-email` (sans token) → message erreur
3. `/fr/profile` → redirige vers login si non connecté
4. Inscription → email de vérification reçu
5. Clic lien email → `/fr/verify-email?token=xxx` → succès
6. Login après vérification → accès dashboard

---

## Résumé des fichiers créés/modifiés

**Créés:**
- `src/lib/email.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/auth/resend-verification/route.ts`
- `src/app/api/user/route.ts`
- `src/app/api/user/profile/route.ts`
- `src/app/api/user/password/route.ts`
- `src/app/api/user/avatar/route.ts`
- `src/app/[locale]/forgot-password/page.tsx`
- `src/app/[locale]/reset-password/page.tsx`
- `src/app/[locale]/verify-email/page.tsx`
- `src/app/[locale]/profile/page.tsx`

**Modifiés:**
- `prisma/schema.prisma` (+ 2 modèles)
- `src/lib/auth.ts` (vérification emailVerified + envoi email inscription)
- `src/app/[locale]/register/page.tsx` (redirection verify=pending)
- `src/app/[locale]/login/page.tsx` (lien forgot + gestion erreur email non vérifié)
- `src/components/Navbar.tsx` (lien Profil)
- `messages/*.json` (12 fichiers, nouvelles clés auth + namespace profile + nav.profile)
