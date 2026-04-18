import { jsPDF } from "jspdf";

export interface ReportData {
  qrCodeName: string;
  periodStart: Date;
  periodEnd: Date;
  totalScans: number;
  uniqueCountries: number;
  topCountries: Array<{ country: string; count: number }>;
  topDevices: Array<{ device: string; count: number }>;
  topBrowsers: Array<{ browser: string; count: number }>;
  timeline: Array<{ date: string; scans: number }>;
  userBrand?: { logo?: string; primaryColor?: string };
}

// Constantes mise en page A4 portrait (210x297 mm)
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const formatDate = (d: Date): string =>
  `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;

// Convertit "#rrggbb" en triplet RGB pour jsPDF.setFillColor
const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace("#", "");
  const n = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const num = parseInt(n, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

// Génère le rapport PDF analytics. Renvoie un Blob prêt à download.
export const generateAnalyticsPDF = (data: ReportData): Blob => {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const primary = data.userBrand?.primaryColor ?? "#d4290f";
  const [pr, pg, pb] = hexToRgb(primary);
  const ink: [number, number, number] = [26, 20, 16];
  const mid: [number, number, number] = [107, 95, 82];
  const light: [number, number, number] = [232, 226, 214];

  let y = 0;

  // ── Header bande rouge ──────────────────────────────────────────────────
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, PAGE_WIDTH, 34, "F");

  // Logo brand optionnel
  if (data.userBrand?.logo) {
    try {
      doc.addImage(data.userBrand.logo, "PNG", MARGIN_X, 8, 18, 18);
    } catch {
      // Image invalide : on ignore
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("RAPPORT ANALYTICS", MARGIN_X + (data.userBrand?.logo ? 22 : 0), 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `${data.qrCodeName} — ${formatDate(data.periodStart)} -> ${formatDate(
      data.periodEnd
    )}`,
    MARGIN_X + (data.userBrand?.logo ? 22 : 0),
    26
  );

  y = 44;

  // ── Section "Vue d'ensemble" ────────────────────────────────────────────
  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Vue d'ensemble", MARGIN_X, y);
  y += 6;

  // 3 KPI cards horizontales
  const kpiWidth = (CONTENT_WIDTH - 8) / 3;
  const kpiHeight = 22;
  const kpis: Array<[string, string]> = [
    ["Scans totaux", String(data.totalScans)],
    ["Pays uniques", String(data.uniqueCountries)],
    ["Top appareil", data.topDevices[0]?.device ?? "-"],
  ];
  kpis.forEach(([label, value], i) => {
    const x = MARGIN_X + i * (kpiWidth + 4);
    doc.setFillColor(light[0], light[1], light[2]);
    doc.rect(x, y, kpiWidth, kpiHeight, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(mid[0], mid[1], mid[2]);
    doc.text(label.toUpperCase(), x + 3, y + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(ink[0], ink[1], ink[2]);
    doc.text(value, x + 3, y + 16);
  });
  y += kpiHeight + 10;

  // ── Top Pays ────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.text("Top pays", MARGIN_X, y);
  y += 5;

  doc.setDrawColor(ink[0], ink[1], ink[2]);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, y, MARGIN_X + CONTENT_WIDTH, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const topCountries = data.topCountries.slice(0, 10);
  if (topCountries.length === 0) {
    doc.setTextColor(mid[0], mid[1], mid[2]);
    doc.text("Aucune donnée.", MARGIN_X, y);
    y += 6;
  } else {
    topCountries.forEach((row, i) => {
      doc.setTextColor(mid[0], mid[1], mid[2]);
      doc.text(String(i + 1).padStart(2, "0"), MARGIN_X, y);
      doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.text(row.country, MARGIN_X + 10, y);
      doc.setFont("helvetica", "bold");
      doc.text(String(row.count), MARGIN_X + CONTENT_WIDTH, y, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 5;
    });
  }
  y += 6;

  // ── Top Devices / Browsers côte à côte ──────────────────────────────────
  const colWidth = (CONTENT_WIDTH - 6) / 2;
  const yStartCols = y;

  const renderList = (
    title: string,
    items: Array<{ label: string; count: number }>,
    x: number
  ): number => {
    let yc = yStartCols;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(ink[0], ink[1], ink[2]);
    doc.text(title, x, yc);
    yc += 5;
    doc.setLineWidth(0.3);
    doc.line(x, yc, x + colWidth, yc);
    yc += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const slice = items.slice(0, 6);
    if (slice.length === 0) {
      doc.setTextColor(mid[0], mid[1], mid[2]);
      doc.text("Aucune donnée.", x, yc);
      yc += 5;
    } else {
      slice.forEach((row) => {
        doc.setTextColor(ink[0], ink[1], ink[2]);
        doc.text(row.label, x, yc);
        doc.setFont("helvetica", "bold");
        doc.text(String(row.count), x + colWidth, yc, { align: "right" });
        doc.setFont("helvetica", "normal");
        yc += 5;
      });
    }
    return yc;
  };

  const yDevices = renderList(
    "Top appareils",
    data.topDevices.map((d) => ({ label: d.device, count: d.count })),
    MARGIN_X
  );
  const yBrowsers = renderList(
    "Top navigateurs",
    data.topBrowsers.map((b) => ({ label: b.browser, count: b.count })),
    MARGIN_X + colWidth + 6
  );
  y = Math.max(yDevices, yBrowsers) + 6;

  // ── Evolution : mini line chart dessiné à la main ───────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.text("Evolution", MARGIN_X, y);
  y += 5;
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, y, MARGIN_X + CONTENT_WIDTH, y);
  y += 4;

  const chartHeight = 50;
  const chartWidth = CONTENT_WIDTH;
  const chartX = MARGIN_X;
  const chartY = y;
  doc.setFillColor(light[0], light[1], light[2]);
  doc.rect(chartX, chartY, chartWidth, chartHeight, "F");

  if (data.timeline.length > 1) {
    const maxScans = Math.max(...data.timeline.map((t) => t.scans), 1);
    const stepX = chartWidth / (data.timeline.length - 1);
    doc.setDrawColor(pr, pg, pb);
    doc.setLineWidth(0.6);
    for (let i = 0; i < data.timeline.length - 1; i++) {
      const p0 = data.timeline[i];
      const p1 = data.timeline[i + 1];
      const x0 = chartX + i * stepX;
      const x1 = chartX + (i + 1) * stepX;
      const y0 = chartY + chartHeight - (p0.scans / maxScans) * chartHeight;
      const y1 = chartY + chartHeight - (p1.scans / maxScans) * chartHeight;
      doc.line(x0, y0, x1, y1);
    }
    // Axe vertical : max affiché à gauche
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(mid[0], mid[1], mid[2]);
    doc.text(String(maxScans), chartX + 1, chartY + 4);
    doc.text("0", chartX + 1, chartY + chartHeight - 1);
    // Labels début / fin
    const first = data.timeline[0].date;
    const last = data.timeline[data.timeline.length - 1].date;
    doc.text(first, chartX, chartY + chartHeight + 4);
    doc.text(last, chartX + chartWidth, chartY + chartHeight + 4, {
      align: "right",
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(mid[0], mid[1], mid[2]);
    doc.text(
      "Pas assez de données pour tracer l'évolution.",
      chartX + 4,
      chartY + chartHeight / 2
    );
  }
  y = chartY + chartHeight + 12;

  // ── Footer ──────────────────────────────────────────────────────────────
  doc.setDrawColor(ink[0], ink[1], ink[2]);
  doc.setLineWidth(0.2);
  doc.line(MARGIN_X, PAGE_HEIGHT - 14, MARGIN_X + CONTENT_WIDTH, PAGE_HEIGHT - 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(mid[0], mid[1], mid[2]);
  doc.text(
    "Généré par QRaft — useqraft.com",
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 8,
    { align: "center" }
  );

  return doc.output("blob");
};
