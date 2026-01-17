import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Building2,
  ArrowRight,
  Home as HomeIcon,
  Phone,
  Mail,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";

/* ================= THEME HOOK ================= */
function useTheme() {
  const [theme, setTheme] = useState(localStorage.theme || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.theme = theme;
  }, [theme]);

  return [theme, setTheme];
}

/* ================= NAVBAR ================= */
function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useTheme();

  const isDark = theme === "dark";

  return (
    <nav
      className="fixed top-0 w-full z-50 backdrop-blur border-b"
      style={{
        backgroundColor: "var(--nav)",
        borderColor: "var(--border)"
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link className="flex items-center gap-2 font-extrabold">
          <HomeIcon className="text-[var(--primary)]" />
          SOAP Property
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link className="hover:text-[var(--primary)]">Beranda</Link>
          <Link className="hover:text-[var(--primary)]">Proyek</Link>
          <Link className="hover:text-[var(--primary)]">Tentang</Link>

          {/* TOGGLE THEME */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-xl border transition hover:scale-105"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--card)"
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            className="px-5 py-2 rounded-xl text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Hubungi
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden px-6 py-4 space-y-3 text-sm"
          style={{ backgroundColor: "var(--bg)" }}
        >
          <Link className="block">Beranda</Link>
          <Link className="block">Proyek</Link>
          <Link className="block">Tentang</Link>
        </div>
      )}
    </nav>
  );
}

