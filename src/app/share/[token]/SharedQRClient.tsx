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

  // Suivi du scan au chargement
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
      color: {
        dark: qrCode.foregroundColor,
        light: qrCode.backgroundColor,
      },
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

  useEffect(() => {
    renderQR();
  }, [renderQR]);

  async function handleDownload() {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, qrCode.content, {
      width: qrCode.size,
      margin: 2,
      color: {
        dark: qrCode.foregroundColor,
        light: qrCode.backgroundColor,
      },
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
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="bento-card p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[#0a0a0a] mb-1">{qrCode.name}</h1>
        <span className="badge badge-secondary mb-4">{qrCode.type}</span>

        <div className="flex justify-center p-4 bg-[#f5f5f5] rounded-xl mb-4">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>

        <p className="text-sm text-[#525252] mb-6 truncate">{qrCode.content}</p>

        <button onClick={handleDownload} className="btn btn-primary w-full">
          Télécharger le QR Code
        </button>

        <p className="mt-4 text-xs text-[#a3a3a3]">
          Généré avec{" "}
          <a href="https://qr-aft.vercel.app" className="underline">
            QRaft
          </a>
        </p>
      </div>
    </div>
  );
}
