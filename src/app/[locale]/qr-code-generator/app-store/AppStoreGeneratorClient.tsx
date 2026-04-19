"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildContent } from "@/lib/qr-formats";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

export const AppStoreGeneratorClient = () => {
  const t = useTranslations("seo_generator");
  const [url, setUrl] = useState("");

  const content = useMemo(() => {
    if (!url.trim()) return "";
    return buildContent("url", { url: url.trim() });
  }, [url]);

  return (
    <GeneratorForm
      content={content}
      fileName={`app-download-${url.includes("apple") ? "ios" : "android"}`}
      previewLabel={t("common.preview_label")}
      emptyHint={t("app_store.empty_hint")}
      downloadLabels={{ png: t("common.download_png"), svg: t("common.download_svg"), pdf: t("common.download_pdf") }}
      formTitle={t("app_store.form.title")}
      formSubtitle={t("app_store.form.subtitle")}
    >
      <TextField id="app-url" label={t("app_store.form.url")} value={url} onChange={setUrl} placeholder={t("app_store.form.url_placeholder")} required autoComplete="url" />
    </GeneratorForm>
  );
};
