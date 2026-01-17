import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/apiClient";
import {
  Users, Building2, ClipboardList, Home,
  Calendar, FileText, ArrowRight, UserPlus,
  BarChart3, Briefcase
} from "lucide-react";

export default function DashboardSenior() {
  const [stats, setStats] = useState({
    leaderCount: 0,
    projectCount: 0,
    surveyCount: 0,
    propertiCount: 0
  });
  const [seniorName, setSeniorName] = useState("Senior Leader");
  const [initial, setInitial] = useState("S");
  const [loading, setLoading] = useState(true);

  // --- 1. UTILS WAKTU & SAPAAN ---
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  // --- 2. FETCH DATA ---
  useEffect(() => {
    // Ambil Nama User
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const name = parsed.nama_member || parsed.name || parsed.nama || "Senior";
        setSeniorName(name);
        setInitial(name.charAt(0).toUpperCase());
      }
    } catch { }

    // Fetch Dashboard Stats
    let cancelled = false;
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await api.get("/dashboard");
        if (!cancelled) setStats(res.data || {});
      } catch (err) {
        console.warn("Gagal ambil dashboard:", err);
        // Fallback stats
        if (!cancelled) setStats({ leaderCount: 0, projectCount: 0, surveyCount: 0, propertiCount: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

  // Definisi Kartu Statistik (Disesuaikan untuk Senior)
  const cards = [
    {
      title: "Total Leader",
      count: stats.leaderCount,
      icon: <Users size={24} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      desc: "Leader di bawah supervisi Anda"
    },
    {
      title: "Proyek Aktif",
      count: stats.projectCount,
      icon: <Building2 size={24} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      desc: "Total proyek berjalan"
    },
    {
      title: "Total Survei",
      count: stats.surveyCount,
      icon: <ClipboardList size={24} />,
      color: "text-purple-600",
      bg: "bg-purple-50",
      desc: "Aktivitas lapangan tim"
    },
    {
      title: "Stok Properti",
      count: stats.propertiCount,
      icon: <Home size={24} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      desc: "Unit tersedia untuk dijual"
    },
  ];

  // Loading Screen
  if (loading) return <div className="p-8 text-gray-500">Memuat dashboard...</div>;

  return (
    <div className="min-h-screen bg-white font-sans">


      <div className="p-8 max-w-7xl mx-auto">

        {/* --- BAGIAN 2: HERO SECTION --- */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Calendar size={16} />
            {today}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {getGreeting()}, <span className="text-indigo-600">{seniorName}!</span> 👋
              </h1>
              <p className="text-gray-500">
                Pantau kinerja seluruh Leader dan progres proyek hari ini.
              </p>
            </div>

            {/* Tombol Laporan */}
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200">
              <FileText size={18} /> Laporan Bulanan
            </button>
          </div>
        </div>

        {/* --- BAGIAN 3: STATISTIK CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((c, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all">
              <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.color} flex items-center justify-center mb-4`}>
                {c.icon}
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{c.title}</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">{fmt(c.count)}</div>
              <p className="text-xs text-gray-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* --- BAGIAN 4: AKSES CEPAT (SENIOR MENU) --- */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            ⚡ Kelola Organisasi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <QuickActionCard
              to="/senior/leader" // Sesuaikan route
              title="Kelola Leader"
              desc="Tambah atau monitoring Tim Leader"
              icon={<UserPlus size={20} />}
              color="text-blue-600 bg-blue-50"
            />
            <QuickActionCard
              to="/senior/performance" // Sesuaikan route
              title="Analisis Performa"
              desc="Lihat statistik penjualan tim"
              icon={<BarChart3 size={20} />}
              color="text-indigo-600 bg-indigo-50"
            />
            <QuickActionCard
              to="/senior/projects" // Sesuaikan route
              title="Master Proyek"
              desc="Kelola data proyek perumahan"
              icon={<Briefcase size={20} />}
              color="text-emerald-600 bg-emerald-50"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

// Komponen Kartu Bawah
function QuickActionCard({ to, title, desc, icon, color }) {
  return (
    <Link to={to} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <div className="font-semibold text-gray-800">{title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
        </div>
      </div>
      <ArrowRight className="text-gray-300 group-hover:text-indigo-500 transition" size={18} />
    </Link>
  );
}