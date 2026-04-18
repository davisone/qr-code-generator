"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useScanStream, type LiveScan } from "@/hooks/useScanStream";
import { generateAnalyticsPDF, type ReportData } from "@/lib/analytics-pdf";

const HeatmapView = dynamic(() => import("@/components/HeatmapView"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 500,
        background: "var(--card)",
        border: "var(--rule)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--mid)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
      }}
    >
      …
    </div>
  ),
});

interface CompareResponse {
  current: {
    start: string;
    end: string;
    totalScans: number;
    uniqueCountries: number;
    uniqueCities: number;
    topDevice: string | null;
    topBrowser: string | null;
  };
  previous: {
    start: string;
    end: string;
    totalScans: number;
    uniqueCountries: number;
    uniqueCities: number;
  };
  delta: { scans: number; scansPercent: number };
  timeline: { date: string; currentScans: number; previousScans: number }[];
}

interface HeatmapPointsResponse {
  points: Array<[number, number, number]>;
}

// Émoji drapeau depuis code pays ISO-3166-1 alpha-2 (sinon globe)
const flagEmoji = (country: string | null): string => {
  if (!country || country.length < 2) return "🌐";
  const upper = country.toUpperCase();
  if (upper.length === 2 && /^[A-Z]{2}$/.test(upper)) {
    const codes = [...upper].map((c) => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codes);
  }
  return "🌐";
};

const formatAgo = (
  iso: string,
  t: (key: string, values?: Record<string, number>) => string
): string => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.round((now - then) / 1000));
  if (diffSec < 60) return t("ago_seconds", { n: diffSec });
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return t("ago_minutes", { n: diffMin });
  const diffHour = Math.round(diffMin / 60);
  return t("ago_hours", { n: diffHour });
};

