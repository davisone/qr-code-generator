"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useProStatus } from "@/hooks/useProStatus";
import {
  QR_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type QRTemplate,
  type TemplateCategory,
} from "@/lib/qr-templates";
import { renderTemplatePreview } from "@/lib/qr-template-preview";

export default function TemplatesPage() {
  const router = useRouter();
  const t = useTranslations("templates");
  const { isPro, refresh: refreshPro } = useProStatus();

  const [activeCategory, setActiveCategory] = useState<"all" | TemplateCategory>(
    "all",
  );
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    refreshPro();
  }, [refreshPro]);

  // Génération asynchrone des previews au montage (avec emoji overlay)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        QR_TEMPLATES.map(
          async (tpl) => [tpl.id, await renderTemplatePreview(tpl, 360)] as const,
        ),
      );
      if (cancelled) return;
      setPreviews(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === "all") return QR_TEMPLATES;
    return QR_TEMPLATES.filter((tpl) => tpl.category === activeCategory);
  }, [activeCategory]);

  function handleUseTemplate(template: QRTemplate) {
    if (template.isPro && !isPro) {
      router.push("/pricing");
      return;
    }
    router.push(`/qrcode/new?template=${template.id}`);
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero band éditorial — rouge */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8" style={{ background: "var(--red)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "0.8rem",
              }}
            >
              {t("eyebrow")}
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
                fontSize: "clamp(3.5rem, 10vw, 7rem)",
                color: "white",
                letterSpacing: "0.02em",
                lineHeight: 0.95,
                textTransform: "uppercase",
              }}
            >
              {t("title")}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
                color: "rgba(255,255,255,0.9)",
                maxWidth: "44ch",
                marginTop: "1rem",
                lineHeight: 1.45,
              }}
            >
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Filter strip — sticky noir */}
        <div
          className="-mx-4 sm:-mx-6 lg:-mx-8 mb-6 sticky top-0 z-20"
          style={{ background: "var(--ink)" }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center flex-wrap overflow-x-auto">
            {(["all", ...TEMPLATE_CATEGORIES] as const).map((cat) => {
              const isActive = activeCategory === cat;
              const label =
                cat === "all"
                  ? t("filter_all")
                  : t(`category.${cat}` as Parameters<typeof t>[0]);
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    background: "none",
                    border: "none",
                    color: isActive ? "var(--yellow)" : "rgba(240,235,225,0.5)",
                    padding: "0.75rem 1.1rem",
                    fontFamily: "var(--font-sans, sans-serif)",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    borderRight: "1px solid rgba(255,255,255,0.08)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille de templates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 mb-12">
          {filteredTemplates.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              preview={previews[tpl.id] ?? ""}
              isPro={isPro}
              onUse={() => handleUseTemplate(tpl)}
              labelUse={t("use_template")}
              labelUpgrade={t("upgrade_to_use")}
              proBadge={t("pro_badge")}
              categoryLabel={t(`category.${tpl.category}` as Parameters<typeof t>[0])}
              nameLabel={t(`items.${tpl.id}.name` as Parameters<typeof t>[0])}
              descriptionLabel={t(`items.${tpl.id}.description` as Parameters<typeof t>[0])}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Carte template — style brutaliste, shadow hard au hover
// ──────────────────────────────────────────────────────────────────────
interface TemplateCardProps {
  template: QRTemplate;
  preview: string;
  isPro: boolean;
  onUse: () => void;
  labelUse: string;
  labelUpgrade: string;
  proBadge: string;
  categoryLabel: string;
  nameLabel: string;
  descriptionLabel: string;
}

function TemplateCard({
  template,
  preview,
  isPro,
  onUse,
  labelUse,
  labelUpgrade,
  proBadge,
  categoryLabel,
  nameLabel,
  descriptionLabel,
}: TemplateCardProps) {
  const locked = template.isPro && !isPro;

  return (
    <div
      style={{
        background: "var(--card)",
        border: "2px solid var(--ink)",
        marginLeft: "-1px",
        marginTop: "-1px",
        display: "flex",
        flexDirection: "column",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translate(-4px, -4px)";
        e.currentTarget.style.boxShadow = "4px 4px 0 var(--ink)";
        e.currentTarget.style.zIndex = "2";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translate(0, 0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.zIndex = "1";
      }}
    >
      {/* Preview QR */}
      <div
        style={{
          aspectRatio: "1 / 1",
          background: template.defaultStyle.backgroundColor,
          borderBottom: "2px solid var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          position: "relative",
        }}
      >
        {preview ? (
          // next/image gère mal les data: URLs dynamiques sans dimensions connues
          // donc on reste sur une img native — usage très limité (24 images max)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={nameLabel}
            style={{ maxWidth: "100%", height: "auto", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "60%",
              aspectRatio: "1 / 1",
              background: "rgba(0,0,0,0.05)",
            }}
          />
        )}

        {template.isPro && (
          <span
            style={{
              position: "absolute",
              top: "0.6rem",
              right: "0.6rem",
              background: "var(--red)",
              color: "white",
              fontFamily: "var(--font-sans)",
              fontSize: "0.6rem",
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "0.2rem 0.5rem",
              border: "1.5px solid var(--ink)",
            }}
          >
            {proBadge}
          </span>
        )}
      </div>

      {/* Infos */}
      <div style={{ padding: "0.9rem 1rem 0.6rem", flex: 1 }}>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.6rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--mid)",
            marginBottom: "0.35rem",
          }}
        >
          {categoryLabel}
        </p>
        <h3
          style={{
            fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
            fontSize: "1.4rem",
            letterSpacing: "0.03em",
            color: "var(--ink)",
            lineHeight: 1.05,
            marginBottom: "0.4rem",
            textTransform: "uppercase",
          }}
        >
          {nameLabel}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "var(--mid)",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {descriptionLabel}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onUse}
        style={{
          background: locked ? "var(--red)" : "var(--ink)",
          color: locked ? "white" : "var(--bg)",
          border: "none",
          borderTop: "2px solid var(--ink)",
          padding: "0.75rem 1rem",
          fontFamily: "var(--font-sans)",
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {locked ? `${labelUpgrade} →` : `${labelUse} →`}
      </button>
    </div>
  );
}
