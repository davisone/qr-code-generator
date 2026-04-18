import QRCode from "qrcode";
import type { QRTemplate } from "@/lib/qr-templates";

// Génère la preview d'un template : QR code + emoji centré (si défini).
// Client-only — utilise document/canvas.
export async function renderTemplatePreview(
  template: QRTemplate,
  size = 200,
): Promise<string> {
  // Contenu placeholder puisque les templates ont souvent un content vide
  const placeholder =
    template.defaultContent && template.defaultContent.trim()
      ? template.defaultContent
      : "https://useqraft.com";

  const dataUrl = await QRCode.toDataURL(placeholder, {
    errorCorrectionLevel: template.defaultStyle.errorCorrection,
    width: size,
    margin: 1,
    color: {
      dark: template.defaultStyle.foregroundColor,
      light: template.defaultStyle.backgroundColor,
    },
  });

  if (!template.defaultStyle.logoEmoji) return dataUrl;

  // Superpose l'emoji au centre sur un carré blanc
  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      const logoSize = size * 0.24;
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);
      ctx.font = `${Math.floor(
        logoSize * 0.8,
      )}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(template.defaultStyle.logoEmoji!, size / 2, size / 2 + 2);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
