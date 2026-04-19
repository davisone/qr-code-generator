"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildContent } from "@/lib/qr-formats";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

export const LocationGeneratorClient = () => {
  const t = useTranslations("seo_generator");

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [label, setLabel] = useState("");

  const content = useMemo(() => {
    if (!lat.trim() || !lng.trim()) return "";
    return buildContent("geo", { lat: lat.trim(), lng: lng.trim(), label });
  }, [lat, lng, label]);

  return (
    <GeneratorForm
      content={content}
      fileName={`location-${label.toLowerCase().replace(/\s+/g, "-") || "qrcode"}`}
      previewLabel={t("common.preview_label")}
      emptyHint={t("location.empty_hint")}
      downloadLabels={{ png: t("common.download_png"), svg: t("common.download_svg"), pdf: t("common.download_pdf") }}
      formTitle={t("location.form.title")}
      formSubtitle={t("location.form.subtitle")}
    >
      <TextField id="loc-lat" label={t("location.form.lat")} value={lat} onChange={setLat} placeholder={t("location.form.lat_placeholder")} required autoComplete="off" />
      <TextField id="loc-lng" label={t("location.form.lng")} value={lng} onChange={setLng} placeholder={t("location.form.lng_placeholder")} required autoComplete="off" />
      <TextField id="loc-label" label={t("location.form.label")} value={label} onChange={setLabel} placeholder={t("location.form.label_placeholder")} autoComplete="off" />
    </GeneratorForm>
  );
};
