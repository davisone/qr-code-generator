"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { haptic } from "@/lib/haptics";
import type { QRCodeItem } from "@/types/qrcode";

export type QRAction =
  | "view"
  | "favorite"
  | "category"
  | "share_public"
  | "copy_url"
  | "export_png"
  | "export_pdf"
  | "edit_content"
  | "history"
  | "password"
  | "ab_test"
  | "delete";

interface QRCodeActionsSheetProps {
  qrCode: QRCodeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: QRAction) => void;
}

interface ActionButton {
  key: QRAction;
  label: string;
  icon: ReactNode;
  destructive?: boolean;
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const IconView = () => (
  <svg {...iconProps}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconStar = ({ filled = false }: { filled?: boolean }) => (
  <svg {...iconProps} fill={filled ? "currentColor" : "none"}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconTag = () => (
  <svg {...iconProps}>
    <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const IconShare = () => (
  <svg {...iconProps}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const IconCopy = () => (
  <svg {...iconProps}>
    <rect x="9" y="9" width="13" height="13" rx="0" ry="0" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconImage = () => (
  <svg {...iconProps}>
    <rect x="3" y="3" width="18" height="18" rx="0" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconPdf = () => (
  <svg {...iconProps}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);
const IconTrash = () => (
  <svg {...iconProps}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconPencil = () => (
  <svg {...iconProps}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);
const IconClock = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconLock = () => (
  <svg {...iconProps}>
    <rect x="3" y="11" width="18" height="11" rx="0" ry="0" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconSplit = () => (
  <svg {...iconProps}>
    <path d="M6 3v12" />
    <path d="M18 9a6 6 0 0 0-12 0" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="18" r="3" />
  </svg>
);

export const QRCodeActionsSheet = ({
  qrCode,
  isOpen,
  onClose,
  onAction,
}: QRCodeActionsSheetProps) => {
  const t = useTranslations("dashboard.actions");
  const tDyn = useTranslations("dashboard.dynamic");
  const tPwd = useTranslations("dashboard.password");
  const tAb = useTranslations("dashboard.ab");

  const actions: ActionButton[] = qrCode
    ? [
        { key: "view", label: t("view"), icon: <IconView /> },
        { key: "edit_content", label: tDyn("edit_content"), icon: <IconPencil /> },
        { key: "history", label: tDyn("history"), icon: <IconClock /> },
        { key: "password", label: tPwd("action"), icon: <IconLock /> },
        { key: "ab_test", label: tAb("action"), icon: <IconSplit /> },
        {
          key: "favorite",
          label: qrCode.isFavorite ? t("unfavorite") : t("favorite"),
          icon: <IconStar filled={qrCode.isFavorite} />,
        },
        { key: "category", label: t("category"), icon: <IconTag /> },
        { key: "share_public", label: t("share_public"), icon: <IconShare /> },
        { key: "copy_url", label: t("copy_url"), icon: <IconCopy /> },
        { key: "export_png", label: t("export_png"), icon: <IconImage /> },
        { key: "export_pdf", label: t("export_pdf"), icon: <IconPdf /> },
        { key: "delete", label: t("delete"), icon: <IconTrash />, destructive: true },
      ]
    : [];

  const handleClick = (action: QRAction, destructive?: boolean) => {
    if (destructive) haptic.error();
    else haptic.light();
    onAction(action);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={qrCode?.name ?? ""}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {actions.map((a, idx) => (
          <button
            key={a.key}
            onClick={() => handleClick(a.key, a.destructive)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.9rem",
              width: "100%",
              padding: "1rem 1.25rem",
              background: "transparent",
              border: "none",
              borderBottom:
                idx === actions.length - 1 ? "none" : "1px solid rgba(0,0,0,0.08)",
              textAlign: "left",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: a.destructive ? "var(--red)" : "var(--ink)",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                color: a.destructive ? "var(--red)" : "var(--mid)",
                flexShrink: 0,
              }}
            >
              {a.icon}
            </span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
};
