"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { useProStatus } from "@/hooks/useProStatus";
import type { QRCodeItem } from "@/types/qrcode";

interface VersionEntry {
  id: string;
  qrCodeId: string;
  content: string;
  type: string;
  metadata: unknown;
  note: string | null;
  createdAt: string;
  createdBy: string | null;
}

interface VersionHistoryModalProps {
  qrCode: QRCodeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRestored: (updated: QRCodeItem) => void;
}

const truncate = (str: string, max = 80): string =>
  str.length > max ? `${str.slice(0, max)}…` : str;

export const VersionHistoryModal = ({
  qrCode,
  isOpen,
  onClose,
  onRestored,
}: VersionHistoryModalProps) => {
  const t = useTranslations("dashboard.dynamic");
  const locale = useLocale();
  const { isPro, refresh: refreshPro } = useProStatus();

  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/qrcodes/${id}/versions`);
      if (res.ok) {
        const data = (await res.json()) as VersionEntry[];
        setVersions(data);
      } else {
        setVersions([]);
      }
    } catch {
      setVersions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && qrCode) {
      load(qrCode.id);
      refreshPro();
      setConfirmingId(null);
    }
  }, [isOpen, qrCode, load, refreshPro]);

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

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleRestore = async (versionId: string) => {
    if (!qrCode) return;
    if (confirmingId !== versionId) {
      setConfirmingId(versionId);
      return;
    }
    setRestoringId(versionId);
    try {
      const res = await fetch(
        `/api/qrcodes/${qrCode.id}/versions/${versionId}/restore`,
        { method: "POST" },
      );
      if (!res.ok) {
        haptic.error();
        toast.error(t("edit_error"));
        return;
      }
      const updated = (await res.json()) as QRCodeItem;
      haptic.success();
      toast.success(t("restore_success"));
      onRestored(updated);
      onClose();
    } catch {
      haptic.error();
      toast.error(t("edit_error"));
    } finally {
      setRestoringId(null);
      setConfirmingId(null);
    }
  };

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
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "min(640px, 100%)",
          maxHeight: "90vh",
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
            background: "var(--ink)",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display), 'Bebas Neue', cursive",
              fontSize: "1.6rem",
              letterSpacing: "0.05em",
              color: "var(--bg)",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {t("modal_history_title")}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--bg)",
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
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--mid)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "1rem",
            }}
          >
            {qrCode.name}
          </p>

          {/* Version courante (toujours affichée en tête) */}
          <div
            style={{
              border: "2px solid var(--ink)",
              background: "var(--yellow)",
              padding: "0.9rem 1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "0.5rem",
                marginBottom: "0.4rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--ink)",
                }}
              >
                {t("current_version")}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "var(--ink)",
                  opacity: 0.65,
                  textTransform: "uppercase",
                }}
              >
                {qrCode.type}
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--ink)",
                wordBreak: "break-all",
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {truncate(qrCode.content)}
            </p>
          </div>

          {loading ? (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--mid)",
                textAlign: "center",
                padding: "1rem",
              }}
            >
              ...
            </p>
          ) : versions.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--mid)",
                textAlign: "center",
                padding: "1.5rem",
                border: "1px dashed var(--mid)",
              }}
            >
              {t("no_history")}
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              {versions.map((v) => {
                const isConfirming = confirmingId === v.id;
                const isRestoring = restoringId === v.id;
                return (
                  <div
                    key={v.id}
                    style={{
                      border: "2px solid var(--ink)",
                      background: "var(--bg)",
                      padding: "0.8rem 1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        marginBottom: "0.35rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "var(--mid)",
                        }}
                      >
                        {dateFormatter.format(new Date(v.createdAt))}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          color: "var(--mid)",
                          textTransform: "uppercase",
                        }}
                      >
                        {v.type}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.74rem",
                        color: "var(--ink)",
                        wordBreak: "break-all",
                        lineHeight: 1.4,
                        margin: 0,
                        marginBottom: v.note ? "0.35rem" : "0.5rem",
                      }}
                    >
                      {truncate(v.content)}
                    </p>
                    {v.note && (
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.72rem",
                          color: "var(--mid)",
                          fontStyle: "italic",
                          margin: 0,
                          marginBottom: "0.5rem",
                        }}
                      >
                        &ldquo;{v.note}&rdquo;
                      </p>
                    )}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => handleRestore(v.id)}
                        disabled={!isPro || isRestoring}
                        className="btn btn-sm"
                        style={{
                          background: isConfirming ? "var(--red)" : "var(--ink)",
                          color: "var(--bg)",
                          fontSize: "0.62rem",
                          opacity: !isPro ? 0.4 : 1,
                          cursor: !isPro ? "not-allowed" : "pointer",
                        }}
                      >
                        {isRestoring
                          ? "..."
                          : isConfirming
                            ? t("confirm_restore")
                            : t("restore")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
