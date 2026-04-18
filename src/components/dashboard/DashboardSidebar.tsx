"use client";

import { useTranslations } from "next-intl";
import type { QRCodeItem } from "@/types/qrcode";

interface DashboardSidebarProps {
  qrCodes: QRCodeItem[];
  selected: Set<string>;
  exporting: boolean;
  filterCategory: string | null;
  uniqueCategories: string[];
  onNewQR: () => void;
  onExportZip: () => void;
  onFilterCategory: (cat: string | null) => void;
}

export const DashboardSidebar = ({
  qrCodes,
  selected,
  exporting,
  filterCategory,
  uniqueCategories,
  onNewQR,
  onExportZip,
  onFilterCategory,
}: DashboardSidebarProps) => {
  const t = useTranslations("dashboard");

  return (
    <>
      {/* Bloc compteur */}
      <div className="side-block">
        <div className="side-head">
          <span>{t("sidebar_count")}</span>
        </div>
        <div className="side-body">
          <p
            style={{
              fontFamily: "var(--font-display, cursive)",
              fontSize: "4rem",
              lineHeight: 1,
              letterSpacing: "0.02em",
            }}
          >
            {qrCodes.length}
          </p>
          <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "var(--mid)" }}>
            {t("tab_qrcodes")}
          </p>
        </div>
      </div>

      {/* Bloc actions rapides */}
      <div className="side-block">
        <div className="side-head">
          <span>{t("sidebar_quick")}</span>
        </div>
        <div className="side-body flex flex-col gap-2">
          <button onClick={onNewQR} className="btn btn-red w-full">
            + {t("new_qr")}
          </button>
          {selected.size > 0 && (
            <button onClick={onExportZip} disabled={exporting} className="btn btn-primary w-full">
              {exporting ? "..." : `${t("export_zip")} (${selected.size})`}
            </button>
          )}
        </div>
      </div>

      {/* Bloc stats par type */}
      <div className="side-block">
        <div className="side-head">
          <span>—</span>
        </div>
        <div className="side-body">
          {(
            ["url", "text", "wifi", "vcard", "email", "phone", "sms", "whatsapp", "geo", "social"] as const
          ).map((type) => {
            const count = qrCodes.filter((qr) => qr.type === type).length;
            const pct = qrCodes.length > 0 ? Math.round((count / qrCodes.length) * 100) : 0;
            return (
              <div
                key={type}
                className="flex justify-between items-center py-2"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
              >
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t(`sidebar_${type}` as Parameters<typeof t>[0])}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--mid)" }}>
                  {count} — {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bloc catégories */}
      {uniqueCategories.length > 0 && (
        <div className="side-block">
          <div className="side-head">
            <span>{t("filter_category_label")}</span>
          </div>
          <div className="side-body flex flex-col gap-1">
            <button
              onClick={() => onFilterCategory(null)}
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
                onClick={() => onFilterCategory(cat === filterCategory ? null : cat)}
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
    </>
  );
};
