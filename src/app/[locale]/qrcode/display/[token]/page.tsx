import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Link } from "@/i18n/navigation";

export default async function QRDisplayPage({
  params,
}: {
  params: Promise<{ token: string; locale: string }>;
}) {
  const { token } = await params;

  const qrCode = await prisma.qRCode.findUnique({
    where: { shareToken: token, isPublic: true },
    select: { name: true, type: true, content: true, expiresAt: true },
  });

  if (!qrCode) notFound();

  if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem,6vw,3.5rem)",
              color: "var(--red)",
              letterSpacing: "0.04em",
            }}
          >
            QR code expiré
          </p>
        </div>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    text: "Texte",
    wifi: "Wi-Fi",
    vcard: "Contact",
    email: "Email",
    phone: "Téléphone",
    sms: "SMS",
    geo: "Localisation",
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-16">
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.65rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--mid)",
            marginBottom: "0.75rem",
          }}
        >
          {typeLabels[qrCode.type] ?? qrCode.type}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem,6vw,3.5rem)",
            letterSpacing: "0.04em",
            color: "var(--ink)",
            marginBottom: "2rem",
            lineHeight: 1,
          }}
        >
          {qrCode.name}
        </h1>
        <div
          style={{
            background: "var(--card)",
            border: "var(--rule)",
            padding: "1.5rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            color: "var(--ink)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            lineHeight: 1.7,
          }}
        >
          {qrCode.content}
        </div>
        <div style={{ marginTop: "2rem" }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--mid)",
              textDecoration: "none",
            }}
          >
            ← Créer votre QR code
          </Link>
        </div>
      </div>
    </div>
  );
}
