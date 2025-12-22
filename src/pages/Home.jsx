import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
// PERBAIKAN 1: Menggunakan alias 'HomeIcon' agar tidak bentrok dengan nama fungsi 'Home'
import { Search, MapPin, Building2, ArrowRight, Home as HomeIcon, Phone, Mail } from "lucide-react";

export default function Home() {
  const [allProperti, setAllProperti] = useState([]);
  const [properti, setProperti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/properti");
        if (!res.ok) throw new Error("Gagal mengambil data properti");
        const json = await res.json();
        const list = json?.data || [];
        setAllProperti(list);
        setProperti(list);
      } catch (err) {
        console.error(err);
        setError("Tidak dapat memuat data properti.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  /* ================= SEARCH ================= */
  const handleSearch = () => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setProperti(allProperti);
      return;
    }
    const filtered = allProperti.filter((p) =>
      [p.nama_properti, p.lokasi, p.kontraktor]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
    setProperti(filtered);
  };

  return (
    <section className="w-full min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
      <Navbar />

      {/* ================= HERO SECTION (PERFORMANCE OPTIMIZED) ================= */}
      {/* Menggunakan Radial Gradient bawaan CSS yang ringan dirender oleh browser */}
      <div className="relative bg-slate-900 text-white py-24 px-6 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-200 text-xs font-semibold tracking-wider uppercase mb-6">
            Platform Informasi Properti Terpercaya
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            Jelajahi Proyek <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Perumahan & Hunian
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base md:text-lg mb-10 leading-relaxed">
            Dapatkan informasi lengkap mengenai proyek perumahan, spesifikasi unit, 
            dan kontraktor resmi tanpa perantara.
          </p>

          {/* SEARCH BAR RINGAN (Tanpa backdrop-blur) */}
          <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Cari lokasi, nama proyek, atau kontraktor..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* ================= CONTENT SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 w-full flex-1">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-gray-200 pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="text-blue-600" /> Daftar Proyek
            </h2>
            <p className="text-slate-500 mt-2 text-sm md:text-base">
              Menampilkan {properti.length} proyek properti yang tersedia.
            </p>
          </div>
          
          {search && (
            <button 
              onClick={() => { setSearch(""); handleSearch(); }}
              className="text-sm text-red-500 hover:underline"
            >
              Hapus pencarian "{search}"
            </button>
          )}
        </div>

        {/* LOADING & ERROR STATES */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && properti.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-medium">Tidak ada properti yang ditemukan.</p>
            <button onClick={() => { setSearch(""); setProperti(allProperti); }} className="mt-2 text-blue-600 font-medium hover:underline">
              Lihat semua properti
            </button>
          </div>
        )}

        {/* PROPERTY GRID (CATALOG STYLE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {properti.map((p) => (
            <div
              key={p.id_properti}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Card Header Visual - Menggunakan warna solid/gradient ringan menggantikan gambar berat */}
              <div className="h-36 bg-slate-50 relative flex items-center justify-center border-b border-gray-50">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-white opacity-50"></div>
                {/* Icon Placeholder */}
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 relative z-10">
                   <Building2 size={28} />
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {p.nama_properti}
                  </h3>
                  <div className="flex items-start gap-2 text-sm text-slate-500 mt-2">
                    <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{p.lokasi || "Lokasi belum ditentukan"}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-6 line-clamp-3 leading-relaxed h-16">
                  {p.deskripsi || "Informasi detail mengenai proyek ini dapat dilihat pada halaman detail."}
                </p>

                <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg max-w-[140px]">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                    <span className="truncate">{p.kontraktor || "Official Partner"}</span>
                  </div>
                  
                  <Link
                    to={`/properti/${p.id_properti}`}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Detail <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
              {/* PERBAIKAN 2: Menggunakan alias 'HomeIcon' */}
              <HomeIcon className="text-blue-500" /> SOAP Property
            </h2>
            <p className="text-sm leading-relaxed max-w-sm">
              Platform sistem informasi properti terintegrasi. Kami menyajikan data proyek perumahan, 
              detail unit, dan informasi kontraktor secara transparan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigasi</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition">Beranda</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition">Daftar Proyek</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition">Tentang Kami</Link></li>
              
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" />
                <span>Kediri</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-blue-500" />
                <span></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-blue-500" />
                <span>soap@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SOAP Property Platform. All rights reserved.
        </div>
      </footer>
    </section>
  );
}