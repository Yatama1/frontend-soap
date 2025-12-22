// src/pages/admin/DashboardAdmin.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import api from "../../api/apiClient";
import { 
  Users, Building2, ClipboardList, Home, 
  TrendingUp, Calendar, ArrowRight, Settings,
  ShieldCheck, FilePlus 
} from "lucide-react";

export default function DashboardAdmin() {
  const [stats, setStats] = useState({ 
    senior_leaderCount: 0, 
    rumahCount: 0, 
    surveyCount: 0, 
    propertiCount: 0 
  });
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);

  // --- UTILS: TANGGAL & WAKTU ---
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

  useEffect(() => {
    // 1. Ambil Nama Admin dari LocalStorage
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        // Cek berbagai kemungkinan key nama
        const name = parsed.nama_admin || parsed.nama || parsed.name || "Administrator";
        setAdminName(name);
      }
    } catch (e) {
      console.error("Gagal parse user:", e);
    }

    // 2. Fetch Data Dashboard
    let cancelled = false;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get("/dashboard"); // Pastikan endpoint ini benar untuk admin
        if (!cancelled) setStats(res.data || {});
      } catch (err) {
        console.warn("Gagal load dashboard admin:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

  // Definisi Kartu Statistik
  const cards = [
    { 
      title: "Total Members", 
      count: stats.senior_leaderCount || 0, // Sesuaikan key dari backend
      icon: <Users size={24} />, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      desc: "Senior Leader & Member aktif"
    },
    { 
      title: "Data Rumah", 
      count: stats.rumahCount || 0, 
      icon: <Building2 size={24} />, 
      color: "text-green-600", 
      bg: "bg-green-50",
      desc: "Unit rumah terdaftar"
    },
    { 
      title: "Total Survei", 
      count: stats.surveyCount || 0, 
      icon: <ClipboardList size={24} />, 
      color: "text-yellow-600", 
      bg: "bg-yellow-50",
      desc: "Aktivitas kunjungan lokasi"
    },
    { 
      title: "Properti / Area", 
      count: stats.propertiCount || 0, 
      icon: <Home size={24} />, 
      color: "text-red-600", 
      bg: "bg-red-50",
      desc: "Listing properti tersedia"
    },
  ];

  // --- LOADING SKELETON ---
  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/30 font-sans">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
            <Calendar size={16} /> {today}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {getGreeting()}, <span className="text-blue-600">{adminName}</span>! 👋
          </h1>
          <p className="text-gray-500 mt-2">
            Panel kendali utama untuk memantau keseluruhan sistem.
          </p>
        </div>
        
        {/* Tombol Pengaturan (Opsional) */}
        <button className="hidden md:flex items-center gap-2 bg-white text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 border border-gray-200 transition shadow-sm">
          <Settings size={18} /> Pengaturan Sistem
        </button>
      </header>

      {/* STATS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {cards.map((c, i) => (
          <div 
            key={i} 
            className="group bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
          >
            {/* Dekorasi Background */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${c.bg}`}></div>

            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${c.bg} ${c.color}`}>
                {c.icon}
              </div>
              {/* Dummy Trend Indicator */}
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp size={12} />
                Aktif
              </div>
            </div>

            <div>
              <h3 className="text-gray-500 text-sm font-medium">{c.title}</h3>
              <div className="text-3xl font-bold text-gray-800 mt-1 mb-1">{fmt(c.count)}</div>
              <p className="text-xs text-gray-400">{c.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ADMIN QUICK ACTIONS (Menu Cepat) */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          ⚡ Manajemen Cepat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          <QuickActionCard 
            to="/admin/rumah" // Sesuaikan route
            title="Kelola Rumah" 
            desc="Tambah atau edit rumah"
            icon={<ShieldCheck size={20} />}
            color="bg-blue-50 text-blue-600"
          />
          
          <QuickActionCard 
            to="/admin/PropertiAdmin" // Sesuaikan route
            title="Input Properti" 
            desc="Tambah listing baru"
            icon={<Building2 size={20} />}
            color="bg-green-50 text-green-600"
          />

          <QuickActionCard 
            to="/admin/laporan" // Sesuaikan route
            title="Buat Laporan" 
            desc="Rekap aktivitas bulanan"
            icon={<FilePlus size={20} />}
            color="bg-purple-50 text-purple-600"
          />

        </div>
      </section>

    </div>
  );
}

// Sub-Component Kartu Menu
function QuickActionCard({ to, title, desc, icon, color }) {
  return (
    <Link 
      to={to}
      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}