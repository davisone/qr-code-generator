import QRCode from "qrcode";

interface QRCanvasOptions {
  content: string;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrection: "L" | "M" | "Q" | "H";
  logoDataUrl?: string | null;
}

/**
 * Generate a QR code on a canvas with optional logo overlay.
 * Returns the canvas element.
 */
export async function generateQRCanvas(opts: QRCanvasOptions): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, opts.content || "https://example.com", {
    width: opts.size,
    margin: 2,
    color: {
      dark: opts.foregroundColor,
      light: opts.backgroundColor,
    },
    errorCorrectionLevel: opts.errorCorrection,
  });

  if (opts.logoDataUrl) {
    await overlayLogo(canvas, opts.logoDataUrl);
  }

  return canvas;
}

/**
 * Draw a logo image centered on a canvas.
 * Logo takes ~20% of the QR code area with a white padding border.
 */
function overlayLogo(canvas: HTMLCanvasElement, logoDataUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve();

      const logoSize = Math.floor(canvas.width * 0.2);
      const padding = Math.floor(logoSize * 0.1);
      const totalSize = logoSize + padding * 2;
      const x = (canvas.width - totalSize) / 2;
      const y = (canvas.height - totalSize) / 2;

      // White background behind logo
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(x, y, totalSize, totalSize, 8);
      ctx.fill();

      // Draw logo
      ctx.drawImage(img, x + padding, y + padding, logoSize, logoSize);
      resolve();
    };
    img.onerror = () => reject(new Error("Failed to load logo"));
    img.src = logoDataUrl;
  });
}

/**
 * Generate a QR code as a data URL with optional logo.
 */
export async function generateQRDataURL(
  opts: QRCanvasOptions,
  format: "png" | "jpeg" = "png"
): Promise<string> {
  const canvas = await generateQRCanvas(opts);
  return canvas.toDataURL(format === "jpeg" ? "image/jpeg" : "image/png", 1.0);
}
