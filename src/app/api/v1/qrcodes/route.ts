import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/api-v1-auth";
import { prisma } from "@/lib/prisma";
import { QR_TYPE_LIST, type QRType } from "@/lib/qr-formats";
import { isPro } from "@/lib/stripe";
import { BASE_URL } from "@/lib/config";
import { v4 as uuidv4 } from "uuid";

const ERROR_CORRECTIONS = ["L", "M", "Q", "H"] as const;
type ErrorCorrection = (typeof ERROR_CORRECTIONS)[number];
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const MIN_SIZE = 128;
const MAX_SIZE = 2048;

const VALID_TYPES = new Set<string>(QR_TYPE_LIST.map((t) => t.type));

function badRequest(message: string, rateHeaders: Headers): NextResponse {
  return NextResponse.json(
    { error: "validation_error", message },
    { status: 400, headers: rateHeaders }
  );
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.", auth.rateHeaders);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const type = typeof body.type === "string" ? body.type : "url";
  const foregroundColor = typeof body.foregroundColor === "string" ? body.foregroundColor : "#1a1410";
  const backgroundColor = typeof body.backgroundColor === "string" ? body.backgroundColor : "#ffffff";
  const errorCorrection = typeof body.errorCorrection === "string" ? body.errorCorrection : "M";
  const sizeRaw = body.size;
  const category = typeof body.category === "string" ? body.category.trim() : "";

  if (!name) return badRequest("`name` is required.", auth.rateHeaders);
  if (name.length > 100) return badRequest("`name` must be 100 characters or fewer.", auth.rateHeaders);
  if (!content) return badRequest("`content` is required.", auth.rateHeaders);
  if (!VALID_TYPES.has(type)) {
    return badRequest(
      `Invalid \`type\`. Allowed: ${Array.from(VALID_TYPES).join(", ")}.`,
      auth.rateHeaders
    );
  }
  if (!HEX_COLOR.test(foregroundColor)) {
    return badRequest("`foregroundColor` must be a hex color like #1a1410.", auth.rateHeaders);
  }
  if (!HEX_COLOR.test(backgroundColor)) {
    return badRequest("`backgroundColor` must be a hex color like #ffffff.", auth.rateHeaders);
  }
  if (!ERROR_CORRECTIONS.includes(errorCorrection as ErrorCorrection)) {
    return badRequest("`errorCorrection` must be L, M, Q or H.", auth.rateHeaders);
  }
  let size = 512;
  if (sizeRaw !== undefined) {
    if (typeof sizeRaw !== "number" || !Number.isFinite(sizeRaw)) {
      return badRequest("`size` must be a number.", auth.rateHeaders);
    }
    size = Math.floor(sizeRaw);
    if (size < MIN_SIZE || size > MAX_SIZE) {
      return badRequest(`\`size\` must be between ${MIN_SIZE} and ${MAX_SIZE}.`, auth.rateHeaders);
    }
  }

  // Validation URL spécifique
  if (type === "url") {
    try {
      const parsed = new URL(content);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return badRequest("URL must start with http:// or https://.", auth.rateHeaders);
      }
    } catch {
      return badRequest("Invalid URL.", auth.rateHeaders);
    }
  }

  // Récupération user pour déterminer expiration
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, stripeStatus: true, stripeCurrentPeriodEnd: true },
  });
  if (!user) {
    return NextResponse.json(
      { error: "user_not_found", message: "User associated with this key was not found." },
      { status: 404, headers: auth.rateHeaders }
    );
  }

  const shareToken = uuidv4();
  const expiresAt = isPro(user)
    ? null
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const qrCode = await prisma.qRCode.create({
    data: {
      name,
      type: type as QRType,
      content,
      foregroundColor,
      backgroundColor,
      size,
      errorCorrection,
      category: category || null,
      isPublic: true,
      shareToken,
      expiresAt,
      userId: user.id,
    },
  });

  return NextResponse.json(
    {
      id: qrCode.id,
      name: qrCode.name,
      type: qrCode.type,
      content: qrCode.content,
      shareToken: qrCode.shareToken,
      shareUrl: `${BASE_URL}/r/${qrCode.shareToken}`,
      foregroundColor: qrCode.foregroundColor,
      backgroundColor: qrCode.backgroundColor,
      size: qrCode.size,
      errorCorrection: qrCode.errorCorrection,
      category: qrCode.category,
      createdAt: qrCode.createdAt.toISOString(),
      expiresAt: qrCode.expiresAt ? qrCode.expiresAt.toISOString() : null,
    },
    { status: 201, headers: auth.rateHeaders }
  );
}
