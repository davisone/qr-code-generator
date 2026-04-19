"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildContent } from "@/lib/qr-formats";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

export const PhoneGeneratorClient = () => {
  const t = useTranslations("seo_generator");
  const [phone, setPhone] = useState("");

  const content = useMemo(() => {
    if (!phone.trim()) return "";
    return buildContent("phone", { phone: phone.trim() });
  }, [phone]);

  return (
    <GeneratorForm
      content={content}
      fileName={`phone-${phone.replace(/\D/g, "").slice(0, 10) || "qrcode"}`}
      previewLabel={t("common.preview_label")}
      emptyHint={t("phone.empty_hint")}
      downloadLabels={{ png: t("common.download_png"), svg: t("common.download_svg"), pdf: t("common.download_pdf") }}
      formTitle={t("phone.form.title")}
      formSubtitle={t("phone.form.subtitle")}
    >
      <TextField id="phone-number" label={t("phone.form.phone")} value={phone} onChange={setPhone} placeholder={t("phone.form.phone_placeholder")} required autoComplete="tel" />
    </GeneratorForm>
  );
};
