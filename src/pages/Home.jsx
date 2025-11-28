// Home.jsx updated with Tentang and Kontak sections
import { useEffect, useState } from "react";
import gambar1Image from "../assets/gambar1.jpg";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Home() {
  const [properti, setProperti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedProperti, setSelectedProperti] = useState(null);
  const [leadName, setLeadName] = useState("");
  const [leadKontak, setLeadKontak] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/properti");
        if (!response.ok) throw new Error("Gagal mengambil data properti");
        const data = await response.json();
        const propertiesArray = Array.isArray(data) ? data : data.data || [];
        setProperti(propertiesArray);
      } catch (err) {
        console.error(err);
        setError("Tidak dapat memuat data properti. Pastikan server backend berjalan.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/member");
        const data = await res.json();
        setMembers(data.data || data);
      } catch (err) {
        console.error("Gagal memuat member:", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, []);

  const handleSendLead = async (e) => {
    e.preventDefault();
    if (!leadName || !leadKontak) return;

    setSending(true);
    try {
      const payload = {
        nama_cabuy: leadName,
        kontak: leadKontak,
        status: "Baru",
        tanggal_follow_up: new Date(),
        tanggal_masuk: new Date(),
      };

      const response = await fetch("http://localhost:5000/api/cabuy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Gagal mengirim data leads");
      setSuccess(true);

      setTimeout(() => {
        const waNumber = selectedProperti?.Member?.no_hp || "628123456789";
        window.open(
          `https://wa.me/${waNumber}?text=Halo,%20saya%20${encodeURIComponent(
            leadName
          )}%20tertarik%20dengan%20properti%20${encodeURIComponent(
            selectedProperti?.nama_properti || "ini"
          )}`,
          "_blank"
        );
        setShowModal(false);
        setLeadName("");
        setLeadKontak("");
        setSuccess(false);
      }, 1000);
    } catch (err) {
      console.error("❌ Error kirim leads:", err);
      alert("Gagal mengirim data leads. Pastikan server backend berjalan.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="w-full min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div
        className="relative bg-cover bg-center h-[70vh] shadow-sm"
        style={{ backgroundImage: `url(${gambar1Image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 flex flex-col items-center justify-center text-center text-white px-4">
          <p className="text-sm md:text-base uppercase tracking-[0.25em] mb-3 text-white/70">
            SOAP • Cari Properti dengan Mudah
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-xl leading-tight">
            Temukan Properti Impianmu
            <span className="text-cyan-300"> 🔑</span>
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-white/80 mb-8">
            Pilih rumah, apartemen, atau properti investasi sesuai kebutuhanmu.
          </p>

          <div className="bg-white/95 rounded-full p-2 w-full max-w-xl flex items-center shadow-lg">
            <input
              type="text"
              placeholder="Cari rumah, apartemen, atau lokasi..."
              className="flex-1 px-4 py-2 rounded-full outline-none text-gray-700 text-sm md:text-base"
            />
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm md:text-base font-semibold">
              Search
            </button>
          </div>
        </div>
      </div>

     {/* ✅ SECTION PROPERTI / PROYEK */}
<div
  id="properti"
  className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14 flex-1 w-full"
>
  <div className="flex flex-col items-center mb-8">
    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 text-center">
      Proyek Properti di Seluruh Indonesia
    </h2>
    <p className="text-sm md:text-base text-slate-500 text-center max-w-xl">
      Pilih proyek perumahan, apartemen, atau kawasan yang ingin kamu lihat.
      Di dalam setiap properti terdapat beberapa tipe rumah/unit yang bisa kamu pilih.
    </p>
    <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" />
  </div>

  {loading && (
    <p className="text-center text-gray-500 italic">Memuat data properti...</p>
  )}
  {error && <p className="text-center text-red-500">{error}</p>}
  {!loading && !error && properti.length === 0 && (
    <p className="text-center text-gray-500 italic">
      Belum ada properti tersedia saat ini.
    </p>
  )}

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 mt-4">
    {properti.map((p) => (
      <div
        key={p.id_properti}
        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-200 overflow-hidden flex flex-col border border-slate-100"
      >
        <div className="relative">
          <img
            src={p.image || "/no-image.jpg"}
            alt={p.nama_properti}
            className="h-44 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800 shadow-sm">
            {p.lokasi || p.location || "Lokasi strategis"}
          </span>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
            {p.nama_properti}
          </h3>
          <p className="text-xs uppercase tracking-wide text-slate-400 mt-1">
            Proyek Properti • SOAP
          </p>

          <p className="text-sm text-slate-600 mt-2 flex-grow line-clamp-3">
            {p.deskripsi || "Proyek perumahan dengan berbagai tipe rumah di dalamnya."}
          </p>

          {/* Range harga kalau ada, jangan terlalu kayak harga ecom */}
          {p.range_harga || p.price ? (
            <p className="text-cyan-700 font-semibold mt-2 text-sm">
              Perkiraan harga mulai dari{" "}
              <span className="font-bold">
                {p.range_harga || p.price}
              </span>
            </p>
          ) : null}

          <div className="mt-4 flex">
            <Link
              to={`/properti/${p.id_properti}`}
              className="flex-1 text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2.5 rounded-xl hover:from-blue-700 hover:to-cyan-600 text-sm font-semibold shadow-sm"
            >
              Lihat Rumah di Properti Ini
            </Link>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>


      {/* TENTANG SECTION */}
      <section id="tentang" className="bg-white py-14 px-6 border-t">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center">Tentang Kami</h2>
          <p className="text-slate-600 text-center max-w-3xl mx-auto text-sm md:text-base">
            Sistem Otomasi Agen Properti adalah platform yang membantu agen dan calon pembeli
            terhubung dengan mudah. Kami menyediakan listing properti dari seluruh Indonesia,
            lengkap dengan fitur CRM, follow up otomatis, dan performa member.
          </p>
        </div>
      </section>

      {/* KONTAK / MEMBER */}
      <section id="kontak" className="bg-slate-50 py-14 px-6 border-t">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Kontak Agen</h2>

          {loadingMembers ? (
            <p className="text-center text-gray-500">Memuat data member...</p>
          ) : members.length === 0 ? (
            <p className="text-center text-gray-500">Belum ada member.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {members.map((m) => (
                <div key={m.id_member} className="bg-white p-5 rounded-xl shadow-sm border">
                  <p className="font-semibold text-slate-800 text-lg">{m.nama_member}</p>
                  <p className="text-sm text-blue-600">{m.jabatan || "Member"}</p>
                  <p className="text-sm text-slate-600 mt-2">Kontak: {m.kontak}</p>
                  <p className="text-sm text-slate-600">Email: {m.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
