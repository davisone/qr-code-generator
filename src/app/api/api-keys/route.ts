import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-keys";

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
}

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      createdAt: true,
      revokedAt: true,
    },
  });

  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { name?: unknown };
  const rawName = typeof body.name === "string" ? body.name.trim() : "";

  if (!rawName) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }
  if (rawName.length > 60) {
    return NextResponse.json({ error: "Nom trop long (60 caractères max)" }, { status: 400 });
  }

  const { plainKey, hash, prefix } = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      name: rawName,
      keyHash: hash,
      keyPrefix: prefix,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
    },
  });

  // La clé en clair n'est retournée qu'une seule fois.
  return NextResponse.json(
    {
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.keyPrefix,
      key: plainKey,
      createdAt: apiKey.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
