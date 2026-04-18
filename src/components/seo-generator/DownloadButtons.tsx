"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

interface Props {
  content: string;
  fileName: string;
  labels: {
    png: string;
    svg: string;
    pdf: string;
  };
  disabled?: boolean;
}

export const DownloadButtons = ({ content, fileName, labels, disabled = false }: Props) => {
  const [busy, setBusy] = useState<null | "png" | "svg" | "pdf">(null);

  const safeContent = content.trim() || " ";

  const downloadPNG = async () => {
    if (disabled || busy) return;
    setBusy("png");
    try {
      const dataUrl = await QRCode.toDataURL(safeContent, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#000000", light: "#ffffff" },
      });
      triggerDownload(dataUrl, `${fileName}.png`);
    } catch {
      // silently ignore
    } finally {
      setBusy(null);
    }
  };

  const downloadSVG = async () => {
    if (disabled || busy) return;
    setBusy("svg");
    try {
      const svg = await QRCode.toString(safeContent, {
        type: "svg",
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#000000", light: "#ffffff" },
      });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${fileName}.svg`);
      URL.revokeObjectURL(url);
    } catch {
      // silently ignore
    } finally {
      setBusy(null);
    }
  };

  const downloadPDF = async () => {
    if (disabled || busy) return;
    setBusy("pdf");
    try {
      const dataUrl = await QRCode.toDataURL(safeContent, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#000000", light: "#ffffff" },
      });
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const qrSize = 120;
      const x = (pageWidth - qrSize) / 2;
      const y = (pageHeight - qrSize) / 2;
      pdf.addImage(dataUrl, "PNG", x, y, qrSize, qrSize);
      pdf.save(`${fileName}.pdf`);
    } catch {
      // silently ignore
    } finally {
      setBusy(null);
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const buttonStyle = (primary: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.45rem",
    padding: "0.75rem 1.2rem",
    fontFamily: "var(--font-sans)",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    background: primary ? "var(--ink)" : "var(--card)",
    color: primary ? "var(--bg)" : "var(--ink)",
    border: primary ? "2px solid var(--ink)" : "2px solid var(--ink)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    width: "100%",
    boxShadow: primary ? "4px 4px 0 var(--red)" : "none",
    transition: "transform 0.1s ease",
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "0.6rem",
        marginTop: "1.2rem",
      }}
    >
      <button
        type="button"
        onClick={downloadPNG}
        disabled={disabled || busy !== null}
        aria-label={labels.png}
        style={buttonStyle(true)}
      >
        {busy === "png" ? "…" : `↓ ${labels.png}`}
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
        <button
          type="button"
          onClick={downloadSVG}
          disabled={disabled || busy !== null}
          aria-label={labels.svg}
          style={buttonStyle(false)}
        >
          {busy === "svg" ? "…" : `↓ ${labels.svg}`}
        </button>
        <button
          type="button"
          onClick={downloadPDF}
          disabled={disabled || busy !== null}
          aria-label={labels.pdf}
          style={buttonStyle(false)}
        >
          {busy === "pdf" ? "…" : `↓ ${labels.pdf}`}
        </button>
      </div>
    </div>
  );
};
