"use client";

import { useState, useCallback, useEffect } from "react";
import QRCode from "qrcode";
import type { QRCodeItem } from "@/types/qrcode";

interface UseQRCodesReturn {
  qrCodes: QRCodeItem[];
  previews: Record<string, string>;
  loading: boolean;
  loadQRCodes: () => Promise<void>;
  setQrCodes: React.Dispatch<React.SetStateAction<QRCodeItem[]>>;
}

export const useQRCodes = (
  onFirstLoad?: (firstId: string) => void
): UseQRCodesReturn => {
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadQRCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/qrcodes");
      if (res.ok) {
        const data: QRCodeItem[] = await res.json();
        setQrCodes(data);
        if (data.length > 0 && !initialized && onFirstLoad) {
          onFirstLoad(data[0].id);
          setInitialized(true);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [initialized, onFirstLoad]);

  useEffect(() => {
    async function generatePreviews() {
      const newPreviews: Record<string, string> = {};
      for (const qr of qrCodes) {
        try {
          newPreviews[qr.id] = await QRCode.toDataURL(qr.content || "placeholder", {
            width: 80,
            margin: 1,
            color: { dark: qr.foregroundColor, light: qr.backgroundColor },
            errorCorrectionLevel: qr.errorCorrection as "L" | "M" | "Q" | "H",
          });
        } catch {
          newPreviews[qr.id] = "";
        }
      }
      setPreviews(newPreviews);
    }
    if (qrCodes.length > 0) generatePreviews();
  }, [qrCodes]);

  return { qrCodes, previews, loading, loadQRCodes, setQrCodes };
};
