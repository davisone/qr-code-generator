"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Analytics from "@/components/Analytics";
import QRCode from "qrcode";
import JSZip from "jszip";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { QRType } from "@/lib/qr-formats";

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
  category: string | null;
}

type Tab = "qrcodes" | "analytics" | "map";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("dashboard");
  const [activeTab, setActiveTab] = useState<Tab>("qrcodes");
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | QRType | "favorites">("all");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
            color: { dark: qr.foregroundColor, light: qr.backgroundColor },
            errorCorrectionLevel: qr.errorCorrection as "L" | "M" | "Q" | "H",
          });
        } catch {
          newPreviews[qr.id] = "";
        }
      }
      setPreviews(newPreviews);
    }
    if (qrCodes.length > 0) generatePreviews();
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
    const matchesCategory =
      filterCategory === null || qr.category === filterCategory;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const uniqueCategories = Array.from(
    new Set(qrCodes.map((qr) => qr.category).filter((c): c is string => c !== null && c.trim() !== ""))
  ).sort();

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
    try {
      const dataUrl = await QRCode.toDataURL(qr.content, {
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
      const selectedQRs = qrCodes.filter((qr) => selected.has(qr.id));
      for (const qr of selectedQRs) {
        const dataUrl = await QRCode.toDataURL(qr.content, {
          width: qr.size,
          margin: 2,
          color: { dark: qr.foregroundColor, light: qr.backgroundColor },
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
          if (res.ok) {
            deletedIds.push(id);
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      }
      setQrCodes((prev) => prev.filter((qr) => !deletedIds.includes(qr.id)));

      setSelected(new Set());

      if (errorCount === 0) {
        toast.success(t("toast_delete_selected", { count: successCount }));
      } else {
        toast.error(t("toast_error"));
      }
    } finally {
      setDeleting(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div
          className="text-4xl tracking-widest"
          style={{ fontFamily: "var(--font-display, cursive)", color: "var(--mid)", animation: "fadeIn 0.6s ease infinite alternate" }}
        >
          ...
        </div>
      </div>
    );
  }

  if (!session) return null;

  const selectedQRForAnalytics = qrCodes.find((qr) => qr.id === selectedQRCodeForAnalytics);

  const tabTitle = activeTab === "qrcodes" ? t("tab_qrcodes") : activeTab === "analytics" ? t("tab_analytics") : t("tab_map");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header band rouge */}
        <div
          className="-mx-4 sm:-mx-6 lg:-mx-8"
          style={{ background: "var(--red)" }}
        >
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
              <button
                onClick={() => router.push("/qrcode/new")}
                className="btn"
                style={{ background: "var(--ink)", color: "var(--bg)", fontSize: "0.68rem" }}
              >
                + {t("new_qr")}
              </button>
            )}
          </div>
        </div>

        {/* Filter strip noire */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 mb-6" style={{ background: "var(--ink)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center flex-wrap">
            <button
              onClick={() => setActiveTab("qrcodes")}
              style={{
                background: "none",
                border: "none",
                color: activeTab === "qrcodes" ? "var(--yellow)" : "rgba(240,235,225,0.5)",
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
              {t("tab_qrcodes")} ({qrCodes.length})
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              style={{
                background: "none",
                border: "none",
                color: activeTab === "analytics" ? "var(--yellow)" : "rgba(240,235,225,0.5)",
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
              {t("tab_analytics")}
            </button>
            <button
              onClick={() => setActiveTab("map")}
              style={{
                background: "none",
                border: "none",
                color: activeTab === "map" ? "var(--yellow)" : "rgba(240,235,225,0.5)",
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
              {t("tab_map")}
            </button>

            {activeTab === "qrcodes" && qrCodes.length > 0 && (
              <>
                <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 0.25rem" }} />
                {(["all", "url", "text", "wifi", "vcard", "email", "phone", "sms", "whatsapp", "geo", "social", "favorites"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    style={{
                      background: "none",
                      border: "none",
                      color: filterType === f ? "var(--yellow)" : "rgba(240,235,225,0.5)",
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
                    {f === "all" ? t("filter_all") :
                     f === "favorites" ? t("filter_favorites") :
                     t(`filter_${f}` as Parameters<typeof t>[0])}
                  </button>
                ))}
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("search_placeholder")}
                  style={{
                    marginLeft: "auto",
                    marginRight: "0",
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

        {/* ── QR CODES TAB ── */}
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
                {/* Liste */}
                <div>
                  {/* Select all bar */}
                  <div
                    className="flex items-center px-3 py-1.5"
                    style={{ background: "var(--ink)" }}
                  >
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
                      onMouseEnter={e => (e.currentTarget.style.color = "#f0ebe1")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,225,0.5)")}
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
                    <div
                      key={qr.id}
                      className="qr-row"
                      style={{
                        animationDelay: `${i * 0.04}s`,
                        animation: "rowIn 0.35s ease both",
                        borderLeft: selected.has(qr.id) ? "4px solid var(--red)" : undefined,
                      }}
                    >
                      {/* Preview + checkbox */}
                      <div className="flex flex-col items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={selected.has(qr.id)}
                          onChange={() => toggleSelect(qr.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ accentColor: "var(--red)", width: 14, height: 14 }}
                        />
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            border: "1px solid rgba(0,0,0,0.15)",
                            background: "white",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          {previews[qr.id] ? (
                            <Image src={previews[qr.id]} alt={qr.name} width={44} height={44} unoptimized />
                          ) : (
                            <div style={{ width: 44, height: 44, background: "var(--card)", animation: "fadeIn 0.6s ease infinite alternate" }} />
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--light)" }}>
                            {String(i + 1).padStart(3, "0")}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(qr.id); }}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: qr.isFavorite ? "var(--yellow)" : "var(--light)",
                              fontSize: "0.85rem",
                              lineHeight: 1,
                              padding: 0,
                            }}
                          >
                            {qr.isFavorite ? "★" : "☆"}
                          </button>
                        </div>
                        <h3 className="font-bold truncate text-sm leading-tight mb-1" style={{ letterSpacing: "-0.01em" }}>
                          {qr.name}
                        </h3>
                        <p className="truncate text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--mid)" }}>
                          {qr.content}
                        </p>
                        <div className="flex gap-1.5 mt-1.5">
                          <span className="badge badge-ink">{qr.type}</span>
                          {qr.isPublic && <span className="badge badge-red">Public</span>}
                          {qr.category && (
                            <span
                              className="badge"
                              style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer" }}
                              onClick={(e) => { e.stopPropagation(); setFilterCategory(qr.category!); }}
                            >
                              {qr.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity qr-actions">
                        <button onClick={() => router.push(`/qrcode/${qr.id}`)} className="btn btn-sm btn-primary">
                          {t("edit")}
                        </button>
                        <button onClick={() => handleDownload(qr)} className="btn btn-sm btn-ghost">
                          {t("export")}
                        </button>
                        <button
                          onClick={() => handleDuplicate(qr.id)}
                          className="btn btn-sm btn-ghost"
                        >
                          {t("copy")}
                        </button>
                        <button
                          onClick={() => handleDelete(qr.id)}
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
                          {t("delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sidebar */}
                <div className="lg:sticky lg:top-16">
                  <div className="side-block">
                    <div className="side-head"><span>{t("sidebar_count")}</span></div>
                    <div className="side-body">
                      <p style={{ fontFamily: "var(--font-display, cursive)", fontSize: "4rem", lineHeight: 1, letterSpacing: "0.02em" }}>
                        {qrCodes.length}
                      </p>
                      <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "var(--mid)" }}>
                        {t("tab_qrcodes")}
                      </p>
                    </div>
                  </div>
                  <div className="side-block">
                    <div className="side-head"><span>{t("sidebar_quick")}</span></div>
                    <div className="side-body flex flex-col gap-2">
                      <button onClick={() => router.push("/qrcode/new")} className="btn btn-red w-full">
                        + {t("new_qr")}
                      </button>
                      {selected.size > 0 && (
                        <button onClick={handleExportZip} disabled={exporting} className="btn btn-primary w-full">
                          {exporting ? "..." : `${t("export_zip")} (${selected.size})`}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="side-block">
                    <div className="side-head"><span>—</span></div>
                    <div className="side-body">
                      {(["url", "text", "wifi", "vcard", "email", "phone", "sms", "whatsapp", "geo", "social"] as const).map((type) => {
                        const count = qrCodes.filter((qr) => qr.type === type).length;
                        const pct = qrCodes.length > 0 ? Math.round((count / qrCodes.length) * 100) : 0;
                        return (
                          <div key={type} className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                            <span className="text-xs font-bold uppercase tracking-wider">{t(`sidebar_${type}` as Parameters<typeof t>[0])}</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--mid)" }}>
                              {count} — {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {uniqueCategories.length > 0 && (
                    <div className="side-block">
                      <div className="side-head"><span>{t("filter_category_label")}</span></div>
                      <div className="side-body flex flex-col gap-1">
                        <button
                          onClick={() => setFilterCategory(null)}
                          style={{
                            background: "none",
                            border: "none",
                            color: filterCategory === null ? "var(--ink)" : "var(--mid)",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            cursor: "pointer",
                            textAlign: "left",
                            padding: "0.3rem 0",
                          }}
                        >
                          {t("filter_category_all")}
                        </button>
                        {uniqueCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setFilterCategory(cat === filterCategory ? null : cat)}
                            style={{
                              background: "none",
                              border: "none",
                              color: filterCategory === cat ? "#10b981" : "var(--mid)",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.7rem",
                              fontWeight: filterCategory === cat ? 700 : 400,
                              cursor: "pointer",
                              textAlign: "left",
                              padding: "0.3rem 0",
                              borderBottom: "1px solid rgba(0,0,0,0.06)",
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ANALYTICS TAB ── */}
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
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--mid)" }}>
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
                      <button onClick={() => router.push(`/qrcode/${selectedQRForAnalytics.id}`)} className="btn btn-secondary">
                        {t("edit")}
                      </button>
                    )}
                  </div>
                </div>
                {selectedQRCodeForAnalytics && <Analytics qrCodeId={selectedQRCodeForAnalytics} />}
              </>
            )}
          </div>
        )}

        {/* ── MAP TAB ── */}
        {activeTab === "map" && (
          <div className="py-4">
            <MapView qrCodes={qrCodes.map((qr) => ({ id: qr.id, name: qr.name, type: qr.type, foregroundColor: qr.foregroundColor }))} />
          </div>
        )}
      </div>

      <style>{`
        .qr-row:hover .qr-actions { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
