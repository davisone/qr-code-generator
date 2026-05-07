"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AdminStats {
  kpis: {
    totalUsers: number;
    newUsersThisMonth: number;
    proUsers: number;
    conversionRate: string;
    mrr: number;
    totalQRCodes: number;
    scansThisMonth: number;
    totalScans: number;
  };
  charts: {
    dailySignups: { date: string; count: number }[];
    dailyScans: { date: string; count: number }[];
  };
  tables: {
    recentUsers: {
      id: string;
      name: string | null;
      email: string;
      createdAt: string;
      stripeStatus: string | null;
      _count: { qrCodes: number };
    }[];
    subscriptions: {
      id: string;
      name: string | null;
      email: string;
      stripeStatus: string | null;
      stripePriceId: string | null;
      stripeCurrentPeriodEnd: string | null;
    }[];
  };
}

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-white">{value}</p>
      {sub && <p className="mt-1 text-sm text-emerald-400">{sub}</p>}
    </div>
  );
}

function formatDate(label: unknown) {
  return new Date(String(label)).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function StatusBadge({ status }: { status: string | null }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-400/10 text-emerald-400",
    canceled: "bg-red-400/10 text-red-400",
    past_due: "bg-orange-400/10 text-orange-400",
  };
  const color = colors[status ?? ""] ?? "bg-white/10 text-white/50";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {status ?? "free"}
    </span>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data: AdminStats) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  if (!stats) {
    return (
      <p className="text-center text-white/50 mt-20">
        Erreur lors du chargement des données.
      </p>
    );
  }

  const { kpis, charts, tables } = stats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Dashboard Admin
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Vue d'ensemble de l'activité useqraft
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Utilisateurs"
          value={kpis.totalUsers}
          sub={`+${kpis.newUsersThisMonth} ce mois`}
        />
        <KpiCard
          label="Pro"
          value={kpis.proUsers}
          sub={`${kpis.conversionRate}% conversion`}
        />
        <KpiCard label="MRR" value={`${kpis.mrr.toFixed(2)} EUR`} />
        <KpiCard label="QR Codes" value={kpis.totalQRCodes} />
        <KpiCard
          label="Scans ce mois"
          value={kpis.scansThisMonth}
          sub={`${kpis.totalScans} total`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 text-sm font-medium text-white/70">
            Inscriptions (30 jours)
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={charts.dailySignups}>
              <defs>
                <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#fff",
                }}
                labelFormatter={formatDate}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#signupFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 text-sm font-medium text-white/70">
            Scans (30 jours)
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={charts.dailyScans}>
              <defs>
                <linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#fff",
                }}
                labelFormatter={formatDate}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#scanFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 text-sm font-medium text-white/70">
            Utilisateurs récents
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/40">
                  <th className="pb-3 pr-4 font-medium">Nom</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Inscription</th>
                  <th className="pb-3 pr-4 font-medium">Statut</th>
                  <th className="pb-3 font-medium">QR Codes</th>
                </tr>
              </thead>
              <tbody>
                {tables.recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 text-white/70">
                    <td className="py-3 pr-4">{user.name ?? "—"}</td>
                    <td className="py-3 pr-4 text-white/50">{user.email}</td>
                    <td className="py-3 pr-4">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={user.stripeStatus} />
                    </td>
                    <td className="py-3">{user._count.qrCodes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 text-sm font-medium text-white/70">Abonnements</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/40">
                  <th className="pb-3 pr-4 font-medium">Nom</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Statut</th>
                  <th className="pb-3 font-medium">Fin de période</th>
                </tr>
              </thead>
              <tbody>
                {tables.subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-white/30">
                      Aucun abonnement
                    </td>
                  </tr>
                ) : (
                  tables.subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-white/5 text-white/70">
                      <td className="py-3 pr-4">{sub.name ?? "—"}</td>
                      <td className="py-3 pr-4 text-white/50">{sub.email}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={sub.stripeStatus} />
                      </td>
                      <td className="py-3">
                        {sub.stripeCurrentPeriodEnd
                          ? new Date(sub.stripeCurrentPeriodEnd).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
