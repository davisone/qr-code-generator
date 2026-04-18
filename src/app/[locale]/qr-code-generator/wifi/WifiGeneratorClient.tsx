"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildContent } from "@/lib/qr-formats";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField, SelectField, CheckboxField } from "@/components/seo-generator/FormField";

export const WifiGeneratorClient = () => {
  const t = useTranslations("seo_generator");

  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [hidden, setHidden] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!ssid.trim()) e.ssid = t("errors.required");
    if (security !== "nopass" && !password) e.password = t("errors.required");
    return e;
  }, [ssid, password, security, t]);

  const content = useMemo(() => {
    if (!ssid.trim()) return "";
    const sec = security === "nopass" ? "nopass" : security;
    const pwd = security === "nopass" ? "" : password;
    const hiddenSuffix = hidden ? "H:true;" : "";
    const base = buildContent("wifi", {
      ssid: ssid.trim(),
      password: pwd,
      security: sec,
    });
    // Append hidden flag before final semicolon if requested
    return hiddenSuffix ? base.replace(/;$/, `${hiddenSuffix};`) : base;
  }, [ssid, password, security, hidden]);

  const securityOptions = [
    { value: "WPA", label: "WPA / WPA2" },
    { value: "WEP", label: "WEP" },
    { value: "nopass", label: t("wifi.form.security_open") },
  ];

  return (
    <GeneratorForm
      content={content}
      fileName={`wifi-${ssid.trim().toLowerCase().replace(/\s+/g, "-") || "qrcode"}`}
      previewLabel={t("common.preview_label")}
      emptyHint={t("wifi.empty_hint")}
      downloadLabels={{
        png: t("common.download_png"),
        svg: t("common.download_svg"),
        pdf: t("common.download_pdf"),
      }}
      formTitle={t("wifi.form.title")}
      formSubtitle={t("wifi.form.subtitle")}
    >
      <TextField
        id="wifi-ssid"
        label={t("wifi.form.ssid")}
        value={ssid}
        onChange={setSsid}
        placeholder={t("wifi.form.ssid_placeholder")}
        required
        error={errors.ssid && ssid.length > 0 ? undefined : undefined}
        autoComplete="off"
      />
      <SelectField
        id="wifi-security"
        label={t("wifi.form.security")}
        value={security}
        onChange={(v) => setSecurity(v as "WPA" | "WEP" | "nopass")}
        options={securityOptions}
      />
      {security !== "nopass" && (
        <TextField
          id="wifi-password"
          label={t("wifi.form.password")}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={t("wifi.form.password_placeholder")}
          required
          autoComplete="off"
        />
      )}
      <CheckboxField
        id="wifi-hidden"
        label={t("wifi.form.hidden")}
        description={t("wifi.form.hidden_desc")}
        checked={hidden}
        onChange={setHidden}
      />
    </GeneratorForm>
  );
};
