"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { haptic } from "@/lib/haptics";
import { useProStatus } from "@/hooks/useProStatus";
import type { QRCodeItem } from "@/types/qrcode";

interface ABTestingModalProps {
  qrCode: QRCodeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface VariantRow {
  id?: string;
  label: string;
  content: string;
  weight: number;
}

interface AnalyticsRow {
  id: string;
  label: string;
  scans: number;
  percentage: number;
}

function normalizeWeights(rows: VariantRow[]): VariantRow[] {
  if (rows.length === 0) return rows;
  const n = rows.length;
  const base = Math.floor(100 / n);
  const rest = 100 - base * n;
  return rows.map((r, idx) => ({
    ...r,
    weight: base + (idx < rest ? 1 : 0),
  }));
}

export const ABTestingModal = ({
  qrCode,
  isOpen,
  onClose,
  onSaved,
}: ABTestingModalProps) => {
  const t = useTranslations("dashboard.ab");
  const tDyn = useTranslations("dashboard.dynamic");
  const router = useRouter();
  const { isPro, refresh: refreshPro } = useProStatus();

  const [rows, setRows] = useState<VariantRow[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsRow[] | null>(null);
  const [totalScans, setTotalScans] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadVariants = useCallback(async () => {
    if (!qrCode) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/qrcodes/${qrCode.id}/variants`);
      if (res.ok) {
        const data = (await res.json()) as { variants: VariantRow[] };
        if (data.variants && data.variants.length > 0) {
          setRows(
            data.variants.map((v) => ({
              id: v.id,
              label: v.label,
              content: v.content,
              weight: v.weight,
            }))
          );
        } else {
          setRows([
            { label: "A", content: "", weight: 50 },
            { label: "B", content: "", weight: 50 },
          ]);
        }
      }
      const aRes = await fetch(`/api/qrcodes/${qrCode.id}/variants/analytics`);
      if (aRes.ok) {
        const a = (await aRes.json()) as {
          variants: AnalyticsRow[];
          totalScans: number;
        };
        setAnalytics(a.variants);
        setTotalScans(a.totalScans);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [qrCode]);

  useEffect(() => {
    if (isOpen && qrCode) {
      refreshPro();
      loadVariants();
    }
  }, [isOpen, qrCode, refreshPro, loadVariants]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !qrCode) return null;

  const totalWeight = rows.reduce((sum, r) => sum + Math.round(r.weight || 0), 0);
  const isActive = qrCode.splitMode === "ab";

  const updateRow = (idx: number, patch: Partial<VariantRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    if (rows.length >= 5) return;
    const letter = String.fromCharCode(65 + rows.length);
    const next = [...rows, { label: letter, content: "", weight: 0 }];
    setRows(normalizeWeights(next));
  };

  const removeRow = (idx: number) => {
    if (rows.length <= 2) return;
    const next = rows.filter((_, i) => i !== idx);
    setRows(normalizeWeights(next));
  };

  const handleSave = async () => {
    if (totalWeight !== 100) {
      toast.error(t("total_must_be_100"));
      return;
    }
    for (const r of rows) {
      if (!r.label.trim() || !r.content.trim()) {
        toast.error(tDyn("edit_error"));
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/qrcodes/${qrCode.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variants: rows.map((r) => ({
            label: r.label.trim(),
            content: r.content.trim(),
            weight: Math.round(r.weight),
          })),
        }),
      });
      if (!res.ok) {
        haptic.error();
        toast.error(tDyn("edit_error"));
        return;
      }
      haptic.success();
      toast.success(t("saved"));
      onSaved();
      onClose();
    } catch {
      haptic.error();
      toast.error(tDyn("edit_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/qrcodes/${qrCode.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants: [] }),
      });
      if (!res.ok) {
        haptic.error();
        toast.error(tDyn("edit_error"));
        return;
      }
      haptic.success();
      toast.success(t("disabled"));
      onSaved();
      onClose();
    } catch {
      haptic.error();
      toast.error(tDyn("edit_error"));
    } finally {
      setSaving(false);
    }
  };

  const goPricing = () => {
    router.push("/pricing");
    onClose();
  };

  const maxScan = Math.max(1, ...(analytics?.map((a) => a.scans) ?? [0]));

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        display: "grid",
        placeItems: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }}
      />

      <div
        style={{
          position: "relative",
          width: "min(640px, 100%)",
          maxHeight: "92vh",
          background: "var(--card)",
          border: "2px solid var(--ink)",
          borderRadius: 0,
          boxShadow: "8px 8px 0 var(--ink)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "2px solid var(--ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--yellow)",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display), 'Bebas Neue', cursive",
              fontSize: "1.6rem",
              letterSpacing: "0.05em",
              color: "var(--ink)",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {t("modal_title")}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--ink)",
              fontSize: "1.2rem",
              cursor: "pointer",
              lineHeight: 1,
              padding: "0 0.25rem",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.25rem",
            position: "relative",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--mid)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "0.3rem",
            }}
          >
            {qrCode.name}
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: "var(--ink)",
              lineHeight: 1.5,
              marginBottom: "1rem",
            }}
          >
            {t("modal_subtitle")}
          </p>

          {loading && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--mid)" }}>
              …
            </p>
          )}

          {!loading && (
            <>
              {/* Variants editor */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {rows.map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1.5px solid var(--ink)",
                      padding: "0.75rem",
                      background: "var(--bg)",
                      display: "grid",
                      gap: "0.5rem",
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 0 }}>
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => updateRow(idx, { label: e.target.value.slice(0, 40) })}
                        disabled={!isPro || saving}
                        placeholder={t("variant_label_placeholder")}
                        style={{
                          padding: "0.45rem 0.6rem",
                          background: "var(--card)",
                          border: "1.5px solid var(--ink)",
                          borderRadius: 0,
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--ink)",
                          outline: "none",
                        }}
                      />
                      <input
                        type="url"
                        value={row.content}
                        onChange={(e) => updateRow(idx, { content: e.target.value })}
                        disabled={!isPro || saving}
                        placeholder={t("variant_url_placeholder")}
                        style={{
                          padding: "0.45rem 0.6rem",
                          background: "var(--card)",
                          border: "1.5px solid var(--ink)",
                          borderRadius: 0,
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          color: "var(--ink)",
                          outline: "none",
                        }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "var(--mid)",
                            minWidth: 44,
                          }}
                        >
                          {t("weight")}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={row.weight}
                          onChange={(e) => updateRow(idx, { weight: Number(e.target.value) })}
                          disabled={!isPro || saving}
                          style={{ flex: 1, accentColor: "var(--red)" }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.8rem",
                            color: "var(--ink)",
                            minWidth: 36,
                            textAlign: "right",
                          }}
                        >
                          {Math.round(row.weight)}%
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      disabled={!isPro || saving || rows.length <= 2}
                      title={t("remove_variant")}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: rows.length <= 2 ? "var(--light)" : "var(--red)",
                        cursor: rows.length <= 2 ? "not-allowed" : "pointer",
                        fontSize: "1rem",
                        alignSelf: "start",
                        padding: "0.25rem 0.5rem",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "0.75rem",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={addRow}
                  disabled={!isPro || saving || rows.length >= 5}
                  className="btn btn-ghost"
                  style={{ fontSize: "0.65rem" }}
                >
                  + {t("add_variant")}
                </button>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    color: totalWeight === 100 ? "var(--mid)" : "var(--red)",
                  }}
                >
                  Σ {totalWeight}%
                  {totalWeight !== 100 && ` — ${t("total_must_be_100")}`}
                </span>
              </div>

              {/* Analytics */}
              {analytics && analytics.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <h4
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      letterSpacing: "0.04em",
                      color: "var(--ink)",
                      marginBottom: "0.75rem",
                      lineHeight: 1,
                    }}
                  >
                    {t("analytics_title")}
                  </h4>
                  {totalScans === 0 ? (
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        color: "var(--mid)",
                      }}
                    >
                      {t("no_data_yet")}
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {analytics.map((a) => (
                        <div key={a.id}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "var(--ink)",
                              marginBottom: "0.25rem",
                            }}
                          >
                            <span>{a.label}</span>
                            <span style={{ fontFamily: "var(--font-mono)" }}>
                              {a.scans} · {a.percentage}%
                            </span>
                          </div>
                          <div
                            style={{
                              height: 8,
                              background: "var(--bg)",
                              border: "1px solid var(--ink)",
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${(a.scans / maxScan) * 100}%`,
                                height: "100%",
                                background: "var(--red)",
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Overlay Pro */}
          {!isPro && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(245,240,230,0.94)",
                backdropFilter: "blur(2px)",
                display: "grid",
                placeItems: "center",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  border: "2px solid var(--ink)",
                  background: "var(--yellow)",
                  padding: "1.25rem",
                  maxWidth: 400,
                  textAlign: "center",
                  boxShadow: "6px 6px 0 var(--ink)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display), 'Bebas Neue', cursive",
                    fontSize: "1.6rem",
                    color: "var(--ink)",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                    marginBottom: "0.5rem",
                  }}
                >
                  {tDyn("pro_required_title")}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    color: "var(--ink)",
                    lineHeight: 1.5,
                    marginBottom: "1rem",
                  }}
                >
                  {t("pro_required_body")}
                </p>
                <button
                  type="button"
                  onClick={goPricing}
                  className="btn"
                  style={{
                    background: "var(--ink)",
                    color: "var(--bg)",
                    fontSize: "0.68rem",
                  }}
                >
                  {tDyn("upgrade")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.9rem 1.25rem",
            borderTop: "2px solid var(--ink)",
            display: "flex",
            justifyContent: "space-between",
            gap: "0.75rem",
            background: "var(--bg)",
            flexWrap: "wrap",
          }}
        >
          {isActive ? (
            <button
              type="button"
              onClick={handleDisable}
              disabled={saving}
              className="btn"
              style={{
                background: "none",
                border: "1px solid var(--red)",
                color: "var(--red)",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                padding: "0.45rem 0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: "0.65rem",
              }}
            >
              {t("disable")}
            </button>
          ) : (
            <span />
          )}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={saving}
            >
              ✕
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isPro || saving || totalWeight !== 100}
              className="btn btn-primary"
            >
              {saving ? "…" : t("save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
