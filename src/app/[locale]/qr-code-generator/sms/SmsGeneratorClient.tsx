"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildContent } from "@/lib/qr-formats";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

export const SmsGeneratorClient = () => {
  const t = useTranslations("seo_generator");

  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const content = useMemo(() => {
    if (!phone.trim()) return "";
    return buildContent("sms", { phone: phone.trim(), message });
  }, [phone, message]);

  return (
    <GeneratorForm
      content={content}
      fileName={`sms-${phone.replace(/\D/g, "").slice(0, 10) || "qrcode"}`}
      previewLabel={t("common.preview_label")}
      emptyHint={t("sms.empty_hint")}
      downloadLabels={{ png: t("common.download_png"), svg: t("common.download_svg"), pdf: t("common.download_pdf") }}
      formTitle={t("sms.form.title")}
      formSubtitle={t("sms.form.subtitle")}
    >
      <TextField id="sms-phone" label={t("sms.form.phone")} value={phone} onChange={setPhone} placeholder={t("sms.form.phone_placeholder")} required autoComplete="tel" />
      <TextField id="sms-message" label={t("sms.form.message")} value={message} onChange={setMessage} placeholder={t("sms.form.message_placeholder")} autoComplete="off" />
    </GeneratorForm>
  );
};
