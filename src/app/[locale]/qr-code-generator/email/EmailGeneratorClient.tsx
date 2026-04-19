"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildContent } from "@/lib/qr-formats";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

export const EmailGeneratorClient = () => {
  const t = useTranslations("seo_generator");

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const content = useMemo(() => {
    if (!to.trim()) return "";
    return buildContent("email", { to: to.trim(), subject, body });
  }, [to, subject, body]);

  return (
    <GeneratorForm
      content={content}
      fileName={`email-${to.split("@")[0] || "qrcode"}`}
      previewLabel={t("common.preview_label")}
      emptyHint={t("email.empty_hint")}
      downloadLabels={{ png: t("common.download_png"), svg: t("common.download_svg"), pdf: t("common.download_pdf") }}
      formTitle={t("email.form.title")}
      formSubtitle={t("email.form.subtitle")}
    >
      <TextField id="email-to" label={t("email.form.to")} value={to} onChange={setTo} placeholder={t("email.form.to_placeholder")} required autoComplete="email" />
      <TextField id="email-subject" label={t("email.form.subject")} value={subject} onChange={setSubject} placeholder={t("email.form.subject_placeholder")} autoComplete="off" />
      <TextField id="email-body" label={t("email.form.body")} value={body} onChange={setBody} placeholder={t("email.form.body_placeholder")} autoComplete="off" />
    </GeneratorForm>
  );
};
