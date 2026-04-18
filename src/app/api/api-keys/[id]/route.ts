import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const { id } = await params;
  const apiKey = await prisma.apiKey.findFirst({
    where: { id, userId: user.id },
    select: { id: true, revokedAt: true },
  });

  if (!apiKey) {
    return NextResponse.json({ error: "Clé introuvable" }, { status: 404 });
  }

  if (apiKey.revokedAt) {
    return NextResponse.json({ success: true, alreadyRevoked: true });
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
