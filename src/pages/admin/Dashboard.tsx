import React, { useEffect, useMemo, useState } from "react";
import { AdminApi, AdminStats } from "../../apis/admin.api";
import MonthlyRevenueChart from "./components/MonthlyRevenueChart";
import DataTransferPanel from "../../components/DataTransferPanel";

const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await AdminApi.stats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError("Khong tai duoc thong ke. Vui long thu lai.");
    } finally {
      setLoading(false);
    }
  };

  const monthly = stats?.monthly ?? [];
  const maxRevenue = useMemo(() => {
    if (!monthly.length) return 0;
    return Math.max(...monthly.map((m: any) => Number(m.revenue || 0)));
  }, [monthly]);

  const cards = [
    { label: "Doanh thu", value: stats?.revenue ?? 0, formatter: formatCurrency },
    { label: "Tong don hang", value: stats?.orders ?? 0 },
    { label: "Don dang cho", value: stats?.pendingOrders ?? 0 },
    { label: "Khach hang", value: stats?.customers ?? 0 },
    { label: "San pham", value: stats?.products ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">
            Tong quan doanh thu va hoat dong ban hang
          </p>
        </div>
        <button
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={fetchStats}
          disabled={loading}
        >
          {loading ? "Dang tai..." : "Lam moi"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {card.formatter ? card.formatter(card.value) : card.value.toLocaleString("vi-VN")}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Doanh thu 12 thang gan nhat
          </h2>
          <span className="text-xs text-slate-500">
            Don da duyet: {stats?.approvedOrders ?? 0}
          </span>
        </div>
        <MonthlyRevenueChart data={monthly} />
      </div>

      <DataTransferPanel mode="admin" />
    </div>
  );
}
