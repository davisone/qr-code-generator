import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/stripe";

// Limites de création en masse par plan
const FREE_LIMIT = 5;
const PRO_LIMIT = 500;

const ALLOWED_TYPES = ["url", "text", "email", "phone", "sms", "wifi", "vcard"];
const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

interface IncomingRow {
  name?: unknown;
  content?: unknown;
  type?: unknown;
  category?: unknown;
  color?: unknown;
  background?: unknown;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      stripeStatus: true,
      stripeCurrentPeriodEnd: true,
    },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 404 },
    );
  }

  let body: { rows?: IncomingRow[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }

  const rows = Array.isArray(body?.rows) ? body.rows : null;
  if (!rows || rows.length === 0) {
    return NextResponse.json(
      { error: "Aucune ligne à importer" },
      { status: 400 },
    );
  }

  // Vérification de la limite selon le plan
  const userIsPro = isPro(user);
  const limit = userIsPro ? PRO_LIMIT : FREE_LIMIT;
  if (rows.length > limit) {
    return NextResponse.json(
      {
        error: userIsPro
          ? `Limite dépassée : ${PRO_LIMIT} QR codes maximum par batch`
          : `Limite dépassée : ${FREE_LIMIT} QR codes maximum par batch (Passez Pro pour ${PRO_LIMIT})`,
        limit,
      },
      { status: 403 },
    );
  }

  // Validation + normalisation des lignes
  const sanitized: Array<{
    name: string;
    content: string;
    type: string;
    category: string | null;
    foregroundColor: string;
    backgroundColor: string;
  }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] ?? {};
    const name = typeof row.name === "string" ? row.name.trim() : "";
    const content = typeof row.content === "string" ? row.content.trim() : "";
    const type =
      typeof row.type === "string" && row.type.trim()
        ? row.type.trim().toLowerCase()
        : "url";
    const category =
      typeof row.category === "string" && row.category.trim()
        ? row.category.trim()
        : null;
    const color =
      typeof row.color === "string" && row.color.trim()
        ? row.color.trim()
        : "#1a1410";
    const background =
      typeof row.background === "string" && row.background.trim()
        ? row.background.trim()
        : "#ffffff";

    if (!name || !content) {
      return NextResponse.json(
        { error: `Ligne ${i + 1} : name et content requis` },
        { status: 400 },
      );
    }
    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Ligne ${i + 1} : type invalide (${type})` },
        { status: 400 },
      );
    }
    if (!HEX_REGEX.test(color) || !HEX_REGEX.test(background)) {
      return NextResponse.json(
        { error: `Ligne ${i + 1} : couleur invalide` },
        { status: 400 },
      );
    }

    sanitized.push({
      name,
      content,
      type,
      category,
      foregroundColor: color,
      backgroundColor: background,
    });
  }

  // Expiration pour les users Free (30 jours comme pour la création individuelle)
  const expiresAt = userIsPro
    ? null
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  try {
    // Transaction : tout ou rien
    const created = await prisma.$transaction(
      sanitized.map((row) =>
        prisma.qRCode.create({
          data: {
            name: row.name,
            type: row.type,
            content: row.content,
            category: row.category,
            foregroundColor: row.foregroundColor,
            backgroundColor: row.backgroundColor,
            size: 512,
            errorCorrection: "M",
            isPublic: false,
            shareToken: null,
            expiresAt,
            userId: user.id,
          },
        }),
      ),
    );

    return NextResponse.json({ created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Échec de la création en masse" },
      { status: 500 },
    );
  }
}
