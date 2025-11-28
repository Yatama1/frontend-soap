// src/pages/senior/PropertiDetail.jsx (atau sesuai foldermu)
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function PropertiDetail() {
  const { id } = useParams(); // id_properti
  const [properti, setProperti] = useState(null);
  const [rumahList, setRumahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // untuk modal member yang handle rumah
  const [selectedRumah, setSelectedRumah] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ambil semua properti, lalu cari yang sesuai id
        const resProperti = await fetch("http://localhost:5000/api/properti");
        if (!resProperti.ok) throw new Error("Gagal mengambil data properti");
        const dataProperti = await resProperti.json();
        const propertiArray = Array.isArray(dataProperti)
          ? dataProperti
          : dataProperti.data || [];

        const foundProperti = propertiArray.find(
          (p) => Number(p.id_properti) === Number(id)
        );

        if (!foundProperti) {
          setError("Properti tidak ditemukan.");
          setLoading(false);
          return;
        }
        setProperti(foundProperti);

        // Ambil semua rumah, lalu filter berdasarkan id_properti
        const resRumah = await fetch("http://localhost:5000/api/rumah");
        if (!resRumah.ok) throw new Error("Gagal mengambil data rumah");
        const dataRumah = await resRumah.json();
        const rumahArray = Array.isArray(dataRumah)
          ? dataRumah
          : dataRumah.data || [];

        const rumahDiProperti = rumahArray.filter(
          (r) => Number(r.id_properti) === Number(id)
        );

        setRumahList(rumahDiProperti);
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="text-center mt-20">Memuat detail properti...</p>;
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>;
  if (!properti) return <p className="text-center mt-20">Properti tidak ditemukan.</p>;

  const member = properti.Member || null; // backend kamu sepertinya sudah include Member

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <Link
          to="/"
          className="text-blue-600 text-sm hover:underline mb-4 inline-block"
        >
          ← Kembali ke Beranda
        </Link>

        {/* HEADER PROPERTI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {properti.nama_properti}
          </h1>
          <p className="text-sm text-slate-500 mb-2">
            {properti.lokasi || "Lokasi belum tersedia"}
          </p>
          <p className="text-sm text-slate-600 mb-4">
            {properti.deskripsi ||
              "Proyek perumahan dengan beberapa tipe rumah yang tersedia."}
          </p>

          {member && (
            <div className="mt-3 inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs text-slate-500">Agen Penanggung Jawab</p>
                <p className="text-sm font-semibold text-slate-800">
                  {member.nama_member}
                </p>
                <p className="text-xs text-slate-600">
                  Kontak: {member.kontak || member.no_hp || "-"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* DAFTAR RUMAH DI PROPERTI INI */}
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
          Rumah Tersedia di {properti.nama_properti}
        </h2>

        {rumahList.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada rumah/unit yang terdaftar dalam properti ini.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rumahList.map((r) => (
  <div
    key={r.id_rumah}
    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
  >
    {/* BAGIAN GAMBAR */}
    <div className="relative">
      <img
        src={r.image || "/no-image.jpg"}
        alt={r.tipe ? `Tipe ${r.tipe}` : "Rumah"}
        className="w-full h-56 object-cover"
      />

      {/* RIBBON DIJUAL */}
      <div className="absolute top-4 left-4 bg-white/90 px-4 py-1 rounded text-xs font-semibold tracking-[0.15em] text-gray-800">
        DIJUAL
      </div>
    </div>

    {/* BAGIAN TEKS */}
    <div className="p-4 flex flex-col flex-1">
      {/* Judul rumah */}
      <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
        {r.judul ||
          (r.tipe
            ? `Rumah Tipe ${r.tipe} di ${properti.nama_properti}`
            : `Rumah di ${properti.nama_properti}`)}
      </h3>

      {/* Lokasi (ambil dari properti) */}
      <p className="text-sm text-gray-500 mb-2">
        {properti.lokasi || "Lokasi tidak tersedia"}
      </p>

      {/* Harga */}
      <p className="text-lg font-bold text-gray-900 mb-3">
        {r.harga
          ? `Rp ${Number(r.harga).toLocaleString("id-ID")}`
          : "Harga hubungi agen"}
      </p>

      {/* ICON INFO: kamar, lantai, luas */}
      <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
        <div className="flex items-center gap-1">
          <span>🛏</span>
          <span>{r.jml_kamar || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🏠</span>
          <span>{r.jml_lantai || 1} lt</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📐</span>
          <span>
            {r.lt || 0} m² LT / {r.lb || 0} m² LB
          </span>
        </div>
      </div>

      {/* Tombol tertarik */}
      <button
        onClick={() => {
          setSelectedRumah(r);
          setShowMemberModal(true);
        }}
        className="mt-auto w-full border border-gray-900 text-gray-900 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-900 hover:text-white transition-colors"
      >
        Saya Tertarik
      </button>
    </div>
  </div>
))}

          </div>
        )}
      </div>

      {/* MODAL MEMBER HANDLER */}
      {showMemberModal && selectedRumah && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowMemberModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-xl leading-none"
            >
              ×
            </button>

            <h3 className="text-xl font-semibold mb-2 text-slate-800">
              Kontak Agen untuk{" "}
              {selectedRumah.tipe ? `Tipe ${selectedRumah.tipe}` : "Rumah ini"}
            </h3>

            {member ? (
              <>
                <p className="text-sm text-slate-600 mb-4">
                  Rumah ini di-handle oleh:
                </p>
                <div className="border border-slate-200 rounded-xl p-4 mb-4 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-900">
                    {member.nama_member}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Kontak: {member.kontak || member.no_hp || "-"}
                  </p>
                </div>

                {member.kontak || member.no_hp ? (
                  <a
                    href={`https://wa.me/${(member.kontak || member.no_hp).replace(
                      /[^0-9]/g,
                      ""
                    )}?text=${encodeURIComponent(
                      `Halo, saya tertarik dengan rumah tipe ${
                        selectedRumah.tipe || "-"
                      } di ${properti.nama_properti}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold"
                  >
                    Hubungi via WhatsApp
                  </a>
                ) : (
                  <p className="text-xs text-red-500">
                    Nomor WhatsApp agen belum tersedia.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-600">
                Data agen yang meng-handle rumah ini belum tersedia.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
