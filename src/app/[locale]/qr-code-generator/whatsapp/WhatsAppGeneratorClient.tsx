"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildContent } from "@/lib/qr-formats";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

export const WhatsAppGeneratorClient = () => {
  const t = useTranslations("seo_generator");

  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const content = useMemo(() => {
    if (!phone.trim()) return "";
    return buildContent("whatsapp", { phone: phone.trim(), message });
  }, [phone, message]);

  return (
    <GeneratorForm
      content={content}
      fileName={`whatsapp-${phone.replace(/\D/g, "").slice(0, 10) || "qrcode"}`}
      previewLabel={t("common.preview_label")}
      emptyHint={t("whatsapp.empty_hint")}
      downloadLabels={{
        png: t("common.download_png"),
        svg: t("common.download_svg"),
        pdf: t("common.download_pdf"),
      }}
      formTitle={t("whatsapp.form.title")}
      formSubtitle={t("whatsapp.form.subtitle")}
    >
      <TextField
        id="wa-phone"
        label={t("whatsapp.form.phone")}
        value={phone}
        onChange={setPhone}
        placeholder={t("whatsapp.form.phone_placeholder")}
        required
        autoComplete="tel"
      />
      <TextField
        id="wa-message"
        label={t("whatsapp.form.message")}
        value={message}
        onChange={setMessage}
        placeholder={t("whatsapp.form.message_placeholder")}
        autoComplete="off"
      />
    </GeneratorForm>
  );
};
