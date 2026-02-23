"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Analytics from "@/components/Analytics";
import QRCode from "qrcode";
import JSZip from "jszip";
import Image from "next/image";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

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

type Tab = "qrcodes" | "analytics" | "map";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("qrcodes");
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "url" | "text" | "favorites">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [selectedQRCodeForAnalytics, setSelectedQRCodeForAnalytics] = useState<string>("");

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
        if (data.length > 0 && !selectedQRCodeForAnalytics) {
          setSelectedQRCodeForAnalytics(data[0].id);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [selectedQRCodeForAnalytics]);

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
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a0a0a]"></div>
      </div>
    );
  }

  if (!session) return null;

  const selectedQRForAnalytics = qrCodes.find((qr) => qr.id === selectedQRCodeForAnalytics);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-[#e5e5e5]">
          <button
            onClick={() => setActiveTab("qrcodes")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "qrcodes"
                ? "border-[#0a0a0a] text-[#0a0a0a]"
                : "border-transparent text-[#525252] hover:text-[#0a0a0a]"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Mes QR Codes
            </span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "analytics"
                ? "border-[#0a0a0a] text-[#0a0a0a]"
                : "border-transparent text-[#525252] hover:text-[#0a0a0a]"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </span>
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "map"
                ? "border-[#0a0a0a] text-[#0a0a0a]"
                : "border-transparent text-[#525252] hover:text-[#0a0a0a]"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Carte
            </span>
          </button>
        </div>

        {/* QR Codes Tab */}
        {activeTab === "qrcodes" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#0a0a0a]">Mes QR Codes</h1>
                <p className="text-[#525252] mt-1">{qrCodes.length} QR code{qrCodes.length !== 1 ? "s" : ""}</p>
              </div>
              <button
                onClick={() => router.push("/qrcode/new")}
                className="btn btn-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouveau
              </button>
            </div>

        {/* Search & Filter Bar */}
        {qrCodes.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]"
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
                placeholder="Rechercher..."
                className="input pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "url", "text", "favorites"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`btn btn-sm ${
                    filterType === f ? "btn-primary" : "btn-secondary"
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
          <div className="mb-4 flex items-center gap-3 p-4 bento-card">
            <span className="text-sm font-medium text-[#0a0a0a]">
              {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
            </span>
            <button
              onClick={handleExportZip}
              disabled={exporting}
              className="btn btn-primary btn-sm"
            >
              {exporting ? "Export..." : "Exporter ZIP"}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="btn btn-ghost btn-sm"
            >
              Annuler
            </button>
          </div>
        )}

        {qrCodes.length === 0 ? (
          <div className="bento-card text-center py-16">
            <div className="icon-box mx-auto mb-4">
              <svg className="w-6 h-6 text-[#525252]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0a0a0a]">Aucun QR code</h3>
            <p className="mt-1 text-[#525252]">Créez votre premier QR code pour commencer.</p>
            <button
              onClick={() => router.push("/qrcode/new")}
              className="btn btn-primary mt-6"
            >
              Créer un QR Code
            </button>
          </div>
        ) : filteredQRCodes.length === 0 ? (
          <div className="bento-card text-center py-16">
            <h3 className="text-lg font-semibold text-[#0a0a0a]">Aucun résultat</h3>
            <p className="mt-1 text-[#525252]">Essayez de modifier votre recherche.</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-sm text-[#525252] hover:text-[#0a0a0a]"
              >
                {selected.size === filteredQRCodes.length ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredQRCodes.map((qr) => (
                <div
                  key={qr.id}
                  className={`bento-card p-5 ${
                    selected.has(qr.id) ? "ring-2 ring-[#0a0a0a]" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selected.has(qr.id)}
                      onChange={() => toggleSelect(qr.id)}
                      className="mt-1 h-4 w-4 rounded border-[#d4d4d4] text-[#0a0a0a] focus:ring-[#0a0a0a]"
                    />
                    <div className="shrink-0 rounded-xl overflow-hidden border border-[#e5e5e5]">
                      {previews[qr.id] ? (
                        <Image src={previews[qr.id]} alt={qr.name} width={64} height={64} unoptimized />
                      ) : (
                        <div className="w-16 h-16 bg-[#f5f5f5] animate-pulse" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#0a0a0a] truncate">{qr.name}</h3>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(qr.id); }}
                          className="shrink-0"
                        >
                          <svg
                            className={`w-4 h-4 ${qr.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-[#d4d4d4]"}`}
                            fill={qr.isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge badge-gray">{qr.type}</span>
                        {qr.isPublic && <span className="badge badge-emerald">Public</span>}
                      </div>
                      <p className="mt-1 text-sm text-[#a3a3a3] truncate">{qr.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-4 pt-4 border-t border-[#f5f5f5]">
                    <button
                      onClick={() => router.push(`/qrcode/${qr.id}`)}
                      className="btn btn-ghost btn-sm flex-1"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDownload(qr)}
                      className="btn btn-ghost btn-sm p-2"
                      title="Télécharger"
                      aria-label="Télécharger le QR code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDuplicate(qr.id)}
                      className="btn btn-ghost btn-sm p-2"
                      title="Dupliquer"
                      aria-label="Dupliquer le QR code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(qr.id)}
                      className="btn btn-ghost btn-sm p-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                      title="Supprimer"
                      aria-label="Supprimer le QR code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#0a0a0a]">Analytics</h1>
              <p className="text-[#525252] mt-1">Suivez les statistiques de vos QR codes</p>
            </div>

            {qrCodes.length === 0 ? (
              <div className="bento-card p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-[#d4d4d4] mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-[#0a0a0a] mb-2">
                  Aucun QR code
                </h2>
                <p className="text-[#525252] mb-6">
                  Créez votre premier QR code pour commencer à suivre les statistiques.
                </p>
                <button
                  onClick={() => router.push("/qrcode/new")}
                  className="btn btn-primary"
                >
                  Créer un QR code
                </button>
              </div>
            ) : (
              <>
                {/* QR Code Selector */}
                <div className="bento-card p-6 mb-6">
                  <label
                    htmlFor="qrcode-select"
                    className="block text-sm font-medium text-[#0a0a0a] mb-2"
                  >
                    Sélectionner un QR code
                  </label>
                  <div className="flex items-center gap-4">
                    <select
                      id="qrcode-select"
                      value={selectedQRCodeForAnalytics}
                      onChange={(e) => setSelectedQRCodeForAnalytics(e.target.value)}
                      className="input flex-1"
                    >
                      {qrCodes.map((qr) => (
                        <option key={qr.id} value={qr.id}>
                          {qr.name} ({qr.type === "url" ? "URL" : "Texte"})
                          {qr.isPublic ? " - Public" : ""}
                        </option>
                      ))}
                    </select>
                    {selectedQRForAnalytics && (
                      <button
                        onClick={() => router.push(`/qrcode/${selectedQRForAnalytics.id}`)}
                        className="btn btn-secondary"
                      >
                        Modifier
                      </button>
                    )}
                  </div>
                  {selectedQRForAnalytics && !selectedQRForAnalytics.isPublic && (
                    <p className="mt-3 text-sm text-amber-600 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Ce QR code n&apos;est pas partagé publiquement. Activez le partage pour tracker les scans.
                    </p>
                  )}
                </div>

                {/* Analytics Component */}
                {selectedQRCodeForAnalytics && (
                  <Analytics qrCodeId={selectedQRCodeForAnalytics} />
                )}
              </>
            )}
          </>
        )}

        {/* Map Tab */}
        {activeTab === "map" && (
          <MapView qrCodes={qrCodes.map(qr => ({ id: qr.id, name: qr.name, type: qr.type, foregroundColor: qr.foregroundColor }))} />
        )}
      </main>
    </div>
  );
}