const MiniSparkline = ({
  timeline,
  color,
}: {
  timeline: { currentScans: number }[];
  color: string;
}) => {
  if (timeline.length < 2) return null;
  const width = 120;
  const height = 36;
  const max = Math.max(...timeline.map((p) => p.currentScans), 1);
  const step = width / (timeline.length - 1);
  const points = timeline
    .map((p, i) => {
      const x = i * step;
      const y = height - (p.currentScans / max) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

interface LiveAnalyticsProps {
  qrCodeName: string;
}

export const LiveAnalytics = ({ qrCodeName }: LiveAnalyticsProps) => {
  const t = useTranslations("realtime");
  const [live, setLive] = useState(false);
  const [, setTick] = useState(0);
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [heatPoints, setHeatPoints] = useState<
    Array<{ lat: number; lng: number; weight?: number }>
  >([]);
  const [exporting, setExporting] = useState(false);

  const { scans, connected } = useScanStream(live);

  // Re-render pour mettre à jour les "il y a Xs" sur les scans live
  useEffect(() => {
    if (!live) return;
    const interval = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(interval);
  }, [live]);

  // Chargement comparaison 30j vs 30j précédents
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/analytics/compare?days=30");
        if (!res.ok) return;
        const json = (await res.json()) as CompareResponse;
        if (!cancelled) setCompareData(json);
      } catch {
        // silencieux
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Chargement heatmap globale (90j)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/analytics/heatmap");
        if (!res.ok) return;
        const json = (await res.json()) as HeatmapPointsResponse;
        if (!cancelled) {
          setHeatPoints(
            json.points.map(([lat, lng, w]) => ({ lat, lng, weight: w }))
          );
        }
      } catch {
        // silencieux
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExportPDF = useCallback(async () => {
    if (!compareData) return;
    setExporting(true);
    try {
      const reportData: ReportData = {
        qrCodeName,
        periodStart: new Date(compareData.current.start),
        periodEnd: new Date(compareData.current.end),
        totalScans: compareData.current.totalScans,
        uniqueCountries: compareData.current.uniqueCountries,
        topCountries: [],
        topDevices: compareData.current.topDevice
          ? [{ device: compareData.current.topDevice, count: 0 }]
          : [],
        topBrowsers: compareData.current.topBrowser
          ? [{ browser: compareData.current.topBrowser, count: 0 }]
          : [],
        timeline: compareData.timeline.map((p) => ({
          date: p.date,
          scans: p.currentScans,
        })),
      };
      const blob = generateAnalyticsPDF(reportData);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qraft-report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(t("exported"));
    } catch {
      toast.error(t("exporting"));
    } finally {
      setExporting(false);
    }
  }, [compareData, qrCodeName, t]);

  const deltaPositive = (compareData?.delta.scansPercent ?? 0) >= 0;
  const displayedScans = useMemo(() => scans.slice(0, 20), [scans]);

  return (
    <div className="space-y-6">
      {/* ── Toggle Live ───────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between p-4 flex-wrap gap-3"
        style={{ background: "var(--card)", border: "var(--rule)" }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: live && connected ? "var(--red)" : "var(--light)",
              boxShadow:
                live && connected ? "0 0 0 4px rgba(212,41,15,0.18)" : "none",
              animation: live && connected ? "pulse 1.4s infinite" : "none",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--ink)",
            }}
          >
            {t("title_live")}
          </span>
          {live && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: connected ? "var(--red)" : "var(--mid)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              — {connected ? t("connected") : t("disconnected")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLive((v) => !v)}
            className="btn btn-sm"
            style={{
              background: live ? "var(--ink)" : "var(--red)",
              color: "var(--bg)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "0.5rem 1rem",
              border: "none",
            }}
          >
            {live ? t("toggle_off") : t("toggle_on")}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting || !compareData}
            className="btn btn-sm"
            style={{
              background: "transparent",
              color: "var(--ink)",
              border: "var(--rule-thin)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "0.5rem 1rem",
            }}
          >
            {exporting ? t("exporting") : t("export_pdf")}
          </button>
        </div>
      </div>

      {/* ── Live feed ─────────────────────────────────────────────────── */}
      {live && (
        <div
          className="p-5"
          style={{ background: "var(--card)", border: "var(--rule)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
                fontSize: "1.4rem",
                letterSpacing: "0.04em",
                color: "var(--ink)",
                margin: 0,
              }}
            >
              {t("title_live")}
            </h3>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: "var(--mid)",
              }}
            >
              {scans.length}
            </span>
          </div>
          {displayedScans.length === 0 ? (
            <p
              style={{
                color: "var(--mid)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                textAlign: "center",
                padding: "2rem 0",
              }}
            >
              {t("no_scans_yet")}
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {displayedScans.map((scan: LiveScan) => (
                <li
                  key={scan.id}
                  className="live-scan-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    padding: "0.55rem 0",
                    borderBottom: "var(--rule-thin)",
                    animation: "liveSlideIn 0.35s ease-out",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>
                    {flagEmoji(scan.country)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "var(--ink)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {scan.city ?? "—"}
                      {scan.country ? `, ${scan.country}` : ""}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color: "var(--mid)",
                      }}
                    >
                      {scan.device} · {scan.browser} · {scan.qrCodeName}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "var(--light)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatAgo(scan.createdAt, t)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Comparaison 30j vs 30j précédents ─────────────────────────── */}
      {compareData && (
        <div
          className="p-5"
          style={{ background: "var(--card)", border: "var(--rule)" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--mid)",
                  marginBottom: "0.25rem",
                }}
              >
                {t("period_comparison")}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
                <span
                  style={{
                    fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
                    fontSize: "3rem",
                    lineHeight: 1,
                    color: "var(--ink)",
                  }}
                >
                  {compareData.current.totalScans}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: deltaPositive ? "var(--red)" : "var(--mid)",
                  }}
                >
                  {deltaPositive ? "↑" : "↓"}{" "}
                  {Math.abs(compareData.delta.scansPercent).toFixed(1)}%
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--mid)",
                  marginTop: "0.35rem",
                }}
              >
                {t("vs_previous")} ({compareData.previous.totalScans})
              </p>
            </div>
            <div>
              <MiniSparkline
                timeline={compareData.timeline}
                color="var(--red)"
              />
            </div>
          </div>
          <div
            className="grid grid-cols-3 gap-3 mt-5"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <div>
              <p style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)" }}>
                {t("scans_total")}
              </p>
              <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)" }}>
                {compareData.current.totalScans}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)" }}>
                {t("unique_countries")}
              </p>
              <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)" }}>
                {compareData.current.uniqueCountries}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)" }}>
                {t("unique_cities")}
              </p>
              <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)" }}>
                {compareData.current.uniqueCities}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Heatmap globale ────────────────────────────────────────────── */}
      <div
        className="p-5"
        style={{ background: "var(--card)", border: "var(--rule)" }}
      >
        <div className="mb-3">
          <h3
            style={{
              fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
              fontSize: "1.4rem",
              letterSpacing: "0.04em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {t("heatmap_title")}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--mid)",
              marginTop: "0.2rem",
            }}
          >
            {t("heatmap_subtitle")}
          </p>
        </div>
        <HeatmapView points={heatPoints} />
      </div>

      <style jsx>{`
        @keyframes liveSlideIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 0 0 4px rgba(212, 41, 15, 0.18);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(212, 41, 15, 0.28);
          }
        }
      `}</style>
    </div>
  );
};
