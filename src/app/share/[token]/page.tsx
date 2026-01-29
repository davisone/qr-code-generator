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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Code introuvable</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{qrCode?.name}</h1>
        <span className="inline-block mb-4 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 uppercase">
          {qrCode?.type}
        </span>

        <div className="flex justify-center p-4 bg-gray-50 rounded-lg mb-4">
          <canvas ref={canvasRef} className="rounded" />
        </div>

        <p className="text-sm text-gray-400 mb-6 truncate">{qrCode?.content}</p>

        <button
          onClick={handleDownload}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
        >
          Télécharger le QR Code
        </button>

        <p className="mt-4 text-xs text-gray-400">
          Généré avec QR Code Generator
        </p>
      </div>
    </div>
  );
}
