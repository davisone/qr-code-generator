"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildContent } from "@/lib/qr-formats";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

export const SocialMediaGeneratorClient = () => {
  const t = useTranslations("seo_generator");

  const [url, setUrl] = useState("");

  const content = useMemo(() => {
    if (!url.trim()) return "";
    return buildContent("social", { url: url.trim() });
  }, [url]);

  return (
    <GeneratorForm
      content={content}
      fileName={`social-${url.replace(/https?:\/\/(www\.)?/, "").split("/")[0] || "qrcode"}`}
      previewLabel={t("common.preview_label")}
      emptyHint={t("social_media.empty_hint")}
      downloadLabels={{ png: t("common.download_png"), svg: t("common.download_svg"), pdf: t("common.download_pdf") }}
      formTitle={t("social_media.form.title")}
      formSubtitle={t("social_media.form.subtitle")}
    >
      <TextField id="social-url" label={t("social_media.form.url")} value={url} onChange={setUrl} placeholder={t("social_media.form.url_placeholder")} required autoComplete="url" />
    </GeneratorForm>
  );
};
