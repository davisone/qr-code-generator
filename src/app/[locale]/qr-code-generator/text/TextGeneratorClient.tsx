"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildContent } from "@/lib/qr-formats";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

export const TextGeneratorClient = () => {
  const t = useTranslations("seo_generator");
  const [text, setText] = useState("");

  const content = useMemo(() => {
    if (!text.trim()) return "";
    return buildContent("text", { text: text.trim() });
  }, [text]);

  return (
    <GeneratorForm
      content={content}
      fileName="text-qrcode"
      previewLabel={t("common.preview_label")}
      emptyHint={t("text.empty_hint")}
      downloadLabels={{ png: t("common.download_png"), svg: t("common.download_svg"), pdf: t("common.download_pdf") }}
      formTitle={t("text.form.title")}
      formSubtitle={t("text.form.subtitle")}
    >
      <TextField id="text-content" label={t("text.form.text")} value={text} onChange={setText} placeholder={t("text.form.text_placeholder")} required autoComplete="off" />
    </GeneratorForm>
  );
};
