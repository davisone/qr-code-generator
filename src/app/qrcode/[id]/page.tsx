"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { QRCodeData } from "@/lib/types";
import { getQRCodeById, saveQRCode } from "@/lib/qr-storage";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { v4 as uuidv4 } from "uuid";

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
  const isNew = params.id === "new";

  const [name, setName] = useState("");
  const [type, setType] = useState<"url" | "text">("url");
  const [content, setContent] = useState("");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [size, setSize] = useState<256 | 512 | 1024>(512);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!isNew && session?.user?.email) {
      const existing = getQRCodeById(session.user.email, params.id as string);
      if (existing) {
        setName(existing.name);
        setType(existing.type);
        setContent(existing.content);
        setForegroundColor(existing.foregroundColor);
        setBackgroundColor(existing.backgroundColor);
        setSize(existing.size);
        setErrorCorrection(existing.errorCorrection);
      } else {
        router.push("/dashboard");
      }
    }
  }, [isNew, session?.user?.email, params.id, router]);

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
  }, [content, foregroundColor, backgroundColor, errorCorrection]);

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
    if (!validate() || !session?.user?.email) return;

    setSaving(true);
    const qrCode: QRCodeData = {
      id: isNew ? uuidv4() : (params.id as string),
      name: name.trim(),
      type,
      content: content.trim(),
      foregroundColor,
      backgroundColor,
      size,
      errorCorrection,
      createdAt: isNew ? new Date().toISOString() : (getQRCodeById(session.user.email, params.id as string)?.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString(),
    };

    saveQRCode(session.user.email, qrCode);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    if (isNew) {
      router.replace(`/qrcode/${qrCode.id}`);
    }
  }

  async function getHighQualityDataURL(format: "png" | "jpeg"): Promise<string> {
    const canvas = document.createElement("canvas");
    const text = content.trim() || "https://example.com";
    await QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 2,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
      errorCorrectionLevel: errorCorrection,
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "Nouveau QR Code" : "Modifier le QR Code"}
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du QR Code
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: "" })); }}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 ${errors.name ? "border-red-300" : "border-gray-300"}`}
                    placeholder="Mon QR Code"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de contenu</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setType("url")}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${type === "url" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("text")}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${type === "text" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      Texte
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    {type === "url" ? "URL" : "Texte"}
                  </label>
                  {type === "url" ? (
                    <input
                      id="content"
                      type="url"
                      value={content}
                      onChange={(e) => { setContent(e.target.value); setErrors((prev) => ({ ...prev, content: "" })); }}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 ${errors.content ? "border-red-300" : "border-gray-300"}`}
                      placeholder="https://exemple.com"
                    />
                  ) : (
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => { setContent(e.target.value); setErrors((prev) => ({ ...prev, content: "" })); }}
                      rows={3}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 resize-none ${errors.content ? "border-red-300" : "border-gray-300"}`}
                      placeholder="Votre texte ici..."
                    />
                  )}
                  {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personnalisation</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fgColor" className="block text-sm font-medium text-gray-700 mb-1">
                      Couleur QR
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="fgColor"
                        type="color"
                        value={foregroundColor}
                        onChange={(e) => setForegroundColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={foregroundColor}
                        onChange={(e) => setForegroundColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="bgColor" className="block text-sm font-medium text-gray-700 mb-1">
                      Couleur fond
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="bgColor"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taille (px)</label>
                  <div className="flex gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${size === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="errorCorrection" className="block text-sm font-medium text-gray-700 mb-1">
                    Correction d&apos;erreur
                  </label>
                  <select
                    id="errorCorrection"
                    value={errorCorrection}
                    onChange={(e) => setErrorCorrection(e.target.value as "L" | "M" | "Q" | "H")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 bg-white"
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

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : saved ? "Enregistré !" : "Enregistrer"}
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
              >
                Retour
              </button>
            </div>
          </div>

          {/* Right: Preview & Export */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu en temps réel</h2>
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                <canvas ref={canvasRef} className="rounded" />
              </div>
              <p className="mt-3 text-sm text-gray-400 text-center">
                Taille d&apos;export : {size} x {size} px
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Exporter</h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleExportPNG}
                  className="flex flex-col items-center gap-2 py-4 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                >
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">PNG</span>
                </button>
                <button
                  onClick={handleExportJPG}
                  className="flex flex-col items-center gap-2 py-4 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                >
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">JPG</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex flex-col items-center gap-2 py-4 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                >
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
