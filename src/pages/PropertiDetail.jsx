import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, MapPin, Building2,
  BedDouble, Layers, Ruler, Home,
  CheckCircle2, XCircle, ArrowRight, User
} from "lucide-react";

export default function PropertiDetail() {
  const { id } = useParams();

  const [properti, setProperti] = useState(null);
  const [rumahList, setRumahList] = useState([]);
  const [agentMap, setAgentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r1, r2, r3] = await Promise.all([
          fetch("http://localhost:5000/api/properti"),
          fetch("http://localhost:5000/api/rumah"),
          fetch("http://localhost:5000/api/agent"),
        ]);

        const propertiArr = (await r1.json())?.data || [];
        const rumahArr = (await r2.json())?.data || [];
        const agentArr = (await r3.json())?.data || [];

        const found = propertiArr.find(p => Number(p.id_properti) === Number(id));
        if (!found) throw new Error("Properti tidak ditemukan");

        setProperti(found);

        const filteredRumah = rumahArr.filter(
          r => Number(r.id_properti) === Number(id)
        );
        setRumahList(filteredRumah);

        const map = {};
        agentArr.forEach(a => {
          if (a.id_rumah) map[a.id_rumah] = a.member;
        });
        setAgentMap(map);

      } catch (e) {
        console.error(e);
        setError("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const totalUnit = useMemo(() => {
    return rumahList.reduce(
      (sum, r) => sum + (Number(r.terjual) === 0 ? Number(r.unit || 0) : 0),
      0
    );
  }, [rumahList]);

  if (loading) return <Center text="Loading..." />;
  if (error) return <Center text={error} error />;

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800">

      {/* ================= HEADER BG ================= */}
      <div
        className="h-64 w-full absolute top-0 left-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: properti?.image
            ? `url(${properti.image})`
            : "linear-gradient(to bottom, #0f172a, #020617)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-950/90" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">

        {/* BACK */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Proyek
        </Link>

        {/* ================= HEADER PROPERTI ================= */}
        <div className="bg-white rounded-3xl shadow-xl border p-8 mb-12">
          <div className="flex flex-col md:flex-row justify-between gap-6 border-b pb-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                  PROYEK PERUMAHAN
                </span>
                {totalUnit > 0 ? (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> {totalUnit} Unit
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <XCircle size={12} /> Sold Out
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold mb-2">
                {properti.nama_properti}
              </h1>

              <div className="flex items-center gap-2 text-gray-500">
                <MapPin size={16} className="text-orange-500" />
                {properti.lokasi}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border min-w-[240px]">
              <p className="text-xs text-slate-400 font-semibold uppercase mb-2">
                Developer
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    {properti.kontraktor || "Official Partner"}
                  </p>
                  {properti.kontak_kontraktor && (
                    <p className="text-xs text-slate-500">
                      {properti.kontak_kontraktor}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">
            {properti.deskripsi ||
              "Hunian modern dengan desain premium dan lokasi strategis."}
          </p>
        </div>

        {/* ================= TITLE ================= */}
        <div className="flex items-center gap-3 mb-8">
          <Home size={26} className="text-blue-600" />
          <h2 className="text-2xl font-bold">Pilihan Tipe Unit</h2>
        </div>

        {/* ================= CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rumahList.map((r) => {
            const sold = Number(r.terjual) === 1 || r.terjual === true;
            const unit = Number(r.unit || 0);
            const agent = agentMap[r.id_rumah];

            let badge = "STOK HABIS";
            let badgeClass = "bg-red-600";
            if (sold) {
              badge = "TERJUAL";
              badgeClass = "bg-slate-900";
            } else if (unit > 0) {
              badge = `${unit} UNIT TERSEDIA`;
              badgeClass = "bg-emerald-600";
            }

            return (
              <div
                key={r.id_rumah}
                className="relative group rounded-[28px] p-[2px]
                  bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-pink-500/40
                  hover:from-blue-500 hover:via-purple-500 hover:to-pink-500
                  transition-all duration-500"
              >
                {/* ===== GLASS CARD ===== */}
                <div className="relative h-full bg-white/80 backdrop-blur-xl rounded-[26px] overflow-hidden shadow-xl">

                  {/* IMAGE */}
                  <div className="relative h-64 overflow-hidden">
                    {r.image ? (
                      <img
                        src={r.image}
                        alt={r.tipe}
                        className="w-full h-full object-cover
                          transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <Home size={40} className="text-slate-300" />
                      </div>
                    )}

                    {/* BADGE */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`${badgeClass} text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg`}
                      >
                        {badge}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-6 flex flex-col">

                    <div className="flex justify-between mb-2">
                      <h3 className="text-xl font-extrabold">
                        Rumah Tipe {r.tipe}
                      </h3>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Harga</p>
                        <p className="text-lg font-bold text-blue-600">
                          {r.harga
                            ? `Rp ${Number(r.harga).toLocaleString("id-ID")}`
                            : "Hubungi Kami"}
                        </p>
                      </div>
                    </div>

                    {/* DESKRIPSI */}
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      <span className="font-bold">Deskripsi: </span>{r.deskripsi || "-"}
                    </p>

                    {/* AGENT */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <User size={14} className="text-blue-500" />
                      Agent:
                      <b className="ml-1">
                        {agent?.nama || "Belum ditentukan"}
                      </b>
                    </div>

                    <Link
                      to={`/rumah/${r.id_rumah}`}
                      className="mt-auto inline-flex items-center gap-2
                        text-blue-600 font-semibold text-sm
                        group-hover:gap-3 transition-all"
                    >
                      Lihat Detail <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================= SUB ================= */
function Spec({ icon: label, value, rotate }) {
  return (
    <div className="flex items-center gap-2 text-sm bg-slate-100/70 px-3 py-2 rounded-lg">
      <Icon
        size={14}
        className={`text-blue-600 ${rotate ? "rotate-90" : ""}`}
      />
      <span>
        {label}: <b>{value}</b>
      </span>
    </div>
  );
}

function Center({ text, error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className={error ? "text-red-500" : "text-gray-500"}>{text}</p>
    </div>
  );
}
