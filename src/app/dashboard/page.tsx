"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { QRCodeData } from "@/lib/types";
import { getQRCodes, deleteQRCode } from "@/lib/qr-storage";
import QRCode from "qrcode";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const loadQRCodes = useCallback(() => {
    if (session?.user?.email) {
      const codes = getQRCodes(session.user.email);
      setQrCodes(codes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    }
  }, [session?.user?.email]);

  useEffect(() => {
    loadQRCodes();
  }, [loadQRCodes]);

  useEffect(() => {
    async function generatePreviews() {
      const newPreviews: Record<string, string> = {};
      for (const qr of qrCodes) {
        try {
          newPreviews[qr.id] = await QRCode.toDataURL(qr.content || "placeholder", {
            width: 80,
            margin: 1,
            color: {
              dark: qr.foregroundColor,
              light: qr.backgroundColor,
            },
            errorCorrectionLevel: qr.errorCorrection,
          });
        } catch {
          newPreviews[qr.id] = "";
        }
      }
      setPreviews(newPreviews);
    }
    if (qrCodes.length > 0) {
      generatePreviews();
    }
  }, [qrCodes]);

  function handleDelete(id: string) {
    if (!session?.user?.email) return;
    if (confirm("Supprimer ce QR code ?")) {
      deleteQRCode(session.user.email, id);
      loadQRCodes();
    }
  }

  async function handleDownload(qr: QRCodeData) {
    try {
      const dataUrl = await QRCode.toDataURL(qr.content, {
        width: qr.size,
        margin: 2,
        color: {
          dark: qr.foregroundColor,
          light: qr.backgroundColor,
        },
        errorCorrectionLevel: qr.errorCorrection,
      });
      const link = document.createElement("a");
      link.download = `${qr.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("Erreur lors du téléchargement");
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes QR Codes</h1>
            <p className="text-gray-500 mt-1">{qrCodes.length} QR code{qrCodes.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => router.push("/qrcode/new")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau QR Code
          </button>
        </div>

        {qrCodes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun QR code</h3>
            <p className="mt-1 text-gray-500">Créez votre premier QR code pour commencer.</p>
            <button
              onClick={() => router.push("/qrcode/new")}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer un QR Code
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {qrCodes.map((qr) => (
              <div
                key={qr.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-lg overflow-hidden border border-gray-100">
                    {previews[qr.id] ? (
                      <img src={previews[qr.id]} alt={qr.name} width={64} height={64} />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{qr.name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 uppercase">
                      {qr.type}
                    </span>
                    <p className="mt-1 text-sm text-gray-400 truncate">{qr.content}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/qrcode/${qr.id}`)}
                    className="flex-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDownload(qr)}
                    className="flex-1 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition"
                  >
                    Télécharger
                  </button>
                  <button
                    onClick={() => handleDelete(qr.id)}
                    className="text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
