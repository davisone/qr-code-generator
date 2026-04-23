"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { GeneratorForm } from "@/components/seo-generator/GeneratorForm";
import { TextField } from "@/components/seo-generator/FormField";

export const VCardGeneratorClient = () => {
  const t = useTranslations("seo_generator");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [org, setOrg] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [address, setAddress] = useState("");

  const content = useMemo(() => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName) return "";
    const escape = (s: string) => s.replace(/\n/g, " ").replace(/,/g, "\\,");
    const lines = ["BEGIN:VCARD", "VERSION:3.0"];
    lines.push(`N:${escape(lastName)};${escape(firstName)};;;`);
    lines.push(`FN:${escape(fullName)}`);
    if (org) lines.push(`ORG:${escape(org)}`);
    if (title) lines.push(`TITLE:${escape(title)}`);
    if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
    if (email) lines.push(`EMAIL:${email}`);
    if (url) lines.push(`URL:${url}`);
    if (address) lines.push(`ADR:;;${escape(address)};;;;`);
    lines.push("END:VCARD");
    return lines.join("\n");
  }, [firstName, lastName, org, title, phone, email, url, address]);

  const slug = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "vcard";

  return (
    <GeneratorForm
      content={content}
      fileName={slug}
      previewLabel={t("common.preview_label")}
      emptyHint={t("vcard.empty_hint")}
      downloadLabels={{
        png: t("common.download_png"),
        svg: t("common.download_svg"),
        pdf: t("common.download_pdf"),
      }}
      formTitle={t("vcard.form.title")}
      formSubtitle={t("vcard.form.subtitle")}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <TextField
          id="vcard-firstname"
          label={t("vcard.form.firstname")}
          value={firstName}
          onChange={setFirstName}
          placeholder="Marie"
          required
          autoComplete="given-name"
        />
        <TextField
          id="vcard-lastname"
          label={t("vcard.form.lastname")}
          value={lastName}
          onChange={setLastName}
          placeholder="Dupont"
          required
          autoComplete="family-name"
        />
      </div>
      <TextField
        id="vcard-org"
        label={t("vcard.form.org")}
        value={org}
        onChange={setOrg}
        placeholder="useqraft"
        autoComplete="organization"
      />
      <TextField
        id="vcard-title"
        label={t("vcard.form.job_title")}
        value={title}
        onChange={setTitle}
        placeholder={t("vcard.form.job_title_placeholder")}
        autoComplete="organization-title"
      />
      <TextField
        id="vcard-phone"
        label={t("vcard.form.phone")}
        type="tel"
        value={phone}
        onChange={setPhone}
        placeholder="+33 6 12 34 56 78"
        autoComplete="tel"
      />
      <TextField
        id="vcard-email"
        label={t("vcard.form.email")}
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="marie@example.com"
        autoComplete="email"
      />
      <TextField
        id="vcard-url"
        label={t("vcard.form.url")}
        type="url"
        value={url}
        onChange={setUrl}
        placeholder="https://example.com"
        autoComplete="url"
      />
      <TextField
        id="vcard-address"
        label={t("vcard.form.address")}
        value={address}
        onChange={setAddress}
        placeholder={t("vcard.form.address_placeholder")}
        autoComplete="street-address"
      />
    </GeneratorForm>
  );
};
