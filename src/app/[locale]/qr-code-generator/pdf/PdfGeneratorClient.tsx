"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildContent } from "@/lib/qr-formats";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

export const PdfGeneratorClient = () => {
  const t = useTranslations("seo_generator");

  const [url, setUrl] = useState("");

  const content = useMemo(() => {
    if (!url.trim()) return "";
    return buildContent("url", { url: url.trim() });
  }, [url]);

  return (
    <GeneratorForm
      content={content}
      fileName={`pdf-${url.replace(/https?:\/\//, "").split("/")[0] || "qrcode"}`}
      previewLabel={t("common.preview_label")}
      emptyHint={t("pdf.empty_hint")}
      downloadLabels={{ png: t("common.download_png"), svg: t("common.download_svg"), pdf: t("common.download_pdf") }}
      formTitle={t("pdf.form.title")}
      formSubtitle={t("pdf.form.subtitle")}
    >
      <TextField id="pdf-url" label={t("pdf.form.url")} value={url} onChange={setUrl} placeholder={t("pdf.form.url_placeholder")} required autoComplete="url" />
    </GeneratorForm>
  );
};
