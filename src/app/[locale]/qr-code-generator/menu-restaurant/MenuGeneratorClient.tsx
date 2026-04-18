"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

const URL_REGEX = /^https?:\/\/.+/i;

export const MenuGeneratorClient = () => {
  const t = useTranslations("seo_generator");

  const [menuUrl, setMenuUrl] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [touched, setTouched] = useState(false);

  const isValidUrl = URL_REGEX.test(menuUrl.trim());
  const error = touched && menuUrl.length > 0 && !isValidUrl ? t("menu.errors.invalid_url") : undefined;

  const content = useMemo(() => (isValidUrl ? menuUrl.trim() : ""), [menuUrl, isValidUrl]);

  const slugBase = restaurantName.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const fileName = `menu-${slugBase || "restaurant"}`;

  return (
    <GeneratorForm
      content={content}
      fileName={fileName}
      previewLabel={t("common.preview_label")}
      emptyHint={t("menu.empty_hint")}
      downloadLabels={{
        png: t("common.download_png"),
        svg: t("common.download_svg"),
        pdf: t("common.download_pdf"),
      }}
      formTitle={t("menu.form.title")}
      formSubtitle={t("menu.form.subtitle")}
    >
      <TextField
        id="menu-url"
        label={t("menu.form.url")}
        type="url"
        value={menuUrl}
        onChange={(v) => {
          setMenuUrl(v);
          if (!touched) setTouched(true);
        }}
        placeholder="https://mon-resto.fr/menu.pdf"
        hint={t("menu.form.url_hint")}
        error={error}
        required
      />
      <TextField
        id="menu-name"
        label={t("menu.form.name")}
        value={restaurantName}
        onChange={setRestaurantName}
        placeholder={t("menu.form.name_placeholder")}
        hint={t("menu.form.name_hint")}
      />

      <div
        style={{
          marginTop: "0.5rem",
          padding: "0.9rem 1rem",
          border: "2px dashed var(--ink)",
          background: "#f7f3ec",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.63rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--red)",
            marginBottom: "0.3rem",
          }}
        >
          {t("menu.pro_tip.label")}
        </p>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            color: "var(--ink)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {t("menu.pro_tip.body")}
        </p>
      </div>
    </GeneratorForm>
  );
};
