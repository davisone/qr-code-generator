import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SharedQRClient } from "./SharedQRClient";

export default async function SharedQRCodePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const qrCode = await prisma.qRCode.findUnique({
    where: { shareToken: token, isPublic: true },
    select: {
      id: true,
      name: true,
      type: true,
      content: true,
      foregroundColor: true,
      backgroundColor: true,
      size: true,
      errorCorrection: true,
      logoDataUrl: true,
    },
  });

  if (!qrCode) notFound();

  return <SharedQRClient qrCode={qrCode} />;
}
