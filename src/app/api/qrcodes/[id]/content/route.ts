import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/stripe";
import { buildContent, type QRType, QR_TYPE_LIST } from "@/lib/qr-formats";

const VALID_TYPES = new Set<string>(QR_TYPE_LIST.map((t) => t.type));

type PatchBody = {
  content?: unknown;
  type?: unknown;
  metadata?: unknown;
  note?: unknown;
};

function validateBody(body: unknown): {
  ok: true;
  data: {
    content: string;
    type?: QRType;
    metadata?: Record<string, unknown>;
    note?: string;
  };
} | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Corps de requête invalide" };
  }
  const b = body as PatchBody;

  if (typeof b.content !== "string" || !b.content.trim()) {
    return { ok: false, error: "Le contenu est requis" };
  }
  if (b.content.length > 5000) {
    return { ok: false, error: "Contenu trop long" };
  }

  let type: QRType | undefined;
  if (b.type !== undefined) {
    if (typeof b.type !== "string" || !VALID_TYPES.has(b.type)) {
      return { ok: false, error: "Type invalide" };
    }
    type = b.type as QRType;
  }

  let metadata: Record<string, unknown> | undefined;
  if (b.metadata !== undefined && b.metadata !== null) {
    if (typeof b.metadata !== "object" || Array.isArray(b.metadata)) {
      return { ok: false, error: "Metadata invalide" };
    }
    metadata = b.metadata as Record<string, unknown>;
  }

  let note: string | undefined;
  if (b.note !== undefined && b.note !== null) {
    if (typeof b.note !== "string") {
      return { ok: false, error: "Note invalide" };
    }
    const trimmed = b.note.trim();
    if (trimmed.length > 64) {
      return { ok: false, error: "Note trop longue (max 64)" };
    }
    note = trimmed || undefined;
  }

  return { ok: true, data: { content: b.content, type, metadata, note } };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // Réservé Pro
  if (!isPro(user)) {
    return NextResponse.json({ error: "Abonnement Pro requis" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "QR code introuvable" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const validation = validateBody(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { content: rawContent, type, metadata, note } = validation.data;

  // Si type + metadata fournis, on reconstruit le contenu via buildContent
  // sinon on prend le content brut fourni
  const effectiveType = type ?? (existing.type as QRType);
  let finalContent = rawContent.trim();
  if (type && metadata) {
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(metadata)) {
      fields[k] = typeof v === "string" ? v : String(v ?? "");
    }
    finalContent = buildContent(effectiveType, fields).trim();
  }

  if (!finalContent) {
    return NextResponse.json({ error: "Le contenu généré est vide" }, { status: 400 });
  }

  // Validation URL si type url
  if (effectiveType === "url") {
    try {
      const parsed = new URL(finalContent);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json(
          { error: "L'URL doit commencer par http:// ou https://" },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }
  }

  // Prisma Json cast (le typage Record<string, unknown> ne satisfait pas InputJsonValue)
  const archiveMetadata = existing.metadata === null ? undefined : (existing.metadata as object);
  const nextMetadata = metadata === undefined ? undefined : (metadata as object);

  // Transaction : archive puis met à jour
  const updated = await prisma.$transaction(async (tx) => {
    await tx.qRCodeVersion.create({
      data: {
        qrCodeId: existing.id,
        content: existing.content,
        type: existing.type,
        metadata: archiveMetadata,
        note: note ?? null,
        createdBy: user.id,
      },
    });

    return tx.qRCode.update({
      where: { id: existing.id },
      data: {
        content: finalContent,
        type: effectiveType,
        metadata: nextMetadata,
      },
    });
  });

  const { passwordHash, passwordSalt, ...rest } = updated;
  void passwordSalt;
  return NextResponse.json({ ...rest, hasPassword: Boolean(passwordHash) });
}