/* ================= PAGE ================= */
export default function Home() {
  const [allProperti, setAllProperti] = useState([]);
  const [properti, setProperti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [totalRumah, setTotalRumah] = useState(0);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 ambil properti
        const res = await fetch("http://localhost:5000/api/properti");
        const json = await res.json();
        const list = json?.data || [];
        setAllProperti(list);
        setProperti(list);

        // 🔹 ambil rumah untuk badge
        const rumahRes = await fetch("http://localhost:5000/api/rumah");
        const rumahJson = await rumahRes.json();
        const rumahList = rumahJson?.data || rumahJson?.rumah || [];
        setTotalRumah(rumahList.length);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ================= SEARCH ================= */
  const handleSearch = () => {
    const q = search.toLowerCase().trim();
    if (!q) return setProperti(allProperti);

    setProperti(
      allProperti.filter((p) =>
        [p.nama_properti, p.lokasi, p.kontraktor]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    );
  };

  return (
    <div
      className="min-h-screen transition-colors"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)"
      }}
    >
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden min-h-screen flex items-center">

        {/* ================= BACKGROUND GLOW ================= */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/30 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cyan-500/20 blur-3xl rounded-full"></div>

        {/* ================= CONTENT ================= */}
        <div className="relative max-w-6xl mx-auto px-6 text-center">

          {/* ===== BADGE ===== */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold
                       backdrop-blur shadow-lg border border-green-400/30
                       bg-white/70 text-green-700"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              {totalRumah}+ Rumah Tersedia
            </div>
          </div>

          {/* ===== TITLE ===== */}
          <h1 className="text-4xl md:text-6xl font-extrabold">
            Properti Premium
            <span className="block text-[var(--primary)]">
              Masa Depan Anda
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-slate-300">
            Platform properti modern dengan data transparan
            dan kontraktor resmi.
          </p>

          {/* ===== CTA BUTTONS ===== */}
          <div className="mt-10 flex justify-center gap-4 flex-wrap">

            <button
              className="px-7 py-3 rounded-xl font-semibold
                       bg-blue-500 hover:bg-blue-600 text-slate-900
                       shadow-lg shadow-blue-500/30
                       transition active:scale-95"
            >
              Get Started
            </button>

            <button
              className="px-7 py-3 rounded-xl font-semibold
                       border border-slate-600 text-slate-200
                       hover:bg-slate-800
                       transition active:scale-95
                       flex items-center gap-2"
            >
              Learn More <ArrowRight size={18} />
            </button>

          </div>
        </div>
      </section>

      {/* ================= PROPERTY LIST ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col w-full justify-center items-center">
          <h2 className="text-5xl font-bold mb-2">
            Daftar Proyek
          </h2>
          <p className="text-center" style={{ color: "var(--muted)" }}>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolore, architecto?</p>
        </div>
        {/* SEARCH BAR */}
        <div
          className="mt-12 max-w-3xl mx-auto p-2 rounded-2xl flex gap-2 shadow-xl mb-10"
          style={{ backgroundColor: "var(--card)" }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Cari proyek, lokasi, kontraktor..."
              className="w-full pl-12 pr-4 py-3 rounded-xl outline-none bg-transparent"
              style={{ color: "var(--text)" }}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-10 py-3 rounded-xl text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Cari
          </button>
        </div>

        {loading && (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        )}

        {!loading && properti.length === 0 && (
          <div className="text-center py-20 rounded-3xl border border-dashed">
            <Search size={40} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Properti tidak ditemukan</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {properti.map((p) => (
            <div
              style={{ backgroundColor: "var(--card)" }}
              key={p.id_properti}
              className="rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
            >
              {/* IMAGE */}
              <div className="h-40 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center overflow-hidden">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.nama_properti}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 size={36} className="text-blue-600" />
                )}
              </div>

              <div className="p-6">
                <h3 className="font-bold text-lg mb-1">
                  {p.nama_properti}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin size={14} />
                  {p.lokasi || "Lokasi belum tersedia"}
                </div>

                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {p.deskripsi || "Detail tersedia di halaman properti"}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-400 px-3 py-1 rounded-full">
                    {p.kontraktor || "Official Partner"}
                  </span>

                  <Link
                    to={`/properti/${p.id_properti}`}
                    className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Detail <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIAL ================ */}
      <section class="py-12 sm:py-16 px-4 sm:px-6">
        <div className="flex w-full justify-center">
          <h1 className="text-5xl font-bold">Testimonial</h1>
        </div>
        <div class="max-w-7xl px-6 py-20 mx-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* <!-- Testimonial 1 --> */}
            <div class="p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm">
              <div class="flex items-center mb-3 sm:mb-4">
                <div class="flex text-yellow-400">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
              </div>
              <blockquote class="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">
                "Absolutely amazing! This library helped us ship features 3x faster than before. Highly recommended!"
              </blockquote>
              <div class="flex items-center gap-3 sm:gap-4">
                <img src="https://i.pravatar.cc/48?img=32" alt="Michael Chen"
                  class="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Michael Chen</p>
                  <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Product Manager</p>
                </div>
              </div>
            </div>

            {/* <!-- Testimonial 2 --> */}
            <div class="p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm">
              <div class="flex items-center mb-3 sm:mb-4">
                <div class="flex text-yellow-400">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
              </div>
              <blockquote class="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">
                "The documentation is superb and the components are production-ready. A game-changer for our startup."
              </blockquote>
              <div class="flex items-center gap-3 sm:gap-4">
                <img src="https://i.pravatar.cc/48?img=45" alt="Sarah Williams"
                  class="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Sarah Williams</p>
                  <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Frontend Lead</p>
                </div>
              </div>
            </div>

            {/* <!-- Testimonial 3 --> */}
            <div class="p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm">
              <div class="flex items-center mb-3 sm:mb-4">
                <div class="flex text-yellow-400">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
              </div>
              <blockquote class="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">
                "Clean, modern, and accessible. Our users love the experience these components provide."
              </blockquote>
              <div class="flex items-center gap-3 sm:gap-4">
                <img src="https://i.pravatar.cc/48?img=12" alt="David Kim"
                  class="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">David Kim</p>
                  <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">UX Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer class="border-t transition-colors duration-300">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* <!-- Main Footer Content --> */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

            {/* <!-- Company Info --> */}
            <div class="lg:col-span-1">
              <div class="flex items-center space-x-3 mb-4">
                {/* <!-- Logo Placeholder --> */}
                <div class="w-10 h-10 bg-gray-900 dark:bg-lime-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-xl">SLO</span>
                </div>
                <span class="text-xl font-semibold text-gray-900 dark:text-white">SOAP Properti</span>
              </div>
              <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Membangun solusi digital yang transformatif untuk bisnis masa depan dengan teknologi terkini dan tim ahli.
              </p>
              <div class="flex space-x-4">
                <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* <!-- Quick Links --> */}
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
                Perusahaan
              </h3>
              <ul class="space-y-4">
                <li>
                  <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors duration-300 block">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors duration-300 block">
                    Karir
                  </a>
                </li>
                <li>
                  <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors duration-300 block">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors duration-300 block">
                    Partner
                  </a>
                </li>
              </ul>
            </div>

            {/* <!-- Products --> */}
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
                Produk
              </h3>
              <ul class="space-y-4">
                <li>
                  <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors duration-300 block">
                    Solusi Enterprise
                  </a>
                </li>
                <li>
                  <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors duration-300 block">
                    API Platform
                  </a>
                </li>
                <li>
                  <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors duration-300 block">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors duration-300 block">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* <!-- Contact & Newsletter --> */}
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
                Newsletter
              </h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Dapatkan update terbaru dan insight langsung ke inbox Anda.
              </p>

              <form class="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email Anda"
                    class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-lime-500 dark:focus:ring-lime-400 focus:border-transparent transition-all duration-300 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  class="w-full bg-gray-900 dark:bg-lime-600 text-white px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-lime-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-lime-500"
                >
                  Berlangganan
                </button>
              </form>
            </div>

          </div>

          {/* <!-- Divider --> */}
          <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div class="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">

              {/* <!-- Copyright --> */}
              <div class="text-center md:text-left">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  &copy; 2026 JokoUI. All rights reserved.
                </p>
              </div>

              {/* <!-- Legal Links --> */}
              <div class="flex flex-wrap justify-center gap-6">
                <a href="#" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                  Kebijakan Privasi
                </a>
                <a href="#" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                  Syarat Layanan
                </a>
                <a href="#" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                  Pengaturan Cookies
                </a>
                <a href="#" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                  Sitemap
                </a>
              </div>

            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
