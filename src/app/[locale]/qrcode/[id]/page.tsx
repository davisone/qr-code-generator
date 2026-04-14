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
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const ERROR_LEVELS = [
  { value: "L", label: "L — 7%" },
  { value: "M", label: "M — 15%" },
  { value: "Q", label: "Q — 25%" },
  { value: "H", label: "H — 30%" },
] as const;

const SIZES = [256, 512, 1024] as const;

export default function QRCodeEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("qrcode");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const isNew = params.id === "new";

  const [name, setName] = useState("");
  const [type, setType] = useState<"url" | "text">("url");
  const [content, setContent] = useState("");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [size, setSize] = useState<256 | 512 | 1024>(512);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(!isNew);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!isNew && status === "authenticated") {
      fetch(`/api/qrcodes/${params.id}`)
        .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
        .then((data) => {
          setName(data.name);
          setType(data.type);
          setContent(data.content);
          setForegroundColor(data.foregroundColor);
          setBackgroundColor(data.backgroundColor);
          setSize(data.size);
          setErrorCorrection(data.errorCorrection);
          setLogoDataUrl(data.logoDataUrl || null);
          setIsPublic(data.isPublic || false);
          setShareToken(data.shareToken || null);
        })
        .catch(() => router.push("/dashboard"))
        .finally(() => setLoadingData(false));
    }
  }, [isNew, status, params.id, router]);

  const generateQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const text = content.trim() || "https://example.com";
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
  }, [content, foregroundColor, backgroundColor, errorCorrection, logoDataUrl]);

  useEffect(() => { generateQR(); }, [generateQR]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "!";
    if (!content.trim()) newErrors.content = "!";
    if (type === "url" && content.trim()) {
      try { new URL(content.trim()); }
      catch { newErrors.content = "URL"; }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const body = { name: name.trim(), type, content: content.trim(), foregroundColor, backgroundColor, size, errorCorrection, logoDataUrl };
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
    const canvas = await generateQRCanvas({ content: content.trim() || "https://example.com", size, foregroundColor, backgroundColor, errorCorrection, logoDataUrl });
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
    if (isNew) return;
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

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                {saving ? t("saving") : saved ? "✓" : t("save")}
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

                <div>
                  <label style={labelStyle}>{t("type_label")}</label>
                  <div className="flex">
                    {(["url", "text"] as const).map((tp, idx) => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setType(tp)}
                        style={{
                          flex: 1,
                          padding: "0.6rem",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          background: type === tp ? "var(--ink)" : "var(--card)",
                          color: type === tp ? "var(--bg)" : "var(--mid)",
                          border: "var(--rule-thin)",
                          marginRight: idx === 0 ? "-1px" : 0,
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)",
                          position: "relative",
                          zIndex: type === tp ? 1 : 0,
                        }}
                      >
                        {tp === "url" ? t("type_url") : t("type_text")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{type === "url" ? t("content_label_url") : t("content_label_text")}</label>
                  {type === "url" ? (
                    <input
                      type="url"
                      value={content}
                      onChange={(e) => { setContent(e.target.value); setErrors((p) => ({ ...p, content: "" })); }}
                      className="input w-full"
                      placeholder={t("content_placeholder_url")}
                      style={errors.content ? { borderColor: "var(--red)" } : {}}
                    />
                  ) : (
                    <textarea
                      value={content}
                      onChange={(e) => { setContent(e.target.value); setErrors((p) => ({ ...p, content: "" })); }}
                      rows={3}
                      className="input w-full resize-none"
                      placeholder={t("content_placeholder_text")}
                      style={errors.content ? { borderColor: "var(--red)" } : {}}
                    />
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
                  {logoDataUrl ? t("logo_add") : t("logo_add")}
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
              <p className="mt-2 text-center" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--mid)" }}>
                {t("export_title")}: {size} × {size} px
              </p>
            </div>

            {/* Export */}
            <div style={{ ...sectionStyle, ...sectionPad }}>
              <h2 style={headingStyle}>{t("export_title")}</h2>
              <div className="flex">
                {([
                  ["PNG", handleExportPNG, "var(--red)"],
                  ["JPG", handleExportJPG, "var(--ink)"],
                  ["PDF", handleExportPDF, "var(--mid)"],
                ] as [string, () => void, string][]).map(([fmt, fn, color], idx) => (
                  <button
                    key={fmt}
                    onClick={fn}
                    style={{
                      flex: 1,
                      padding: "1.5rem 0.5rem",
                      background: "var(--card)",
                      border: "var(--rule-thin)",
                      marginRight: idx < 2 ? "-1px" : 0,
                      cursor: "pointer",
                      fontFamily: "var(--font-display, cursive)",
                      fontSize: "2rem",
                      letterSpacing: "0.04em",
                      color,
                      transition: "background 0.15s, color 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.color = "var(--bg)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.color = color; }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Share */}
            {!isNew && (
              <div style={sectionPad}>
                <h2 style={headingStyle}>{t("share_title")}</h2>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={handleToggleShare}
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      height: 24,
                      width: 44,
                      alignItems: "center",
                      background: isPublic ? "var(--ink)" : "#ccc4bb",
                      borderRadius: 999,
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      background: "white",
                      borderRadius: 999,
                      transform: isPublic ? "translateX(1.5rem)" : "translateX(0.25rem)",
                      transition: "transform 0.2s",
                    }} />
                  </button>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mid)" }}>
                    {t("share_enable")}
                  </span>
                </div>
                {isPublic && shareToken && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareToken}`}
                      className="input flex-1 text-xs"
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                    <button onClick={handleCopyShareLink} className="btn btn-primary btn-sm">
                      {copiedLink ? t("share_copied") : t("share_copy")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
