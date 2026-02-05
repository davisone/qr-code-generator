"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { styleTemplates } from "@/lib/templates";
import { generateQRCanvas } from "@/lib/qr-utils";

const ERROR_LEVELS = [
  { value: "L", label: "L - Faible (7%)" },
  { value: "M", label: "M - Moyen (15%)" },
  { value: "Q", label: "Q - Quartile (25%)" },
  { value: "H", label: "H - Haut (30%)" },
] as const;

const SIZES = [256, 512, 1024] as const;

export default function QRCodeEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
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
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!isNew && status === "authenticated") {
      fetch(`/api/qrcodes/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
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
        .catch(() => {
          router.push("/dashboard");
        })
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
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        errorCorrectionLevel: errorCorrection,
      });
      // Overlay logo on preview
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
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#9ca3af";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Contenu invalide", canvas.width / 2, canvas.height / 2);
      }
    }
  }, [content, foregroundColor, backgroundColor, errorCorrection, logoDataUrl]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Le nom est requis";
    if (!content.trim()) newErrors.content = "Le contenu est requis";
    if (type === "url" && content.trim()) {
      try {
        new URL(content.trim());
      } catch {
        newErrors.content = "URL invalide (ex: https://exemple.com)";
      }
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
      foregroundColor,
      backgroundColor,
      size,
      errorCorrection,
      logoDataUrl,
    };

    try {
      let res: Response;
      if (isNew) {
        res = await fetch("/api/qrcodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/qrcodes/${params.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur serveur");
      }

      const data = await res.json();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      if (isNew) {
        router.replace(`/qrcode/${data.id}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function getHighQualityDataURL(format: "png" | "jpeg"): Promise<string> {
    const canvas = await generateQRCanvas({
      content: content.trim() || "https://example.com",
      size,
      foregroundColor,
      backgroundColor,
      errorCorrection,
      logoDataUrl,
    });
    return canvas.toDataURL(format === "jpeg" ? "image/jpeg" : "image/png", 1.0);
  }

  async function handleExportPNG() {
    try {
      const dataUrl = await getHighQualityDataURL("png");
      downloadFile(dataUrl, `${name || "qrcode"}.png`);
    } catch {
      alert("Erreur lors de l'export PNG");
    }
  }

  async function handleExportJPG() {
    try {
      const dataUrl = await getHighQualityDataURL("jpeg");
      downloadFile(dataUrl, `${name || "qrcode"}.jpg`);
    } catch {
      alert("Erreur lors de l'export JPG");
    }
  }

  async function handleExportPDF() {
    try {
      const dataUrl = await getHighQualityDataURL("png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
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
    } catch {
      alert("Erreur lors de l'export PDF");
    }
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
    if (file.size > 500 * 1024) {
      alert("Le logo ne doit pas dépasser 500 Ko");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(reader.result as string);
    };
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
    } catch {
      alert("Erreur lors du changement de partage");
    }
  }

  function handleCopyShareLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  if (status === "loading" || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl bg-[#f5f5f5] hover:bg-[#e5e5e5] transition"
          >
            <svg className="w-5 h-5 text-[#525252]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-[#0a0a0a]">
            {isNew ? "Nouveau QR Code" : "Modifier le QR Code"}
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="space-y-6">
            <div className="bento-card">
              <h2 className="text-lg font-semibold text-[#0a0a0a] mb-4">Informations</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
                    Nom du QR Code
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: "" })); }}
                    className={`input w-full ${errors.name ? "!border-red-300" : ""}`}
                    placeholder="Mon QR Code"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0a0a0a] mb-1.5">Type de contenu</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setType("url")}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg border transition ${type === "url" ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "bg-[#f5f5f5] text-[#525252] border-transparent hover:bg-[#e5e5e5]"}`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("text")}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg border transition ${type === "text" ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "bg-[#f5f5f5] text-[#525252] border-transparent hover:bg-[#e5e5e5]"}`}
                    >
                      Texte
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
                    {type === "url" ? "URL" : "Texte"}
                  </label>
                  {type === "url" ? (
                    <input
                      id="content"
                      type="url"
                      value={content}
                      onChange={(e) => { setContent(e.target.value); setErrors((prev) => ({ ...prev, content: "" })); }}
                      className={`input w-full ${errors.content ? "!border-red-300" : ""}`}
                      placeholder="https://exemple.com"
                    />
                  ) : (
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => { setContent(e.target.value); setErrors((prev) => ({ ...prev, content: "" })); }}
                      rows={3}
                      className={`input w-full resize-none ${errors.content ? "!border-red-300" : ""}`}
                      placeholder="Votre texte ici..."
                    />
                  )}
                  {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                </div>
              </div>
            </div>

            {/* Templates */}
            <div className="bento-card">
              <h2 className="text-lg font-semibold text-[#0a0a0a] mb-4">Templates de style</h2>
              <div className="grid grid-cols-4 gap-2">
                {styleTemplates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setForegroundColor(t.foregroundColor);
                      setBackgroundColor(t.backgroundColor);
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition hover:shadow-sm ${
                      foregroundColor === t.foregroundColor && backgroundColor === t.backgroundColor
                        ? "border-[#0a0a0a] bg-[#f5f5f5]"
                        : "border-transparent hover:border-gray-200 bg-[#f5f5f5]"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg border border-gray-200"
                      style={{ background: `linear-gradient(135deg, ${t.foregroundColor} 50%, ${t.backgroundColor} 50%)` }}
                    />
                    <span className="text-xs text-[#525252] truncate w-full text-center">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bento-card">
              <h2 className="text-lg font-semibold text-[#0a0a0a] mb-4">Personnalisation</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fgColor" className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
                      Couleur QR
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="fgColor"
                        type="color"
                        value={foregroundColor}
                        onChange={(e) => setForegroundColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={foregroundColor}
                        onChange={(e) => setForegroundColor(e.target.value)}
                        className="input flex-1 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="bgColor" className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
                      Couleur fond
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="bgColor"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="input flex-1 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0a0a0a] mb-1.5">Taille (px)</label>
                  <div className="flex gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition ${size === s ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "bg-[#f5f5f5] text-[#525252] border-transparent hover:bg-[#e5e5e5]"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="errorCorrection" className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
                    Correction d&apos;erreur
                  </label>
                  <select
                    id="errorCorrection"
                    value={errorCorrection}
                    onChange={(e) => setErrorCorrection(e.target.value as "L" | "M" | "Q" | "H")}
                    className="input w-full"
                  >
                    {ERROR_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="bento-card">
              <h2 className="text-lg font-semibold text-[#0a0a0a] mb-4">Logo au centre</h2>
              <p className="text-sm text-[#525252] mb-3">
                Ajoutez un logo au centre du QR code. Utilisez une correction d&apos;erreur H pour de meilleurs résultats.
              </p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="btn btn-secondary"
                >
                  {logoDataUrl ? "Changer le logo" : "Ajouter un logo"}
                </button>
                {logoDataUrl && (
                  <>
                    <img src={logoDataUrl} alt="Logo" className="w-10 h-10 rounded-lg border border-gray-200 object-contain" />
                    <button
                      type="button"
                      onClick={() => setLogoDataUrl(null)}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary flex-1"
              >
                {saving ? "Enregistrement..." : saved ? "Enregistré !" : "Enregistrer"}
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="btn btn-secondary"
              >
                Retour
              </button>
            </div>
          </div>

          {/* Right: Preview & Export */}
          <div className="space-y-6">
            <div className="bento-card">
              <h2 className="text-lg font-semibold text-[#0a0a0a] mb-4">Aperçu en temps réel</h2>
              <div className="flex justify-center p-4 bg-[#f5f5f5] rounded-xl">
                <canvas ref={canvasRef} className="rounded-lg" />
              </div>
              <p className="mt-3 text-sm text-[#525252] text-center">
                Taille d&apos;export : {size} x {size} px
              </p>
            </div>

            <div className="bento-card">
              <h2 className="text-lg font-semibold text-[#0a0a0a] mb-4">Exporter</h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleExportPNG}
                  className="flex flex-col items-center gap-2 py-4 px-3 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-xl transition"
                >
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-[#0a0a0a]">PNG</span>
                </button>
                <button
                  onClick={handleExportJPG}
                  className="flex flex-col items-center gap-2 py-4 px-3 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-xl transition"
                >
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-[#0a0a0a]">JPG</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex flex-col items-center gap-2 py-4 px-3 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-xl transition"
                >
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-[#0a0a0a]">PDF</span>
                </button>
              </div>
            </div>

            {/* Share Section */}
            {!isNew && (
              <div className="bento-card">
                <h2 className="text-lg font-semibold text-[#0a0a0a] mb-4">Partage public</h2>
                <p className="text-sm text-[#525252] mb-3">
                  Activez le partage pour générer un lien public vers ce QR code.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleShare}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isPublic ? "bg-[#0a0a0a]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isPublic ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-[#525252]">
                    {isPublic ? "Partagé publiquement" : "Non partagé"}
                  </span>
                </div>
                {isPublic && shareToken && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareToken}`}
                      className="input flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className="btn btn-primary btn-sm"
                    >
                      {copiedLink ? "Copié !" : "Copier"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
