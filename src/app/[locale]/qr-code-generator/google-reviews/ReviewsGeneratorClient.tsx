"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

const URL_REGEX = /^https?:\/\/.+/i;

export const ReviewsGeneratorClient = () => {
  const t = useTranslations("seo_generator");

  const [placeId, setPlaceId] = useState("");
  const [reviewLink, setReviewLink] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [helperOpen, setHelperOpen] = useState(false);

  // Priorité : Place ID → construire le lien Google — sinon utiliser le lien fourni
  const content = useMemo(() => {
    const trimmedId = placeId.trim();
    if (trimmedId) {
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(trimmedId)}`;
    }
    const trimmedLink = reviewLink.trim();
    if (trimmedLink && URL_REGEX.test(trimmedLink)) return trimmedLink;
    return "";
  }, [placeId, reviewLink]);

  const slugBase = businessName.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const fileName = `google-reviews-${slugBase || "qrcode"}`;

  return (
    <GeneratorForm
      content={content}
      fileName={fileName}
      previewLabel={t("common.preview_label")}
      emptyHint={t("reviews.empty_hint")}
      downloadLabels={{
        png: t("common.download_png"),
        svg: t("common.download_svg"),
        pdf: t("common.download_pdf"),
      }}
      formTitle={t("reviews.form.title")}
      formSubtitle={t("reviews.form.subtitle")}
    >
      <TextField
        id="reviews-placeid"
        label={t("reviews.form.place_id")}
        value={placeId}
        onChange={setPlaceId}
        placeholder="ChIJ..."
        hint={t("reviews.form.place_id_hint")}
      />

      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            margin: "0.3rem 0",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--light)" }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              color: "var(--mid)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {t("reviews.form.or")}
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--light)" }} />
        </div>
      </div>

      <TextField
        id="reviews-link"
        label={t("reviews.form.link")}
        type="url"
        value={reviewLink}
        onChange={setReviewLink}
        placeholder="https://g.page/r/xxx/review"
        hint={t("reviews.form.link_hint")}
      />

      <TextField
        id="reviews-name"
        label={t("reviews.form.business")}
        value={businessName}
        onChange={setBusinessName}
        placeholder={t("reviews.form.business_placeholder")}
      />

      <button
        type="button"
        onClick={() => setHelperOpen((v) => !v)}
        aria-expanded={helperOpen}
        style={{
          background: "none",
          border: "2px solid var(--ink)",
          padding: "0.7rem 0.9rem",
          textAlign: "left",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--ink)",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{t("reviews.helper.title")}</span>
        <span
          aria-hidden
          style={{
            transform: helperOpen ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            fontFamily: "var(--font-display)",
            color: "var(--red)",
            fontSize: "1.3rem",
            lineHeight: 1,
          }}
        >
          +
        </span>
      </button>

      {helperOpen && (
        <div
          style={{
            padding: "1rem",
            border: "var(--rule-thin)",
            background: "#f7f3ec",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            color: "var(--ink)",
            lineHeight: 1.6,
          }}
        >
          <ol style={{ paddingLeft: "1.2rem", margin: 0, display: "grid", gap: "0.35rem" }}>
            <li>{t("reviews.helper.step1")}</li>
            <li>{t("reviews.helper.step2")}</li>
            <li>{t("reviews.helper.step3")}</li>
            <li>{t("reviews.helper.step4")}</li>
          </ol>
          <a
            href="https://developers.google.com/maps/documentation/places/web-service/place-id"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "0.8rem",
              color: "var(--red)",
              fontWeight: 700,
              fontSize: "0.78rem",
              textDecoration: "underline",
            }}
          >
            {t("reviews.helper.open_tool")} →
          </a>
        </div>
      )}
    </GeneratorForm>
  );
};
