"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Analytics from "@/components/Analytics";
import QRCode from "qrcode";
import JSZip from "jszip";
import dynamic from "next/dynamic";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import type { QRType } from "@/lib/qr-formats";
import type { Tab, QRCodeItem } from "@/types/qrcode";
import { useQRCodes } from "@/hooks/useQRCodes";
import { useProStatus } from "@/hooks/useProStatus";
import { useQRFilters } from "@/hooks/useQRFilters";
import { QRCodeCard } from "@/components/dashboard/QRCodeCard";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { EditContentModal } from "@/components/dashboard/EditContentModal";
import { VersionHistoryModal } from "@/components/dashboard/VersionHistoryModal";
import { PasswordProtectModal } from "@/components/dashboard/PasswordProtectModal";
import { ABTestingModal } from "@/components/dashboard/ABTestingModal";
import { LiveAnalytics } from "@/components/dashboard/LiveAnalytics";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("dashboard");
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tab>("qrcodes");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQRCodeForAnalytics, setSelectedQRCodeForAnalytics] = useState<string>("");
  const [editingQR, setEditingQR] = useState<QRCodeItem | null>(null);
  const [historyQR, setHistoryQR] = useState<QRCodeItem | null>(null);
  const [passwordQR, setPasswordQR] = useState<QRCodeItem | null>(null);
  const [abQR, setAbQR] = useState<QRCodeItem | null>(null);

  const { isPro, refresh: refreshPro } = useProStatus();

  const { qrCodes, previews, loading, loadQRCodes, setQrCodes } = useQRCodes((firstId) => {
    setSelectedQRCodeForAnalytics(firstId);
  });

  const {
    search,
    setSearch,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory,
    filteredQRCodes,
    uniqueCategories,
  } = useQRFilters(qrCodes);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadQRCodes();
      refreshPro();
    }
  }, [status, loadQRCodes, refreshPro]);

  useEffect(() => {
    if (searchParams?.get("upgrade") === "success") {
      toast.success(t("toast_upgrade_success"));
      refreshPro();
      const url = new URL(window.location.href);
      url.searchParams.delete("upgrade");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, t, refreshPro]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!confirm(t("delete_confirm"))) return;
    try {
      const res = await fetch(`/api/qrcodes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQrCodes((prev) => prev.filter((qr) => qr.id !== id));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.success(t("toast_deleted"));
      } else {
        toast.error(t("toast_error"));
      }
    } catch {
      toast.error(t("toast_error"));
    }
  }

  async function handleDownload(qr: QRCodeItem) {
    const qrContent =
      qr.isPublic && qr.shareToken && qr.type === "url"
        ? `${window.location.origin}/r/${qr.shareToken}`
        : qr.content;
    try {
      const dataUrl = await QRCode.toDataURL(qrContent, {
        width: qr.size,
        margin: 2,
        color: { dark: qr.foregroundColor, light: qr.backgroundColor },
        errorCorrectionLevel: qr.errorCorrection as "L" | "M" | "Q" | "H",
      });
      const link = document.createElement("a");
      link.download = `${qr.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error(t("toast_error"));
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
        toast.success(updated.isFavorite ? t("toast_favorite_added") : t("toast_favorite_removed"));
      } else {
        toast.error(t("toast_error"));
      }
    } catch {
      toast.error(t("toast_error"));
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
        toast.success(t("toast_duplicated"));
      } else {
        toast.error(t("toast_error"));
      }
    } catch {
      toast.error(t("toast_error"));
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
      for (const qr of qrCodes.filter((qr) => selected.has(qr.id))) {
        const dataUrl = await QRCode.toDataURL(qr.content, {
          width: qr.size,
          margin: 2,
          color: { dark: qr.foregroundColor, light: qr.backgroundColor },
          errorCorrectionLevel: qr.errorCorrection as "L" | "M" | "Q" | "H",
        });
        zip.file(`${qr.name}.png`, dataUrl.split(",")[1], { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.download = "qrcodes.zip";
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(t("toast_zip_exported"));
    } catch {
      toast.error(t("toast_error"));
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    setDeleting(true);
    const ids = Array.from(selected);
    let successCount = 0;
    let errorCount = 0;
    try {
      const deletedIds: string[] = [];
      for (const id of ids) {
        try {
          const res = await fetch(`/api/qrcodes/${id}`, { method: "DELETE" });
          if (res.ok) { deletedIds.push(id); successCount++; }
          else errorCount++;
        } catch { errorCount++; }
      }
      setQrCodes((prev) => prev.filter((qr) => !deletedIds.includes(qr.id)));
      setSelected(new Set());
      if (errorCount === 0) toast.success(t("toast_delete_selected", { count: successCount }));
      else toast.error(t("toast_error"));
    } finally {
      setDeleting(false);
    }
  }

  // ── Guards ────────────────────────────────────────────────────────────────

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div
          className="text-4xl tracking-widest"
          style={{
            fontFamily: "var(--font-display, cursive)",
            color: "var(--mid)",
            animation: "fadeIn 0.6s ease infinite alternate",
          }}
        >
          ...
        </div>
      </div>
    );
  }
  if (!session) return null;

  const selectedQRForAnalytics = qrCodes.find((qr) => qr.id === selectedQRCodeForAnalytics);
  const tabTitle =
    activeTab === "qrcodes"
      ? t("tab_qrcodes")
      : activeTab === "analytics"
      ? t("tab_analytics")
      : t("tab_map");

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header rouge */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8" style={{ background: "var(--red)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
            <h1
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                color: "white",
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              {tabTitle}
            </h1>
            {activeTab === "qrcodes" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/bulk")}
                  className="btn"
                  title={t("import_csv")}
                  style={{
                    background: "transparent",
                    color: "white",
                    fontSize: "0.68rem",
                    border: "1.5px solid rgba(255,255,255,0.6)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                  </svg>
                  {t("import_csv")}
                </button>
                <button
                  onClick={() => router.push("/qrcode/new")}
                  className="btn"
                  style={{ background: "var(--ink)", color: "var(--bg)", fontSize: "0.68rem" }}
                >
                  + {t("new_qr")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Barre noire navigation + filtres */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 mb-6" style={{ background: "var(--ink)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center flex-wrap">
            {(["qrcodes", "analytics", "map"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: "none",
                  border: "none",
                  color: activeTab === tab ? "var(--yellow)" : "rgba(240,235,225,0.5)",
                  padding: "0.65rem 1.2rem",
                  fontFamily: "var(--font-sans, sans-serif)",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {tab === "qrcodes"
                  ? `${t("tab_qrcodes")} (${qrCodes.length})`
                  : tab === "analytics"
                  ? t("tab_analytics")
                  : t("tab_map")}
              </button>
            ))}

            {activeTab === "qrcodes" && qrCodes.length > 0 && (
              <>
                <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 0.25rem" }} />
                <select
                  value={filterType === "favorites" ? "all" : filterType}
                  onChange={(e) => setFilterType(e.target.value as "all" | QRType)}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "none",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                    color:
                      filterType !== "favorites" && filterType !== "all"
                        ? "var(--yellow)"
                        : "rgba(240,235,225,0.7)",
                    padding: "0 1rem",
                    height: "100%",
                    fontFamily: "var(--font-sans, sans-serif)",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    outline: "none",
                    appearance: "none",
                    minWidth: 110,
                  }}
                >
                  {(
                    ["all", "url", "text", "wifi", "vcard", "email", "phone", "sms", "whatsapp", "geo", "social"] as const
                  ).map((f) => (
                    <option key={f} value={f} style={{ background: "#1a1410", textTransform: "uppercase" }}>
                      {f === "all" ? t("filter_all") : t(`filter_${f}` as Parameters<typeof t>[0])}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setFilterType(filterType === "favorites" ? "all" : "favorites")}
                  style={{
                    background: "none",
                    border: "none",
                    color: filterType === "favorites" ? "var(--yellow)" : "rgba(240,235,225,0.5)",
                    padding: "0.65rem 1rem",
                    fontFamily: "var(--font-sans, sans-serif)",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {t("filter_favorites")}
                </button>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("search_placeholder")}
                  style={{
                    marginLeft: "auto",
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.72rem",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#f0ebe1",
                    fontFamily: "var(--font-mono, monospace)",
                    outline: "none",
                    width: 180,
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* Batch actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 p-3 mb-4" style={{ background: "var(--card)", border: "var(--rule)" }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-sans)" }}>
              {selected.size} {t("selected")}
            </span>
            <button onClick={handleExportZip} disabled={exporting} className="btn btn-sm btn-primary">
              {exporting ? "..." : t("export_zip")}
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="btn btn-sm"
              style={{
                background: "none",
                border: "1px solid var(--red)",
                color: "var(--red)",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                padding: "0.4rem 0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                fontSize: "0.65rem",
              }}
            >
              {t("delete_selected", { count: selected.size })}
            </button>
            <button onClick={() => setSelected(new Set())} className="btn btn-sm btn-ghost">
              ✕
            </button>
          </div>
        )}

        {/* ── Onglet QR CODES ── */}
        {activeTab === "qrcodes" && (
          <>
            {qrCodes.length === 0 ? (
              <div className="py-20 text-center" style={{ border: "var(--rule)", background: "var(--card)" }}>
                <p
                  className="text-6xl mb-4 tracking-wider"
                  style={{ fontFamily: "var(--font-display, cursive)", color: "var(--light)" }}
                >
                  {t("empty_title")}
                </p>
                <p className="text-sm mb-6" style={{ color: "var(--mid)" }}>
                  {t("empty_desc")}
                </p>
                <button onClick={() => router.push("/qrcode/new")} className="btn btn-primary">
                  {t("empty_cta")}
                </button>
              </div>
            ) : filteredQRCodes.length === 0 ? (
              <div className="py-16 text-center" style={{ border: "var(--rule)", background: "var(--card)" }}>
                <p className="text-sm" style={{ color: "var(--mid)" }}>—</p>
              </div>
            ) : (
              <div className="grid gap-0 lg:grid-cols-[1fr_280px] items-start">
                {/* Liste des QR codes */}
                <div>
                  <div className="flex items-center px-3 py-1.5" style={{ background: "var(--ink)" }}>
                    <button
                      onClick={toggleSelectAll}
                      style={{
                        color: "rgba(240,235,225,0.5)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe1")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,225,0.5)")}
                    >
                      {t("select_all")}
                    </button>
                    <span
                      className="ml-auto text-xs"
                      style={{ color: "rgba(240,235,225,0.3)", fontFamily: "var(--font-mono)" }}
                    >
                      {filteredQRCodes.length}
                    </span>
                  </div>

                  {filteredQRCodes.map((qr, i) => (
                    <QRCodeCard
                      key={qr.id}
                      qr={qr}
                      index={i}
                      preview={previews[qr.id] ?? ""}
                      selected={selected.has(qr.id)}
                      onToggleSelect={toggleSelect}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                      onDuplicate={handleDuplicate}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={(id) => router.push(`/qrcode/${id}`)}
                      onCategoryFilter={setFilterCategory}
                      onEditContent={setEditingQR}
                      onHistory={setHistoryQR}
                      onPassword={setPasswordQR}
                      onABTest={setAbQR}
                    />
                  ))}
                </div>

                {/* Sidebar */}
                <div className="lg:sticky lg:top-16">
                  <DashboardSidebar
                    qrCodes={qrCodes}
                    selected={selected}
                    exporting={exporting}
                    filterCategory={filterCategory}
                    uniqueCategories={uniqueCategories}
                    onNewQR={() => router.push("/qrcode/new")}
                    onExportZip={handleExportZip}
                    onFilterCategory={setFilterCategory}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Onglet ANALYTICS ── */}
        {activeTab === "analytics" && (
          <div className="py-4">
            {qrCodes.length === 0 ? (
              <div className="py-20 text-center" style={{ border: "var(--rule)", background: "var(--card)" }}>
                <p className="text-sm mb-6" style={{ color: "var(--mid)" }}>
                  {t("empty_desc")}
                </p>
                <button onClick={() => router.push("/qrcode/new")} className="btn btn-primary">
                  {t("empty_cta")}
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 p-4" style={{ border: "var(--rule)", background: "var(--card)" }}>
                  <label
                    className="block text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: "var(--mid)" }}
                  >
                    {t("tab_qrcodes")}
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedQRCodeForAnalytics}
                      onChange={(e) => setSelectedQRCodeForAnalytics(e.target.value)}
                      className="input flex-1"
                    >
                      {qrCodes.map((qr) => (
                        <option key={qr.id} value={qr.id}>
                          {qr.name} ({qr.type === "url" ? t("filter_url") : t("filter_text")})
                          {qr.isPublic ? " — Public" : ""}
                        </option>
                      ))}
                    </select>
                    {selectedQRForAnalytics && (
                      <button
                        onClick={() => router.push(`/qrcode/${selectedQRForAnalytics.id}`)}
                        className="btn btn-secondary"
                      >
                        {t("edit")}
                      </button>
                    )}
                  </div>
                </div>
                {selectedQRCodeForAnalytics && (
                  <Analytics qrCodeId={selectedQRCodeForAnalytics} isPro={isPro} />
                )}
                {/* Analytics temps réel + heatmap + comparaison (Phase 2.5) */}
                <div className="mt-8">
                  <LiveAnalytics
                    qrCodeName={
                      selectedQRForAnalytics?.name ?? session?.user?.name ?? ""
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Onglet MAP ── */}
        {activeTab === "map" && (
          <div className="py-4">
            <MapView
              qrCodes={qrCodes.map((qr) => ({
                id: qr.id,
                name: qr.name,
                type: qr.type,
                foregroundColor: qr.foregroundColor,
              }))}
            />
          </div>
        )}
      </div>

      <style>{`
        .qr-row:hover .qr-actions { opacity: 1 !important; }
      `}</style>

      {/* Modals QR dynamiques */}
      <EditContentModal
        qrCode={editingQR}
        isOpen={editingQR !== null}
        onClose={() => setEditingQR(null)}
        onSaved={() => {
          loadQRCodes();
          setEditingQR(null);
        }}
      />
      <VersionHistoryModal
        qrCode={historyQR}
        isOpen={historyQR !== null}
        onClose={() => setHistoryQR(null)}
        onRestored={() => {
          loadQRCodes();
          setHistoryQR(null);
        }}
      />
      <PasswordProtectModal
        qrCode={passwordQR}
        isOpen={passwordQR !== null}
        onClose={() => setPasswordQR(null)}
        onSaved={() => {
          loadQRCodes();
          setPasswordQR(null);
        }}
      />
      <ABTestingModal
        qrCode={abQR}
        isOpen={abQR !== null}
        onClose={() => setAbQR(null)}
        onSaved={() => {
          loadQRCodes();
          setAbQR(null);
        }}
      />
    </div>
  );
}
