"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { haptic } from "@/lib/haptics";
import { useProStatus } from "@/hooks/useProStatus";
import type { QRCodeItem } from "@/types/qrcode";

interface PasswordProtectModalProps {
  qrCode: QRCodeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const PasswordProtectModal = ({
  qrCode,
  isOpen,
  onClose,
  onSaved,
}: PasswordProtectModalProps) => {
  const t = useTranslations("dashboard.password");
  const tDyn = useTranslations("dashboard.dynamic");
  const router = useRouter();
  const { isPro, refresh: refreshPro } = useProStatus();

  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      refreshPro();
    }
  }, [isOpen, refreshPro]);

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

  const hasPassword = qrCode.hasPassword;

  const handleEnable = async () => {
    if (!qrCode) return;
    if (password.length < 4) {
      toast.error(t("wrong_password"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/qrcodes/${qrCode.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        haptic.error();
        toast.error(tDyn("edit_error"));
        return;
      }
      haptic.success();
      toast.success(t("enabled"));
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
    if (!qrCode) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/qrcodes/${qrCode.id}/password`, {
        method: "DELETE",
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
          width: "min(520px, 100%)",
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
            {t("modal_title")}
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
              marginBottom: "0.5rem",
            }}
          >
            {qrCode.name}
          </p>

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--ink)",
              lineHeight: 1.5,
              marginBottom: "1.25rem",
            }}
          >
            {t("modal_subtitle")}
          </p>

          {hasPassword ? (
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
                  lineHeight: 1.5,
                  marginBottom: "1rem",
                  fontWeight: 700,
                }}
              >
                {t("current_protected")}
              </p>
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
                  padding: "0.5rem 1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "0.7rem",
                }}
              >
                {saving ? "…" : t("disable")}
              </button>
            </div>
          ) : (
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
                {t("modal_title")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!isPro || saving}
                placeholder={t("placeholder")}
                minLength={4}
                style={{
                  width: "100%",
                  padding: "0.7rem 0.9rem",
                  background: "var(--bg)",
                  border: "2px solid var(--ink)",
                  borderRadius: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "var(--ink)",
                  outline: "none",
                  letterSpacing: "0.1em",
                }}
              />
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

        {/* Footer — visible uniquement si !hasPassword */}
        {!hasPassword && (
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
              onClick={handleEnable}
              disabled={!isPro || saving || password.length < 4}
              className="btn btn-primary"
            >
              {saving ? "…" : t("enable")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
