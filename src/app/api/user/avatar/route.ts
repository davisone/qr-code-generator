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
