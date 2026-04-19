"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildContent } from "@/lib/qr-formats";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

/** Convertit une valeur datetime-local en format iCal (YYYYMMDDTHHMMSS) */
const toIcal = (v: string) => v.replace(/[-:]/g, "").replace("T", "T").padEnd(15, "0");

export const EventGeneratorClient = () => {
  const t = useTranslations("seo_generator");

  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const content = useMemo(() => {
    if (!title.trim() || !start) return "";
    return buildContent("event", {
      title: title.trim(),
      start: toIcal(start),
      end: end ? toIcal(end) : toIcal(start),
      location,
      description,
    });
  }, [title, start, end, location, description]);

  return (
    <GeneratorForm
      content={content}
      fileName={`event-${title.trim().toLowerCase().replace(/\s+/g, "-") || "qrcode"}`}
      previewLabel={t("common.preview_label")}
      emptyHint={t("event.empty_hint")}
      downloadLabels={{ png: t("common.download_png"), svg: t("common.download_svg"), pdf: t("common.download_pdf") }}
      formTitle={t("event.form.title")}
      formSubtitle={t("event.form.subtitle")}
    >
      <TextField id="evt-title" label={t("event.form.event_title")} value={title} onChange={setTitle} placeholder={t("event.form.event_title_placeholder")} required autoComplete="off" />
      <TextField id="evt-start" label={t("event.form.start")} type="datetime-local" value={start} onChange={setStart} required autoComplete="off" />
      <TextField id="evt-end" label={t("event.form.end")} type="datetime-local" value={end} onChange={setEnd} autoComplete="off" />
      <TextField id="evt-location" label={t("event.form.location_field")} value={location} onChange={setLocation} placeholder={t("event.form.location_placeholder")} autoComplete="off" />
      <TextField id="evt-desc" label={t("event.form.description")} value={description} onChange={setDescription} placeholder={t("event.form.description_placeholder")} autoComplete="off" />
    </GeneratorForm>
  );
};
