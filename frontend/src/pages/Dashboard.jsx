import { useEffect, useState } from "react";
import {
  Chart as ChartJS, ArcElement, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { FaDesktop, FaExclamationTriangle, FaFireAlt, FaCheckCircle } from "react-icons/fa";
import api from "../api/axios";
import StatCard from "../components/StatCard";

ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const STATUS_COLORS = {
  Aktif: "#22c55e",
  Pasif: "#6b7280",
  Bakimda: "#eab308",
  Arizali: "#ef4444",
};

const STATUS_LABELS = {
  Aktif: "Aktif", Pasif: "Pasif", Bakimda: "Bakımda", Arizali: "Arızalı",
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get("/dashboard/summary").then((res) => setSummary(res.data));
  }, []);

  if (!summary) {
    return <p className="text-gray-400">Yükleniyor...</p>;
  }

  const statusData = {
    labels: summary.byStatus.map((s) => STATUS_LABELS[s.status] || s.status),
    datasets: [
      {
        data: summary.byStatus.map((s) => s.c),
        backgroundColor: summary.byStatus.map((s) => STATUS_COLORS[s.status] || "#38bdf8"),
      },
    ],
  };

  const categoryData = {
    labels: summary.byCategory.map((c) => c.category),
    datasets: [
      {
        label: "Cihaz Sayısı",
        data: summary.byCategory.map((c) => c.c),
        backgroundColor: "#0ea5e9",
        borderRadius: 6,
      },
    ],
  };

  const months = [...new Set([
    ...summary.faultsPerMonth.map((f) => f.month),
    ...summary.resolvedPerMonth.map((f) => f.month),
  ])].sort();

  const trendData = {
    labels: months,
    datasets: [
      {
        label: "Açılan Arıza",
        data: months.map((m) => summary.faultsPerMonth.find((f) => f.month === m)?.opened || 0),
        borderColor: "#ef4444",
        backgroundColor: "#ef444433",
        tension: 0.3,
      },
      {
        label: "Çözülen Arıza",
        data: months.map((m) => summary.resolvedPerMonth.find((f) => f.month === m)?.resolved || 0),
        borderColor: "#22c55e",
        backgroundColor: "#22c55e33",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = { plugins: { legend: { labels: { color: "#d1d5db" } } }, scales: {
    x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
    y: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
  }};

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gösterge Paneli</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Toplam Cihaz" value={summary.totalDevices} icon={FaDesktop} gradient="from-cyan-600 to-cyan-400" />
        <StatCard label="Açık Arıza" value={summary.openFaults} icon={FaExclamationTriangle} gradient="from-yellow-500 to-yellow-300" />
        <StatCard label="Kritik/Yüksek Öncelikli" value={summary.criticalFaults} icon={FaFireAlt} gradient="from-red-600 to-red-400" />
        <StatCard label="Bu Ay Çözülen" value={summary.resolvedThisMonth} icon={FaCheckCircle} gradient="from-green-600 to-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Cihaz Durumu Dağılımı</h2>
          <div className="max-w-xs mx-auto">
            <Pie data={statusData} options={{ plugins: { legend: { labels: { color: "#d1d5db" } } } }} />
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Kategoriye Göre Cihaz Sayısı</h2>
          <Bar data={categoryData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Son 6 Ay Arıza Trendi</h2>
          <Line data={trendData} options={chartOptions} />
        </div>
        <div className="card">
          <h2 className="text-lg font-bold mb-4">En Çok Arıza Alan Cihazlar</h2>
          <ul className="space-y-3">
            {summary.topFaultyDevices.length === 0 && (
              <p className="text-sm text-gray-500">Henüz veri yok.</p>
            )}
            {summary.topFaultyDevices.map((d) => (
              <li key={d.id} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
                <span>{d.name}</span>
                <span className="badge bg-red-500/20 text-red-400">{d.fault_count} arıza</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
