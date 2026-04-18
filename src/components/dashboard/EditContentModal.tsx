"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { haptic } from "@/lib/haptics";
import { useProStatus } from "@/hooks/useProStatus";
import type { QRCodeItem } from "@/types/qrcode";

interface EditContentModalProps {
  qrCode: QRCodeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: QRCodeItem) => void;
}

const SIMPLE_TYPES = new Set(["url", "text"]);

export const EditContentModal = ({
  qrCode,
  isOpen,
  onClose,
  onSaved,
}: EditContentModalProps) => {
  const t = useTranslations("dashboard.dynamic");
  const router = useRouter();
  const { isPro, refresh: refreshPro } = useProStatus();

  const [content, setContent] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && qrCode) {
      setContent(qrCode.content);
      setNote("");
      refreshPro();
    }
  }, [isOpen, qrCode, refreshPro]);

  // Fermeture via escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !qrCode) return null;

  const isSimple = SIMPLE_TYPES.has(qrCode.type);

  const handleSave = async () => {
    if (!qrCode || !isSimple) return;
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error(t("edit_error"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/qrcodes/${qrCode.id}/content`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          type: qrCode.type,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        haptic.error();
        toast.error(t("edit_error"));
        return;
      }
      const updated = (await res.json()) as QRCodeItem;
      haptic.success();
      toast.success(t("edit_success"));
      onSaved(updated);
      onClose();
    } catch {
      haptic.error();
      toast.error(t("edit_error"));
    } finally {
      setSaving(false);
    }
  };

  const openFullEditor = () => {
    router.push(`/qrcode/${qrCode.id}`);
    onClose();
  };

  const goPricing = () => {
    router.push("/pricing");
    onClose();
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
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
        }}
      />

      {/* Dialog */}
      <div
        style={{
          position: "relative",
          width: "min(560px, 100%)",
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
            background: "var(--red)",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display), 'Bebas Neue', cursive",
              fontSize: "1.6rem",
              letterSpacing: "0.05em",
              color: "white",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {t("modal_edit_title")}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
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
          {/* QR name */}
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--mid)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "0.5rem",
            }}
          >
            {qrCode.name}
          </p>

          {isSimple ? (
            <>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--mid)",
                  marginBottom: "0.4rem",
                }}
              >
                {qrCode.type === "url" ? "URL" : "Text"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={qrCode.type === "url" ? 2 : 5}
                disabled={!isPro || saving}
                style={{
                  width: "100%",
                  padding: "0.7rem 0.9rem",
                  background: "var(--bg)",
                  border: "2px solid var(--ink)",
                  borderRadius: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: "var(--ink)",
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.4,
                }}
              />

              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--mid)",
                  marginTop: "1rem",
                  marginBottom: "0.4rem",
                }}
              >
                {t("note_placeholder")}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 64))}
                maxLength={64}
                disabled={!isPro || saving}
                placeholder={t("note_placeholder")}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.9rem",
                  background: "var(--bg)",
                  border: "2px solid var(--ink)",
                  borderRadius: 0,
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </>
          ) : (
            <div
              style={{
                border: "2px dashed var(--ink)",
                padding: "1.25rem",
                background: "var(--bg)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--ink)",
                  marginBottom: "0.75rem",
                  lineHeight: 1.5,
                }}
              >
                {t("advanced_edit")}
              </p>
              <button
                type="button"
                onClick={openFullEditor}
                className="btn btn-primary"
              >
                {t("open_editor")}
              </button>
            </div>
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
                  {t("pro_required_title")}
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
                  {t("upgrade")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isSimple && (
          <div
            style={{
              padding: "0.9rem 1.25rem",
              borderTop: "2px solid var(--ink)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              background: "var(--bg)",
            }}
          >
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
              disabled={!isPro || saving || !content.trim()}
              className="btn btn-primary"
            >
              {saving ? "..." : t("save")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
