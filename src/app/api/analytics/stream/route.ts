import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Runtime Node.js obligatoire pour Prisma (Edge runtime non supporté)
export const runtime = "nodejs";
// Limite Vercel free tier : 5 minutes max par invocation
export const maxDuration = 300;

interface ScanPayload {
  id: string;
  qrCodeId: string;
  qrCodeName: string;
  country: string | null;
  city: string | null;
  device: string;
  browser: string;
  os: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

// GET /api/analytics/stream — Server-Sent Events
// Stream live des scans des QR codes appartenant au user authentifié.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const userId = user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      // Cursor : on n'envoie que les scans plus récents à chaque tick
      let cursor = new Date();

      const safeEnqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };

      const formatScanEvent = (payload: ScanPayload): string => {
        return `event: scan\ndata: ${JSON.stringify(payload)}\n\n`;
      };

      // Initial state : 10 derniers scans de la dernière heure
      try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const initialScans = await prisma.scan.findMany({
          where: {
            scannedAt: { gte: oneHourAgo },
            qrCode: { userId },
          },
          include: { qrCode: { select: { id: true, name: true } } },
          orderBy: { scannedAt: "desc" },
          take: 10,
        });

        // On envoie dans l'ordre chronologique (ancien -> récent)
        for (const scan of [...initialScans].reverse()) {
          const payload: ScanPayload = {
            id: scan.id,
            qrCodeId: scan.qrCodeId,
            qrCodeName: scan.qrCode.name,
            country: scan.country,
            city: scan.city,
            device: scan.device ?? "unknown",
            browser: scan.browser ?? "unknown",
            os: scan.os ?? "unknown",
            latitude: scan.latitude,
            longitude: scan.longitude,
            createdAt: scan.scannedAt.toISOString(),
          };
          safeEnqueue(formatScanEvent(payload));
        }

        if (initialScans.length > 0) {
          // Avance le cursor au scan le plus récent pour éviter re-envois
          cursor = initialScans[0].scannedAt;
        }
      } catch {
        // Erreur silencieuse sur initial fetch ; le polling prendra le relais
      }

      // Tick polling : toutes les 3 secondes
      const tickIntervalMs = 3000;
      const tick = async () => {
        if (closed) return;
        try {
          const newScans = await prisma.scan.findMany({
            where: {
              scannedAt: { gt: cursor },
              qrCode: { userId },
            },
            include: { qrCode: { select: { id: true, name: true } } },
            orderBy: { scannedAt: "asc" },
            take: 50,
          });

          for (const scan of newScans) {
            const payload: ScanPayload = {
              id: scan.id,
              qrCodeId: scan.qrCodeId,
              qrCodeName: scan.qrCode.name,
              country: scan.country,
              city: scan.city,
              device: scan.device ?? "unknown",
              browser: scan.browser ?? "unknown",
              os: scan.os ?? "unknown",
              latitude: scan.latitude,
              longitude: scan.longitude,
              createdAt: scan.scannedAt.toISOString(),
            };
            safeEnqueue(formatScanEvent(payload));
          }

          if (newScans.length > 0) {
            cursor = newScans[newScans.length - 1].scannedAt;
          }
        } catch {
          // Erreur silencieuse : on retentera au prochain tick
        }
      };

      const tickInterval = setInterval(tick, tickIntervalMs);
      // Keep-alive ping toutes les 30 secondes
      const pingInterval = setInterval(() => safeEnqueue(`: ping\n\n`), 30_000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(tickInterval);
        clearInterval(pingInterval);
        try {
          controller.close();
        } catch {
          // Déjà fermé
        }
      };

      // Fermeture propre si le client ferme la connexion
      req.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      // Le client a coupé : rien de plus à faire, le start a déjà nettoyé
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
