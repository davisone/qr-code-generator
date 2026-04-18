import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/qr-password";
import { checkScanRateLimit } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Rate limit anti brute-force basé sur l'IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddress =
    forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const allowed = await checkScanRateLimit(ipAddress);
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "rate_limit" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password?.trim() ?? "";
  if (!password) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const qrCode = await prisma.qRCode.findUnique({
    where: { shareToken: token, isPublic: true },
    select: { passwordHash: true, passwordSalt: true },
  });
  if (!qrCode?.passwordHash || !qrCode?.passwordSalt) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const valid = verifyPassword(password, qrCode.passwordHash, qrCode.passwordSalt);
  if (!valid) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(`qraft_unlock_${token}`, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });
  return res;
}
