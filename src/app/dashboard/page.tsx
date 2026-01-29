"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import QRCode from "qrcode";
import JSZip from "jszip";

interface QRCodeItem {
  id: string;
  name: string;
  type: string;
  content: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  errorCorrection: string;
  isFavorite: boolean;
  isPublic: boolean;
  logoDataUrl: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "url" | "text" | "favorites">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const loadQRCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/qrcodes");
      if (res.ok) {
        const data = await res.json();
        setQrCodes(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      loadQRCodes();
    }
  }, [status, loadQRCodes]);

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
            errorCorrectionLevel: qr.errorCorrection as "L" | "M" | "Q" | "H",
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

  const filteredQRCodes = qrCodes.filter((qr) => {
    const matchesSearch =
      search === "" ||
      qr.name.toLowerCase().includes(search.toLowerCase()) ||
      qr.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "favorites" && qr.isFavorite) ||
      (filterType !== "favorites" && qr.type === filterType);
    return matchesSearch && matchesFilter;
  });

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce QR code ?")) return;
    try {
      const res = await fetch(`/api/qrcodes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQrCodes((prev) => prev.filter((qr) => qr.id !== id));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch {
      alert("Erreur lors de la suppression");
    }
  }

  async function handleDownload(qr: QRCodeItem) {
    try {
      const dataUrl = await QRCode.toDataURL(qr.content, {
        width: qr.size,
        margin: 2,
        color: {
          dark: qr.foregroundColor,
          light: qr.backgroundColor,
        },
        errorCorrectionLevel: qr.errorCorrection as "L" | "M" | "Q" | "H",
      });
      const link = document.createElement("a");
      link.download = `${qr.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("Erreur lors du téléchargement");
    }
  }

  async function handleToggleFavorite(id: string) {
    try {
      const res = await fetch(`/api/qrcodes/${id}/favorite`, { method: "PATCH" });
      if (res.ok) {
        const updated = await res.json();
        setQrCodes((prev) =>
          prev.map((qr) => (qr.id === id ? { ...qr, isFavorite: updated.isFavorite } : qr))
        );
      }
    } catch {
      alert("Erreur lors du changement de favori");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const res = await fetch("/api/qrcodes/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const newQR = await res.json();
        setQrCodes((prev) => [newQR, ...prev]);
      }
    } catch {
      alert("Erreur lors de la duplication");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filteredQRCodes.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredQRCodes.map((qr) => qr.id)));
    }
  }

  async function handleExportZip() {
    if (selected.size === 0) return;
    setExporting(true);
    try {
      const zip = new JSZip();
      const selectedQRs = qrCodes.filter((qr) => selected.has(qr.id));

      for (const qr of selectedQRs) {
        const dataUrl = await QRCode.toDataURL(qr.content, {
          width: qr.size,
          margin: 2,
          color: {
            dark: qr.foregroundColor,
            light: qr.backgroundColor,
          },
          errorCorrectionLevel: qr.errorCorrection as "L" | "M" | "Q" | "H",
        });
        const base64 = dataUrl.split(",")[1];
        zip.file(`${qr.name}.png`, base64, { base64: true });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.download = "qrcodes.zip";
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      alert("Erreur lors de l'export ZIP");
    } finally {
      setExporting(false);
    }
  }

  if (status === "loading" || loading) {
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
        <div className="flex items-center justify-between mb-6">
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

        {/* Search & Filter Bar */}
        {qrCodes.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou contenu..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 bg-white"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "url", "text", "favorites"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    filterType === f
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {f === "all" ? "Tous" : f === "url" ? "URL" : f === "text" ? "Texte" : "Favoris"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Batch actions */}
        {selected.size > 0 && (
          <div className="mb-4 flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <span className="text-sm font-medium text-indigo-700">
              {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
            </span>
            <button
              onClick={handleExportZip}
              disabled={exporting}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
            >
              {exporting ? "Export en cours..." : "Exporter en ZIP"}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              Désélectionner
            </button>
          </div>
        )}

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
        ) : filteredQRCodes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Aucun résultat</h3>
            <p className="mt-1 text-gray-500">Essayez de modifier votre recherche ou vos filtres.</p>
          </div>
        ) : (
          <>
            {/* Select all toggle */}
            <div className="mb-3 flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {selected.size === filteredQRCodes.length ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredQRCodes.map((qr) => (
                <div
                  key={qr.id}
                  className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow ${
                    selected.has(qr.id) ? "border-indigo-400 ring-2 ring-indigo-100" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selected.has(qr.id)}
                      onChange={() => toggleSelect(qr.id)}
                      className="mt-1 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <div className="shrink-0 rounded-lg overflow-hidden border border-gray-100">
                      {previews[qr.id] ? (
                        <img src={previews[qr.id]} alt={qr.name} width={64} height={64} />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 animate-pulse" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-gray-900 truncate">{qr.name}</h3>
                        {/* Favorite star */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(qr.id); }}
                          className="shrink-0 p-0.5"
                          title={qr.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                          <svg
                            className={`w-4 h-4 ${qr.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            fill={qr.isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 uppercase">
                          {qr.type}
                        </span>
                        {qr.isPublic && (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            Partagé
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-400 truncate">{qr.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => router.push(`/qrcode/${qr.id}`)}
                      className="flex-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1.5 rounded-lg transition"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDownload(qr)}
                      className="text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition"
                      title="Télécharger"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDuplicate(qr.id)}
                      className="text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition"
                      title="Dupliquer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(qr.id)}
                      className="text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
