"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { QRCodeItem } from "@/types/qrcode";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSwipe } from "@/hooks/useSwipe";
import { haptic } from "@/lib/haptics";
import { QRCodeActionsSheet, type QRAction } from "@/components/dashboard/QRCodeActionsSheet";

function getDaysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

interface QRCodeCardProps {
  qr: QRCodeItem;
  index: number;
  preview: string;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (qr: QRCodeItem) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (id: string) => void;
  onCategoryFilter: (cat: string) => void;
  onEditContent: (qr: QRCodeItem) => void;
  onHistory: (qr: QRCodeItem) => void;
  onPassword: (qr: QRCodeItem) => void;
  onABTest: (qr: QRCodeItem) => void;
}

export const QRCodeCard = ({
  qr,
  index,
  preview,
  selected,
  onToggleSelect,
  onDelete,
  onDownload,
  onDuplicate,
  onToggleFavorite,
  onEdit,
  onCategoryFilter,
  onEditContent,
  onHistory,
  onPassword,
  onABTest,
}: QRCodeCardProps) => {
  const t = useTranslations("dashboard");
  const tActions = useTranslations("dashboard.actions");
  const tDyn = useTranslations("dashboard.dynamic");
  const expired = isExpired(qr.expiresAt);
  const days = getDaysUntilExpiry(qr.expiresAt);
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Swipe handlers (mobile uniquement)
  const { deltaX, onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeRight: () => {
      if (!isMobile) return;
      haptic.medium();
      onToggleFavorite(qr.id);
    },
    onSwipeLeft: () => {
      if (!isMobile) return;
      haptic.light();
      setSheetOpen(true);
    },
    threshold: 80,
  });

  // Clamp visuel du delta pour éviter des translations excessives
  const clampedDelta = isMobile ? Math.max(-120, Math.min(120, deltaX)) : 0;

  const handleAction = (action: QRAction) => {
    setSheetOpen(false);
    switch (action) {
      case "view":
        onEdit(qr.id);
        break;
      case "edit_content":
        onEditContent(qr);
        break;
      case "history":
        onHistory(qr);
        break;
      case "password":
        onPassword(qr);
        break;
      case "ab_test":
        onABTest(qr);
        break;
      case "favorite":
        haptic.medium();
        onToggleFavorite(qr.id);
        break;
      case "category":
        if (qr.category) onCategoryFilter(qr.category);
        break;
      case "share_public":
        onEdit(qr.id);
        break;
      case "copy_url":
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(qr.content).catch(() => undefined);
        }
        break;
      case "export_png":
      case "export_pdf":
        onDownload(qr);
        break;
      case "delete":
        onDelete(qr.id);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div
        className="qr-row group"
        onTouchStart={isMobile ? onTouchStart : undefined}
        onTouchMove={isMobile ? onTouchMove : undefined}
        onTouchEnd={isMobile ? onTouchEnd : undefined}
        style={{
          animationDelay: `${index * 0.04}s`,
          animation: "rowIn 0.35s ease both",
          borderLeft: selected ? "4px solid var(--red)" : undefined,
          opacity: expired ? 0.45 : 1,
          transform: clampedDelta !== 0 ? `translateX(${clampedDelta * 0.4}px)` : undefined,
          transition: clampedDelta !== 0 ? "none" : "transform 0.2s ease, background 0.15s",
        }}
      >
        {/* Preview + checkbox */}
        <div className="flex flex-col items-center gap-1.5">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(qr.id)}
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
            {preview ? (
              <Image src={preview} alt={qr.name} width={44} height={44} unoptimized />
            ) : (
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "var(--card)",
                  animation: "fadeIn 0.6s ease infinite alternate",
                }}
              />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--light)" }}>
              {String(index + 1).padStart(3, "0")}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(qr.id); }}
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
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            <span className="badge badge-ink">{qr.type}</span>
            {qr.isPublic && <span className="badge badge-red">Public</span>}
            {qr.hasPassword && (
              <span
                className="badge"
                title="Protégé par mot de passe"
                style={{
                  background: "var(--ink)",
                  color: "var(--yellow)",
                  border: "1px solid var(--ink)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.2rem",
                }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <rect x="3" y="11" width="18" height="11" rx="0" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                LOCK
              </span>
            )}
            {qr.splitMode === "ab" && (
              <span
                className="badge"
                title="A/B testing actif"
                style={{
                  background: "var(--yellow)",
                  color: "var(--ink)",
                  border: "1px solid var(--ink)",
                  letterSpacing: "0.1em",
                }}
              >
                A/B
              </span>
            )}
            {qr.category && (
              <span
                className="badge"
                style={{
                  background: "rgba(16,185,129,0.15)",
                  color: "#10b981",
                  border: "1px solid rgba(16,185,129,0.3)",
                  cursor: "pointer",
                }}
                onClick={(e) => { e.stopPropagation(); onCategoryFilter(qr.category!); }}
              >
                {qr.category}
              </span>
            )}
            {expired && (
              <span
                style={{
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  background: "var(--mid)",
                  color: "var(--bg)",
                  padding: "0.15rem 0.4rem",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {t("badge_expired")}
              </span>
            )}
            {!expired && days !== null && days <= 7 && (
              <span
                style={{
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  background: "var(--red)",
                  color: "white",
                  padding: "0.15rem 0.4rem",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {t("badge_expires_soon", { days })}
              </span>
            )}
          </div>
        </div>

        {/* Bouton "more" mobile — affichage uniquement sur mobile */}
        <button
          type="button"
          aria-label={tActions("more")}
          onClick={(e) => {
            e.stopPropagation();
            haptic.light();
            setSheetOpen(true);
          }}
          className="sm:hidden"
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 32,
            height: 32,
            display: "grid",
            placeItems: "center",
            background: "transparent",
            border: "none",
            color: "var(--mid)",
            cursor: "pointer",
            padding: 0,
            zIndex: 2,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="12" cy="19" r="1.8" />
          </svg>
        </button>

        {/* Actions — hover sur desktop uniquement */}
        <div className="hidden sm:flex flex-col gap-1.5 qr-actions sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(qr.id)} className="btn btn-sm btn-primary">
            {t("edit")}
          </button>
          <button
            onClick={() => onEditContent(qr)}
            className="btn btn-sm btn-ghost"
            title={tDyn("edit_content")}
          >
            {tDyn("edit_content")}
          </button>
          <button onClick={() => onDownload(qr)} className="btn btn-sm btn-ghost">
            {t("export")}
          </button>
          <button onClick={() => onDuplicate(qr.id)} className="btn btn-sm btn-ghost">
            {t("copy")}
          </button>
          <button
            onClick={() => onDelete(qr.id)}
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

      {/* Bottom sheet mobile */}
      {isMobile && (
        <QRCodeActionsSheet
          qrCode={qr}
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onAction={handleAction}
        />
      )}
    </>
  );
};
