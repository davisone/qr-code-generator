"use client";

import { useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";

interface SharedQRCode {
  id: string;
  name: string;
  type: string;
  content: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  errorCorrection: string;
  logoDataUrl: string | null;
}

interface Props {
  qrCode: SharedQRCode;
}

export function SharedQRClient({ qrCode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeId: qrCode.id }),
      }).catch(() => {});
    }
  }, [qrCode.id]);

  const renderQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    await QRCode.toCanvas(canvas, qrCode.content || "https://example.com", {
      width: 320,
      margin: 2,
      color: { dark: qrCode.foregroundColor, light: qrCode.backgroundColor },
      errorCorrectionLevel: qrCode.errorCorrection as "L" | "M" | "Q" | "H",
    });

    if (qrCode.logoDataUrl) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
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
      img.src = qrCode.logoDataUrl;
    }
  }, [qrCode]);

  useEffect(() => { renderQR(); }, [renderQR]);

  async function handleDownload() {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, qrCode.content, {
      width: qrCode.size,
      margin: 2,
      color: { dark: qrCode.foregroundColor, light: qrCode.backgroundColor },
      errorCorrectionLevel: qrCode.errorCorrection as "L" | "M" | "Q" | "H",
    });

    if (qrCode.logoDataUrl) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        await new Promise<void>((resolve) => {
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
            resolve();
          };
          img.src = qrCode.logoDataUrl!;
        });
      }
    }

    const link = document.createElement("a");
    link.download = `${qrCode.name}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div style={{ border: "var(--rule)", background: "var(--card)", width: "100%", maxWidth: 420 }}>
        {/* Header */}
        <div style={{ background: "var(--ink)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.6rem", color: "var(--bg)", letterSpacing: "0.06em" }}>
            QRaft
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "rgba(240,235,225,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {qrCode.type}
          </span>
        </div>

        <div style={{ padding: "1.5rem", textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "2rem", letterSpacing: "0.04em", color: "var(--ink)", lineHeight: 1, marginBottom: "1.5rem" }}>
            {qrCode.name}
          </h1>

          <div style={{ background: "white", padding: "1.5rem", border: "var(--rule-thin)", display: "inline-block", marginBottom: "1rem" }}>
            <canvas ref={canvasRef} />
          </div>

          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--mid)", marginBottom: "1.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {qrCode.content}
          </p>

          <button
            onClick={handleDownload}
            className="btn btn-primary w-full"
            style={{ marginBottom: "1rem" }}
          >
            ↓ PNG
          </button>

          <p style={{ fontSize: "0.65rem", color: "var(--light)", fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <a href="https://www.useqraft.com" style={{ color: "inherit", textDecoration: "underline" }}>
              useqraft.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
