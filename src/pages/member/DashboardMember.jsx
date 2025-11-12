import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import { Users, Building2, ClipboardList, Home } from "lucide-react";

export default function DashboardMember() {
  const [stats, setStats] = useState({ cabuysCount: 0, projectCount: 0, surveyCount: 0, propertyCount: 0 });
  const [memberName, setMemberName] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setMemberName(JSON.parse(raw).nama_member || JSON.parse(raw).name || "Member");
    } catch { }
    api.get("/dashboard").then(r => setStats(r.data || {})).catch(() => { });
  }, []);

  const cards = [
    { title: "Leads", count: stats.cabuysCount || 1234, icon: <Users size={55} strokeWidth={2.5} />, colorClass: "bg-gray-900" },
    { title: "Proyek", count: stats.projectCount || 56, icon: <Building2 size={55} strokeWidth={2.5} />, colorClass: "bg-gray-900" },
    { title: "Surve", count: stats.surveyCount || 342, icon: <ClipboardList size={55} strokeWidth={2.5} />, colorClass: "bg-gray-900" },
    { title: "Properti", count: stats.propertyCount || 289, icon: <Home size={55} strokeWidth={2.5} />, colorClass: "bg-gray-900" },
  ];

  const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="min-h-[70vh]">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-red-600">Dashboard Member</h1>
        <p className="text-sm text-gray-400 mt-1">Selamat datang kembali! Berikut adalah ringkasan aktivitas Anda hari ini.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className={`flex items-center justify-between p-5 rounded-lg shadow-sm ${c.colorClass}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm">
                <div className="text-red-600">{c.icon}</div>
              </div>
              <div>
                <div className="text-base text-gray-400">{c.title}</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-200 mt-1">{fmt(c.count)}</div>
              </div>
            </div>
            <div className="text-sm text-green-600 hidden md:block">+{Math.floor(Math.random() * 20)}%</div>
          </div>
        ))}
      </section>

      {/* Example main area to mimic screenshot white cards */}

    </div>
  );
}