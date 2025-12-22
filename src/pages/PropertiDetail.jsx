import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Building2, Phone, 
  BedDouble, Layers, Ruler, Home, CheckCircle2, XCircle 
} from "lucide-react";

export default function PropertiDetail() {
  const { id } = useParams();

  const [properti, setProperti] = useState(null);
  const [rumahList, setRumahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Parallel biar lebih cepat
        const [resProperti, resRumah] = await Promise.all([
          fetch("http://localhost:5000/api/properti"),
          fetch("http://localhost:5000/api/rumah")
        ]);

        const propertiJson = await resProperti.json();
        const rumahJson = await resRumah.json();

        const propertiArr = propertiJson?.data || [];
        const rumahArr = rumahJson?.data || [];

        const found = propertiArr.find((p) => Number(p.id_properti) === Number(id));
        if (!found) throw new Error("Properti tidak ditemukan");

        setProperti(found);
        setRumahList(rumahArr.filter((r) => Number(r.id_properti) === Number(id)));

      } catch (err) {
        console.error(err);
        setError("Gagal memuat detail properti. Pastikan server berjalan.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ================= HITUNG UNIT ================= */
  const totalUnit = useMemo(() => {
    return rumahList.reduce((sum, r) => {
      return sum + (Number(r.terjual) === 0 ? Number(r.unit || 0) : 0);
    }, 0);
  }, [rumahList]);

  /* ================= LOADING STATE (SKELETON) ================= */
  if (loading) return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="h-10 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-20 w-full bg-gray-200 rounded animate-pulse mt-4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse"></div>)}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/" className="text-blue-600 hover:underline font-medium">Kembali ke Beranda</Link>
      </div>
    </div>
  );

  if (!properti) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* HEADER BACKGROUND DECORATION */}
      <div className="bg-slate-900 h-64 w-full absolute top-0 left-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 opacity-90"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        
        {/* BREADCRUMB / BACK */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Proyek
        </Link>

        {/* ================= HEADER PROPERTI ================= */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-gray-100 pb-8 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Proyek Perumahan
                </span>
                {totalUnit > 0 ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <CheckCircle2 size={12} /> {totalUnit} Unit Tersedia
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    <XCircle size={12} /> Sold Out
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                {properti.nama_properti}
              </h1>
              
              <div className="flex items-center gap-2 text-slate-500 text-sm md:text-base">
                <MapPin size={18} className="text-orange-500 shrink-0" />
                <span>{properti.lokasi || "Lokasi strategis, hubungi kami untuk detail."}</span>
              </div>
            </div>

            {/* KONTRAKTOR CARD */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[250px]">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Developer / Kontraktor</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{properti.kontraktor || "Official Partner"}</p>
                  {properti.kontak_kontraktor && (
                     <p className="text-xs text-slate-500 mt-0.5">{properti.kontak_kontraktor}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Tentang Proyek</h3>
            <p>
              {properti.deskripsi ||
                "Proyek hunian eksklusif dengan desain modern dan lokasi strategis. Dibangun dengan material berkualitas tinggi untuk kenyamanan jangka panjang keluarga Anda."}
            </p>
          </div>
        </div>

        {/* ================= DAFTAR UNIT RUMAH ================= */}
        <div className="flex items-center gap-3 mb-8">
          <Home size={28} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Pilihan Tipe Unit</h2>
        </div>

        {rumahList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-400 font-medium">Belum ada unit rumah yang dirilis pada properti ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {rumahList.map((r) => {
              const sold = Number(r.terjual) === 1 || r.terjual === true;

              return (
                <div
                  key={r.id_rumah}
                  className={`group bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
                    sold ? "opacity-75 grayscale-[0.5]" : "hover:shadow-xl hover:-translate-y-1"
                  }`}
                >
                  {/* IMAGE SECTION */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    {r.image ? (
                      <img
                        src={r.image}
                        alt={`Tipe ${r.tipe}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      // Fallback Image Pattern
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                        <Home size={48} className="mb-2 opacity-20" />
                        <span className="text-xs font-medium uppercase tracking-widest opacity-40">No Image Available</span>
                      </div>
                    )}

                    {/* OVERLAY BADGE */}
                    <div className="absolute top-4 left-4">
                      {sold ? (
                        <span className="bg-slate-900/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/20 shadow-lg">
                          TERJUAL / SOLD
                        </span>
                      ) : (
                        <span className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/20 shadow-lg flex items-center gap-1">
                           <CheckCircle2 size={12} /> {r.unit} Unit Tersedia
                        </span>
                      )}
                    </div>
                  </div>

                  {/* INFO SECTION */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          Rumah Tipe {r.tipe}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                           Spesifikasi Premium
                        </p>
                      </div>
                      <div className="text-right">
                         <p className="text-sm text-slate-500 mb-1">Harga Mulai</p>
                         <p className="text-lg font-bold text-blue-600">
                          {r.harga
                            ? `Rp ${Number(r.harga).toLocaleString("id-ID")}`
                            : "Hubungi Kami"}
                        </p>
                      </div>
                    </div>

                    {/* SPECS GRID */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <Ruler size={16} className="text-blue-500" />
                        <span>LT: <b>{r.lt || "-"}</b> m²</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <Ruler size={16} className="text-blue-500 rotate-90" />
                        <span>LB: <b>{r.lb || "-"}</b> m²</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <BedDouble size={16} className="text-purple-500" />
                        <span><b>{r.jml_kamar || "-"}</b> K. Tidur</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <Layers size={16} className="text-orange-500" />
                        <span><b>{r.jml_lantai || "-"}</b> Lantai</span>
                      </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <div className="mt-auto">
                      {sold ? (
                         <button disabled className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-semibold text-sm cursor-not-allowed border border-gray-200">
                            Unit Tidak Tersedia
                         </button>
                      ) : (
                        properti.kontak_kontraktor ? (
                          <a
                            href={`https://wa.me/${properti.kontak_kontraktor.replace(/[^0-9]/g, "")}?text=Halo, saya tertarik dengan rumah Tipe ${r.tipe} di properti ${properti.nama_properti}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-green-600/20 active:scale-95"
                          >
                            <Phone size={18} /> Hubungi via WhatsApp
                          </a>
                        ) : (
                          <button disabled className="w-full py-3 bg-gray-200 text-gray-500 rounded-xl font-semibold text-sm">
                             Kontak Belum Tersedia
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}