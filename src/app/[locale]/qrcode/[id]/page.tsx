"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import NextImage from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { styleTemplates } from "@/lib/templates";
import { generateQRCanvas } from "@/lib/qr-utils";
import { QRType, QR_TYPE_LIST, buildContent } from "@/lib/qr-formats";
import { QRTypeIcon } from "@/components/ui/QRTypeIcon";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const ERROR_LEVELS = [
  { value: "L", label: "L — 7%" },
  { value: "M", label: "M — 15%" },
  { value: "Q", label: "Q — 25%" },
  { value: "H", label: "H — 30%" },
] as const;

const SIZES = [256, 512, 1024] as const;

const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "x",         label: "X / Twitter" },
  { value: "linkedin",  label: "LinkedIn" },
  { value: "tiktok",    label: "TikTok" },
  { value: "youtube",   label: "YouTube" },
  { value: "facebook",  label: "Facebook" },
  { value: "snapchat",  label: "Snapchat" },
];

export default function QRCodeEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("qrcode");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const isNew = params.id === "new";

  const [name, setName] = useState("");
  const [type, setType] = useState<QRType>("url");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [size, setSize] = useState<256 | 512 | 1024>(512);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(!isNew);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCode, setQrCode] = useState<{ expiresAt: string | null } | null>(null);
  const [isPro, setIsPro] = useState<boolean | null>(null);

  // Content is derived from fields — not state
  const content = buildContent(type, fields);
  // For URL QR codes with public sharing enabled, exports encode the redirect URL for analytics tracking
  const exportContent =
    isPublic && shareToken && type === "url" && content.trim()
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/r/${shareToken}`
      : content.trim() || "https://example.com";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!isNew && status === "authenticated") {
      fetch(`/api/qrcodes/${params.id}`)
        .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
        .then((data) => {
          setName(data.name);
          setType(data.type as QRType);
          if (data.metadata && typeof data.metadata === "object") {
            setFields(data.metadata as Record<string, string>);
          } else if (data.type === "url") {
            setFields({ url: data.content });
          } else if (data.type === "text") {
            setFields({ text: data.content });
          }
          setForegroundColor(data.foregroundColor);
          setBackgroundColor(data.backgroundColor);
          setSize(data.size);
          setErrorCorrection(data.errorCorrection);
          setLogoDataUrl(data.logoDataUrl || null);
          setIsPublic(data.isPublic || false);
          setShareToken(data.shareToken || null);
          setCategory(data.category || "");
          setQrCode({ expiresAt: data.expiresAt || null });
        })
        .catch(() => router.push("/dashboard"))
        .finally(() => setLoadingData(false));
    }
  }, [isNew, status, params.id, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/subscription")
        .then((r) => r.json())
        .then((d: { isPro?: boolean }) => setIsPro(d.isPro ?? false))
        .catch(() => setIsPro(false));
    }
  }, [status]);

  function updateField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function handleTypeChange(newType: QRType) {
    setType(newType);
    setFields({});
    setErrors({});
  }

  const generateQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const text = exportContent;
    try {
      await QRCode.toCanvas(canvas, text, {
        width: 280,
        margin: 2,
        color: { dark: foregroundColor, light: backgroundColor },
        errorCorrectionLevel: errorCorrection,
      });
      if (logoDataUrl) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            const logoSize = Math.floor(canvas.width * 0.2);
            const padding = Math.floor(logoSize * 0.1);
            const totalSize = logoSize + padding * 2;
            const x = (canvas.width - totalSize) / 2;
            const y = (canvas.height - totalSize) / 2;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.roundRect(x, y, totalSize, totalSize, 8);
            ctx.fill();
            ctx.drawImage(img, x + padding, y + padding, logoSize, logoSize);
          };
          img.src = logoDataUrl;
        }
      }
    } catch {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#e8e2d6";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#6b5f52";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("—", canvas.width / 2, canvas.height / 2);
      }
    }
  }, [exportContent, foregroundColor, backgroundColor, errorCorrection, logoDataUrl]);

  useEffect(() => { generateQR(); }, [generateQR]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "!";

    switch (type) {
      case "url":
        if (!fields.url?.trim()) { newErrors.url = "!"; break; }
        try { new URL(fields.url.trim()); } catch { newErrors.url = "URL"; }
        break;
      case "text":
        if (!fields.text?.trim()) newErrors.text = "!";
        break;
      case "wifi":
        if (!fields.ssid?.trim()) newErrors.ssid = "!";
        break;
      case "vcard":
        if (!fields.fullname?.trim()) newErrors.fullname = "!";
        break;
      case "email":
        if (!fields.to?.trim()) { newErrors.to = "!"; break; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.to.trim())) {
          newErrors.to = "Email";
        }
        break;
      case "phone":
        if (!fields.phone?.trim()) newErrors.phone = "!";
        break;
      case "sms":
        if (!fields.phone?.trim()) newErrors.phone = "!";
        break;
      case "whatsapp":
        if (!fields.phone?.trim()) newErrors.phone = "!";
        break;
      case "geo":
        if (!fields.lat?.trim()) newErrors.lat = "!";
        if (!fields.lng?.trim()) newErrors.lng = "!";
        break;
      case "social":
        if (!fields.url?.trim()) newErrors.url = "!";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const body = {
      name: name.trim(),
      type,
      content: content.trim(),
      metadata: fields,
      category: category.trim() || null,
      foregroundColor,
      backgroundColor,
      size,
      errorCorrection,
      logoDataUrl,
      isPublic,
    };
    try {
      let res: Response;
      if (isNew) {
        res = await fetch("/api/qrcodes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        res = await fetch(`/api/qrcodes/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Error"); }
      const data = await res.json();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (isNew) router.replace(`/qrcode/${data.id}`);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  async function getHighQualityDataURL(format: "png" | "jpeg"): Promise<string> {
    const canvas = await generateQRCanvas({ content: exportContent, size, foregroundColor, backgroundColor, errorCorrection, logoDataUrl });
    return canvas.toDataURL(format === "jpeg" ? "image/jpeg" : "image/png", 1.0);
  }

  async function handleExportPNG() {
    try { const d = await getHighQualityDataURL("png"); downloadFile(d, `${name || "qrcode"}.png`); }
    catch { /* silently fail */ }
  }

  async function handleExportJPG() {
    try { const d = await getHighQualityDataURL("jpeg"); downloadFile(d, `${name || "qrcode"}.jpg`); }
    catch { /* silently fail */ }
  }

  async function handleExportPDF() {
    try {
      const dataUrl = await getHighQualityDataURL("png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgSizeMm = Math.min(pdfWidth - 40, 120);
      const x = (pdfWidth - imgSizeMm) / 2;
      const y = 30;
      pdf.setFontSize(18);
      pdf.text(name || "QR Code", pdfWidth / 2, 20, { align: "center" });
      pdf.addImage(dataUrl, "PNG", x, y, imgSizeMm, imgSizeMm);
      pdf.setFontSize(10);
      pdf.setTextColor(128);
      pdf.text(content.trim(), pdfWidth / 2, y + imgSizeMm + 10, { align: "center" });
      pdf.save(`${name || "qrcode"}.pdf`);
    } catch { /* silently fail */ }
  }

  function downloadFile(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleToggleShare() {
    if (isNew) {
      setIsPublic((prev) => !prev);
      return;
    }
    try {
      const res = await fetch(`/api/qrcodes/${params.id}/share`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsPublic(data.isPublic);
      setShareToken(data.shareToken);
    } catch { /* silently fail */ }
  }

  function handleCopyShareLink() {
    if (!shareToken) return;
    navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  if (status === "loading" || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div style={{ fontFamily: "var(--font-display, cursive)", fontSize: "2rem", color: "var(--mid)", letterSpacing: "0.06em" }}>
          ...
        </div>
      </div>
    );
  }

  if (!session) return null;

  const sectionStyle = { borderBottom: "var(--rule)" };
  const sectionPad = { padding: "1.25rem 1.5rem" };
  const labelStyle = { fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "var(--mid)", display: "block", marginBottom: "0.5rem" };
  const headingStyle = { fontFamily: "var(--font-display, cursive)", fontSize: "1.1rem", letterSpacing: "0.06em", borderBottom: "var(--rule-thin)", paddingBottom: "0.5rem", marginBottom: "1rem" };
  const inputError = (key: string) => errors[key] ? { borderColor: "var(--red)" } : {};

  const inp = (key: string, placeholder: string, type_attr: string = "text", required = false) => (
    <input
      type={type_attr}
      value={fields[key] || ""}
      onChange={(e) => updateField(key, e.target.value)}
      className="input w-full"
      placeholder={placeholder}
      style={inputError(key)}
      required={required}
    />
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bandeau expiration plan gratuit */}
        {isPro === false && qrCode?.expiresAt && (
          <div style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            padding: "0.75rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--red)", margin: 0 }}>
              {t("expiry_warning", { date: new Date(qrCode.expiresAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) })}
            </p>
            <a
              href="/pricing"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                background: "var(--red)",
                color: "white",
                padding: "0.4rem 1rem",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {t("expiry_cta")}
            </a>
          </div>
        )}

        {/* Header band */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8" style={{ background: "var(--red)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 py-3">
            <button
              onClick={() => router.push("/dashboard")}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", padding: "0.3rem 0.7rem", cursor: "pointer", fontSize: "1rem" }}
            >
              ←
            </button>
            <h1 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "white", letterSpacing: "0.04em", lineHeight: 1 }}>
              QRaft
            </h1>
            <div className="ml-auto flex gap-2">
              <button onClick={handleSave} disabled={saving} className="btn" style={{ background: "var(--ink)", color: "var(--bg)" }}>
                {saving ? t("saving") : saved ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> : t("save")}
              </button>
              <button onClick={() => router.push("/dashboard")} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "0.5rem 1rem", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {t("return_dashboard")}
              </button>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2" style={{ border: "var(--rule)", borderTop: "none" }}>

          {/* LEFT */}
          <div style={{ borderRight: "2px solid #1a1410" }}>
            {/* Info */}
            <div style={{ ...sectionStyle, ...sectionPad }}>
              <h2 style={headingStyle}>{t("info_title")}</h2>
              <div className="space-y-4">
                {/* Nom */}
                <div>
                  <label style={labelStyle}>{t("name_label")}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                    className="input w-full"
                    placeholder={t("name_placeholder")}
                    style={errors.name ? { borderColor: "var(--red)" } : {}}
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "var(--mid)", fontFamily: "var(--font-sans)" }}
                  >
                    {t("category_label")}
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={t("category_placeholder")}
                    className="input w-full"
                    maxLength={50}
                  />
                </div>

                {/* Type selector — grille 5×2 */}
                <div>
                  <label style={labelStyle}>{t("type_label")}</label>
                  <div className="grid grid-cols-5 gap-1">
                    {QR_TYPE_LIST.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => handleTypeChange(item.type)}
                        style={{
                          padding: "0.5rem 0.25rem",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          background: type === item.type ? "var(--ink)" : "var(--card)",
                          color: type === item.type ? "var(--bg)" : "var(--mid)",
                          border: "var(--rule-thin)",
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.2rem",
                        }}
                      >
                        <QRTypeIcon type={item.type} size={16} />
                        <span>{t(item.labelKey as Parameters<typeof t>[0])}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formulaires conditionnels par type */}
                <div className="space-y-3">

                  {/* URL */}
                  {type === "url" && (
                    <div>
                      <label style={labelStyle}>{t("content_label_url")}</label>
                      <input
                        type="url"
                        value={fields.url || ""}
                        onChange={(e) => updateField("url", e.target.value)}
                        className="input w-full"
                        placeholder={t("content_placeholder_url")}
                        style={inputError("url")}
                      />
                    </div>
                  )}

                  {/* Texte */}
                  {type === "text" && (
                    <div>
                      <label style={labelStyle}>{t("content_label_text")}</label>
                      <textarea
                        value={fields.text || ""}
                        onChange={(e) => updateField("text", e.target.value)}
                        rows={3}
                        className="input w-full resize-none"
                        placeholder={t("content_placeholder_text")}
                        style={inputError("text")}
                      />
                    </div>
                  )}

                  {/* WiFi */}
                  {type === "wifi" && (
                    <>
                      <div>
                        <label style={labelStyle}>{t("wifi_ssid")}</label>
                        {inp("ssid", "MonReseau", "text", true)}
                      </div>
                      <div>
                        <label style={labelStyle}>{t("wifi_security")}</label>
                        <select value={fields.security || "WPA"} onChange={(e) => updateField("security", e.target.value)} className="input w-full">
                          <option value="WPA">WPA/WPA2</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">{t("wifi_no_password")}</option>
                        </select>
                      </div>
                      {fields.security !== "nopass" && (
                        <div>
                          <label style={labelStyle}>{t("wifi_password")}</label>
                          {inp("password", "••••••••", "text")}
                        </div>
                      )}
                    </>
                  )}

                  {/* vCard */}
                  {type === "vcard" && (
                    <>
                      <div>
                        <label style={labelStyle}>{t("vcard_fullname")} *</label>
                        {inp("fullname", "Jean Dupont", "text", true)}
                      </div>
                      <div>
                        <label style={labelStyle}>{t("vcard_phone")}</label>
                        {inp("phone", "+33 6 12 34 56 78", "tel")}
                      </div>
                      <div>
                        <label style={labelStyle}>{t("vcard_email")}</label>
                        {inp("email", "jean@exemple.com", "email")}
                      </div>
                      <div>
                        <label style={labelStyle}>{t("vcard_org")}</label>
                        {inp("org", "Entreprise SA")}
                      </div>
                      <div>
                        <label style={labelStyle}>{t("vcard_url")}</label>
                        {inp("url", "https://exemple.com", "url")}
                      </div>
                      <div>
                        <label style={labelStyle}>{t("vcard_note")}</label>
                        {inp("note", "Note...")}
                      </div>
                    </>
                  )}

                  {/* Email */}
                  {type === "email" && (
                    <>
                      <div>
                        <label style={labelStyle}>{t("email_to")} *</label>
                        {inp("to", "destinataire@exemple.com", "email", true)}
                      </div>
                      <div>
                        <label style={labelStyle}>{t("email_subject")}</label>
                        {inp("subject", t("email_subject"))}
                      </div>
                      <div>
                        <label style={labelStyle}>{t("email_body")}</label>
                        <textarea
                          value={fields.body || ""}
                          onChange={(e) => updateField("body", e.target.value)}
                          rows={3}
                          className="input w-full resize-none"
                          placeholder={t("email_body")}
                        />
                      </div>
                    </>
                  )}

                  {/* Téléphone */}
                  {type === "phone" && (
                    <div>
                      <label style={labelStyle}>{t("phone_number")} *</label>
                      {inp("phone", "+33 6 12 34 56 78", "tel", true)}
                    </div>
                  )}

                  {/* SMS */}
                  {type === "sms" && (
                    <>
                      <div>
                        <label style={labelStyle}>{t("sms_phone")} *</label>
                        {inp("phone", "+33 6 12 34 56 78", "tel", true)}
                      </div>
                      <div>
                        <label style={labelStyle}>{t("sms_message")}</label>
                        <textarea
                          value={fields.message || ""}
                          onChange={(e) => updateField("message", e.target.value)}
                          rows={2}
                          className="input w-full resize-none"
                          placeholder={t("sms_message")}
                        />
                      </div>
                    </>
                  )}

                  {/* WhatsApp */}
                  {type === "whatsapp" && (
                    <>
                      <div>
                        <label style={labelStyle}>{t("whatsapp_phone")} *</label>
                        {inp("phone", "33612345678", "tel", true)}
                      </div>
                      <div>
                        <label style={labelStyle}>{t("whatsapp_message")}</label>
                        <textarea
                          value={fields.message || ""}
                          onChange={(e) => updateField("message", e.target.value)}
                          rows={2}
                          className="input w-full resize-none"
                          placeholder={t("whatsapp_message")}
                        />
                      </div>
                    </>
                  )}

                  {/* GPS */}
                  {type === "geo" && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label style={labelStyle}>{t("geo_lat")} *</label>
                          {inp("lat", "48.8566", "text", true)}
                        </div>
                        <div>
                          <label style={labelStyle}>{t("geo_lng")} *</label>
                          {inp("lng", "2.3522", "text", true)}
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>{t("geo_label")}</label>
                        {inp("label", "Tour Eiffel")}
                      </div>
                    </>
                  )}

                  {/* Réseaux sociaux */}
                  {type === "social" && (
                    <>
                      <div>
                        <label style={labelStyle}>{t("social_platform")}</label>
                        <select value={fields.platform || "instagram"} onChange={(e) => updateField("platform", e.target.value)} className="input w-full">
                          {SOCIAL_PLATFORMS.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>{t("social_url")} *</label>
                        {inp("url", "https://instagram.com/moncompte", "url", true)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Templates */}
            <div style={{ ...sectionStyle, ...sectionPad }}>
              <h2 style={headingStyle}>{t("templates_title")}</h2>
              <div className="grid grid-cols-4 gap-2">
                {styleTemplates.map((tmpl) => {
                  const isActive = foregroundColor === tmpl.foregroundColor && backgroundColor === tmpl.backgroundColor;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => { setForegroundColor(tmpl.foregroundColor); setBackgroundColor(tmpl.backgroundColor); }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.5rem",
                        border: isActive ? "var(--rule)" : "1px solid rgba(0,0,0,0.1)",
                        background: isActive ? "var(--card)" : "transparent",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${tmpl.foregroundColor} 50%, ${tmpl.backgroundColor} 50%)`, border: "1px solid rgba(0,0,0,0.1)" }} />
                      <span style={{ fontSize: "0.58rem", color: "var(--mid)", fontFamily: "var(--font-mono)", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tmpl.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom */}
            <div style={{ ...sectionStyle, ...sectionPad }}>
              <h2 style={headingStyle}>{t("custom_title")}</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {([
                    [t("fg_color"), foregroundColor, setForegroundColor],
                    [t("bg_color"), backgroundColor, setBackgroundColor],
                  ] as [string, string, (v: string) => void][]).map(([lbl, val, setter]) => (
                    <div key={lbl}>
                      <label style={labelStyle}>{lbl}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={val}
                          onChange={(e) => setter(e.target.value)}
                          style={{ width: 40, height: 40, cursor: "pointer", padding: "0.15rem", background: "white", border: "var(--rule-thin)" }}
                        />
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => setter(e.target.value)}
                          className="input flex-1 text-sm"
                          style={{ fontFamily: "var(--font-mono)" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label style={labelStyle}>{t("size_label")} (px)</label>
                  <div className="flex">
                    {SIZES.map((s, idx) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        style={{
                          flex: 1,
                          padding: "0.6rem",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          background: size === s ? "var(--ink)" : "var(--card)",
                          color: size === s ? "var(--bg)" : "var(--mid)",
                          border: "var(--rule-thin)",
                          marginRight: idx < SIZES.length - 1 ? "-1px" : 0,
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)",
                          position: "relative",
                          zIndex: size === s ? 1 : 0,
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t("correction_label")}</label>
                  <select
                    value={errorCorrection}
                    onChange={(e) => setErrorCorrection(e.target.value as "L" | "M" | "Q" | "H")}
                    className="input w-full"
                  >
                    {ERROR_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div style={sectionPad}>
              <h2 style={headingStyle}>{t("logo_title")}</h2>
              <p style={{ fontSize: "0.72rem", color: "var(--mid)", marginBottom: "0.75rem" }}>
                {t("logo_hint")}
              </p>
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => logoInputRef.current?.click()} className="btn btn-secondary">
                  {t("logo_add")}
                </button>
                {logoDataUrl && (
                  <>
                    <NextImage src={logoDataUrl} alt="Logo" width={40} height={40} unoptimized className="object-contain" style={{ border: "var(--rule-thin)" }} />
                    <button type="button" onClick={() => setLogoDataUrl(null)} style={{ color: "var(--red)", background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("logo_remove")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            {/* Preview */}
            <div style={{ ...sectionStyle, ...sectionPad }}>
              <h2 style={headingStyle}>{t("preview_title")}</h2>
              <div className="flex justify-center p-6" style={{ background: "var(--card)" }}>
                <canvas ref={canvasRef} className="max-w-full" />
              </div>
            </div>

            {/* Export */}
            <div style={{ ...sectionStyle, ...sectionPad }}>
              <h2 style={headingStyle}>{t("export_title")}</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleExportPNG} className="btn btn-secondary">PNG</button>
                <button onClick={handleExportJPG} className="btn btn-secondary">JPEG</button>
                <button onClick={handleExportPDF} className="btn btn-secondary">PDF</button>
              </div>
            </div>

            {/* Share */}
            <div style={sectionPad}>
              <h2 style={headingStyle}>{t("share_title")}</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleShare}
                    style={{
                      width: 40,
                      height: 22,
                      background: isPublic ? "var(--red)" : "var(--light)",
                      border: "none",
                      borderRadius: 11,
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{
                      display: "block",
                      width: 16,
                      height: 16,
                      background: "white",
                      borderRadius: "50%",
                      position: "absolute",
                      top: 3,
                      left: isPublic ? 21 : 3,
                      transition: "left 0.2s",
                    }} />
                  </button>
                  <span style={{ fontSize: "0.75rem", color: "var(--mid)", fontFamily: "var(--font-sans)" }}>{t("share_enable")}</span>
                </div>
                {!isNew && isPublic && shareToken && (
                  <div>
                    <label style={labelStyle}>{t("share_link")}</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareToken}`}
                        className="input flex-1 text-xs"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--mid)" }}
                      />
                      <button onClick={handleCopyShareLink} className="btn btn-secondary" style={{ flexShrink: 0 }}>
                        {copiedLink ? t("share_copied") : t("share_copy")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
