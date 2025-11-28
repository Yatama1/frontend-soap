// src/pages/leader/DashboardLeader.jsx
import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import { Users, Building2, ClipboardList, Home } from "lucide-react";

export default function DashboardLeader() {
  const [stats, setStats] = useState({ memberCount: 0, projectCount: 0, surveyCount: 0, propertyCount: 0 });
  const [leaderName, setLeaderName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const name = parsed.nama || parsed.name || parsed.nama_member || parsed.fullname || parsed.full_name;
        setLeaderName(name || "Leader");
      }
    } catch {}

    let cancelled = false;
    async function fetchStats() {
      setLoading(true);
      try {
        // ganti path jika backend anda menyediakan route berbeda
        const res = await api.get("/dashboard");
        if (!cancelled) setStats(res.data || {});
      } catch (err) {
        console.warn("Gagal ambil dashboard:", err?.response?.status || err.message);
        if (!cancelled) setStats({ memberCount: 0, projectCount: 0, surveyCount: 0, propertyCount: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const cards = [
    { title: "Leads", count: stats.cabuyCount || 0, icon: <Users size={26} />, colorClass: "bg-blue-50" },
    { title: "Proyek", count: stats.projectCount || 0, icon: <Building2 size={26} />, colorClass: "bg-green-50" },
    { title: "Surve", count: stats.surveyCount || 0, icon: <ClipboardList size={26} />, colorClass: "bg-yellow-50" },
    { title: "Properti", count: stats.propertyCount || 0, icon: <Home size={26} />, colorClass: "bg-red-50" },
  ];

  const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="min-h-[70vh]">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">Dashboard Senior Leader</h1>
        <p className="text-sm text-gray-500 mt-1">Selamat datang kembali, <span className="font-medium">{leaderName}</span>!</p>
      </header>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Memuat data...</div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <div key={i} className={`flex items-center justify-between p-5 rounded-2xl shadow-sm ${c.colorClass}`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                  <div className="text-blue-600">{c.icon}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">{c.title}</div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{fmt(c.count)}</div>
                </div>
              </div>
              <div className="text-sm text-green-600 hidden md:block">+{Math.floor(Math.random() * 20)}%</div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
