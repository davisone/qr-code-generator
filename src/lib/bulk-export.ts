import JSZip from "jszip";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { BulkQRRow } from "./csv-parser";

/**
 * Génère un ZIP contenant un PNG par QR code + un PDF récapitulatif.
 * À utiliser côté client uniquement.
 */
export const exportBulkZip = async (rows: BulkQRRow[]): Promise<Blob> => {
  const zip = new JSZip();
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  // Pour éviter les collisions de noms de fichier
  const usedNames = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const dataUrl = await QRCode.toDataURL(row.content, {
      errorCorrectionLevel: "H",
      width: 512,
      margin: 1,
      color: { dark: row.color, light: row.background },
    });

    // Sanitize le nom de fichier
    const base = row.name.replace(/[^a-zA-Z0-9-_]/g, "_") || `qr-${i + 1}`;
    let safeName = base;
    let counter = 1;
    while (usedNames.has(safeName)) {
      safeName = `${base}-${counter}`;
      counter++;
    }
    usedNames.add(safeName);

    const base64 = dataUrl.split(",")[1];
    zip.file(`${safeName}.png`, base64, { base64: true });

    // Ajoute une page au PDF (1 QR par page avec nom + content)
    if (i > 0) pdf.addPage();
    pdf.setFontSize(20);
    pdf.text(row.name, 15, 20);
    pdf.setFontSize(10);
    pdf.text(row.content, 15, 28, { maxWidth: 180 });
    pdf.addImage(dataUrl, "PNG", 55, 50, 100, 100);
  }

  const pdfBlob = pdf.output("blob");
  zip.file("useqraft-batch-recap.pdf", pdfBlob);

  return zip.generateAsync({ type: "blob" });
};
