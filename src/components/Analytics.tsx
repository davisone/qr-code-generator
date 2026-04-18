"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AnalyticsData {
  totalScans: number;
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
  dailyData: { date: string; scans: number }[];
  deviceStats: { name: string; value: number }[];
  browserStats: { name: string; value: number }[];
  osStats: { name: string; value: number }[];
  recentScans: {
    id: string;
    scannedAt: string;
    device: string | null;
    browser: string | null;
    os: string | null;
    country: string | null;
    city: string | null;
  }[];
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const ProGate = ({ isPro, children }: { isPro: boolean; children: React.ReactNode }) => {
  if (isPro) return <>{children}</>;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ filter: "blur(6px)", pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "0.75rem",
        background: "rgba(26, 20, 16, 0.55)",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f0ebe1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.08em", color: "#f0ebe1",
        }}>
          Fonctionnalité Pro
        </p>
        <Link href="/pricing" style={{
          fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.08em",
          background: "var(--red)", color: "white", padding: "0.5rem 1.25rem",
          textDecoration: "none",
        }}>
          Passer Pro →
        </Link>
      </div>
    </div>
  );
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Analytics({ qrCodeId, isPro = false }: { qrCodeId: string; isPro?: boolean }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/qrcodes/${qrCodeId}/analytics`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Impossible de charger les analytics"))
      .finally(() => setLoading(false));
  }, [qrCodeId]);

  if (loading) {
    return (
      <div className="bento-card p-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a0a0a]"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bento-card p-6">
        <p className="text-[#525252] text-center">{error || "Aucune donnée"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bento-card p-4 text-center">
          <p className="text-3xl font-bold text-[#0a0a0a]">{data.totalScans}</p>
          <p className="text-sm text-[#525252]">Total scans</p>
        </div>
        <div className="bento-card p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{data.scansToday}</p>
          <p className="text-sm text-[#525252]">Aujourd&apos;hui</p>
        </div>
        <div className="bento-card p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{data.scansThisWeek}</p>
          <p className="text-sm text-[#525252]">Cette semaine</p>
        </div>
        <div className="bento-card p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{data.scansThisMonth}</p>
          <p className="text-sm text-[#525252]">Ce mois</p>
        </div>
      </div>

      {/* Daily Chart */}
      <ProGate isPro={isPro}>
        <div className="bento-card p-6">
          <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4">
            Scans des 30 derniers jours
          </h3>
          {data.dailyData.some((d) => d.scans > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.dailyData}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12, fill: "#525252" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#525252" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  labelFormatter={(label) => formatDate(label as string)}
                  formatter={(value) => [value, "Scans"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScans)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-[#a3a3a3]">
              Aucun scan enregistré pour cette période
            </div>
          )}
        </div>
      </ProGate>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Device Stats */}
          <ProGate isPro={isPro}>
            <div className="bento-card p-6">
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4">Appareils</h3>
              {data.deviceStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.deviceStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.deviceStats.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value) =>
                        value.charAt(0).toUpperCase() + value.slice(1)
                      }
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[#a3a3a3] text-center">Aucune donnée</p>
              )}
            </div>
          </ProGate>

          {/* Browser Stats */}
          <ProGate isPro={isPro}>
            <div className="bento-card p-6">
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4">Navigateurs</h3>
              {data.browserStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.browserStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.browserStats.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[#a3a3a3] text-center">Aucune donnée</p>
              )}
            </div>
          </ProGate>

          {/* OS Stats */}
          <ProGate isPro={isPro}>
            <div className="bento-card p-6">
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4">
                Systèmes d&apos;exploitation
              </h3>
              {data.osStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.osStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.osStats.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[#a3a3a3] text-center">Aucune donnée</p>
              )}
            </div>
          </ProGate>
      </div>

      {/* Recent Scans */}
      <ProGate isPro={isPro}>
        <div className="bento-card p-6">
          <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4">
            Derniers scans
          </h3>
          {data.recentScans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#525252] border-b border-[#e5e5e5]">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Appareil</th>
                    <th className="pb-3 font-medium">Navigateur</th>
                    <th className="pb-3 font-medium">OS</th>
                    <th className="pb-3 font-medium">Pays</th>
                    <th className="pb-3 font-medium">Ville</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentScans.map((scan) => (
                    <tr
                      key={scan.id}
                      className="border-b border-[#f5f5f5] last:border-0"
                    >
                      <td className="py-3 text-[#0a0a0a]">
                        {formatDateTime(scan.scannedAt)}
                      </td>
                      <td className="py-3">
                        <span className="badge badge-gray">
                          {scan.device || "—"}
                        </span>
                      </td>
                      <td className="py-3 text-[#525252]">{scan.browser || "—"}</td>
                      <td className="py-3 text-[#525252]">{scan.os || "—"}</td>
                      <td className="py-3 text-[#525252]">{scan.country || "—"}</td>
                      <td className="py-3 text-[#525252]">{scan.city || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#a3a3a3] text-center py-8">Aucun scan enregistré</p>
          )}
        </div>
      </ProGate>
    </div>
  );
}
