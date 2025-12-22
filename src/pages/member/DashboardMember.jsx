import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Pastikan install react-router-dom
import api from "../../api/apiClient";
import { 
  Users, Building2, ClipboardList, Home, 
  Calendar, UserCog, Wallet, ArrowRight 
} from "lucide-react";

export default function DashboardMember() {
  const [stats, setStats] = useState({ 
    cabuysCount: 0, 
    projectCount: 0, 
    surveyCount: 0, 
    propertyCount: 0 
  });
  const [memberName, setMemberName] = useState("Member");
  const [loading, setLoading] = useState(true);

  // --- UTILS: TANGGAL & SAPAAN ---
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
    // 1. Ambil Nama dari LocalStorage
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setMemberName(parsed.nama_member || parsed.nama || parsed.name || "Member");
      }
    } catch { }

    // 2. Fetch Stats
    let cancelled = false;
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await api.get("/dashboard"); // Pastikan endpoint member dashboard benar
        if (!cancelled) setStats(res.data || {});
      } catch (err) {
        console.warn("Gagal load dashboard member:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

  const cards = [
    { 
      title: "Leads Saya", 
      count: stats.cabuysCount || 0, 
      icon: <Users size={24} />, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      desc: "Calon pembeli yang Anda input"
    },
    { 
      title: "Proyek Tersedia", 
      count: stats.projectCount || 0, 
      icon: <Building2 size={24} />, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50",
      desc: "Total proyek yang bisa dipasarkan"
    },
    { 
      title: "Jadwal Survei", 
      count: stats.surveyCount || 0, 
      icon: <ClipboardList size={24} />, 
      color: "text-purple-600", 
      bg: "bg-purple-50",
      desc: "Kunjungan lokasi mendatang"
    },
    { 
      title: "Unit Properti", 
      count: stats.propertyCount || 0, 
      icon: <Home size={24} />, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      desc: "Total unit siap jual"
    },
  ];

  // --- SKELETON LOADING ---
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
            {getGreeting()}, <span className="text-blue-600">{memberName}</span>! 👋
          </h1>
          <p className="text-gray-500 mt-2">
            Semangat jualan! Pantau terus leads dan komisi Anda.
          </p>
        </div>

        {/* TOMBOL KE PROFIL */}
        <Link 
          to="/member/profile" // <-- Ganti route ini sesuai router kamu
          className="flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 border border-gray-200 shadow-sm transition-all"
        >
          <UserCog size={18} /> Edit Profil Saya
        </Link>
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
            </div>

            <div>
              <h3 className="text-gray-500 text-sm font-medium">{c.title}</h3>
              <div className="text-3xl font-bold text-gray-800 mt-1 mb-1">{fmt(c.count)}</div>
              <p className="text-xs text-gray-400">{c.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* QUICK ACTIONS FOR MEMBER */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          ⚡ Mulai Aktivitas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          <QuickActionCard 
            to="/member/leads" 
            title="Input Leads Baru" 
            desc="Tambah calon pembeli potensial"
            icon={<Users size={20} />}
            color="bg-blue-50 text-blue-600"
          />
          
          <QuickActionCard 
            to="/member/komisi" 
            title="Cek Komisi" 
            desc="Lihat pendapatan Anda"
            icon={<Wallet size={20} />}
            color="bg-green-50 text-green-600"
          />

          <QuickActionCard 
            to="/member/properti" 
            title="Cari Properti" 
            desc="Lihat stok unit untuk dijual"
            icon={<Home size={20} />}
            color="bg-orange-50 text-orange-600"
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