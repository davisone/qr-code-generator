"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
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

export default function SharedQRCodePage() {
  const params = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCode, setQrCode] = useState<SharedQRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/share/${params.token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setQrCode)
      .catch(() => setError("Ce QR code n'existe pas ou n'est plus partagé."))
      .finally(() => setLoading(false));
  }, [params.token]);

  const renderQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !qrCode) return;

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
    if (!qrCode) return;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a0a0a]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="bento-card p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">QR Code introuvable</h1>
          <p className="text-[#525252]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="bento-card p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[#0a0a0a] mb-1">{qrCode?.name}</h1>
        <span className="badge badge-secondary mb-4">
          {qrCode?.type}
        </span>

        <div className="flex justify-center p-4 bg-[#f5f5f5] rounded-xl mb-4">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>

        <p className="text-sm text-[#525252] mb-6 truncate">{qrCode?.content}</p>

        <button
          onClick={handleDownload}
          className="btn btn-primary w-full"
        >
          Télécharger le QR Code
        </button>

        <p className="mt-4 text-xs text-[#a3a3a3]">
          Généré avec QR Code Generator
        </p>
      </div>
    </div>
  );
}
