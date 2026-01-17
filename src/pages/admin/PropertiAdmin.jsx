import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import PropertiFormModal from "../../components/PropertiFormModal";
import RumahFormModal from "../../components/RumahFormModal";
import {
  Plus, Edit, Trash2, MapPin,
  Briefcase, Phone, Building2,
  Home, Layers
} from "lucide-react";

export default function PropertiAdmin() {
  const [propertiList, setPropertiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPropertiModalOpen, setIsPropertiModalOpen] = useState(false);
  const [editingProperti, setEditingProperti] = useState(null);

  const [isRumahModalOpen, setIsRumahModalOpen] = useState(false);
  const [editingRumah, setEditingRumah] = useState(null);
  const [activePropertiForRumah, setActivePropertiForRumah] = useState(null);

  /* ================= FETCH PROPERTI ================= */
  const fetchProperti = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/properti");
      setPropertiList(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data properti");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperti();
  }, []);

  /* ================= HANDLERS ================= */
  const openAddProperti = () => {
    setEditingProperti(null);
    setIsPropertiModalOpen(true);
  };

  const openEditProperti = (p) => {
    setEditingProperti(p);
    setIsPropertiModalOpen(true);
  };

  const handleDeleteProperti = async (id) => {
    if (!window.confirm("Yakin menghapus properti ini beserta semua rumah di dalamnya?")) return;
    try {
      await api.delete(`/properti/${id}`);
      fetchProperti();
    } catch (err) {
      alert("Gagal menghapus properti");
    }
  };

  const openAddRumah = (properti) => {
    setActivePropertiForRumah(properti);
    setEditingRumah(null);
    setIsRumahModalOpen(true);
  };

  const openEditRumah = (rumah, properti) => {
    setActivePropertiForRumah(properti);
    setEditingRumah(rumah);
    setIsRumahModalOpen(true);
  };

  const handleDeleteRumah = async (id) => {
    if (!window.confirm("Yakin menghapus rumah ini?")) return;
    try {
      await api.delete(`/rumah/${id}`);
      fetchProperti();
    } catch (err) {
      alert("Gagal menghapus rumah");
    }
  };

  /* ================= LOADING ================= */
  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 text-red-500">
      <p className="text-lg font-semibold">Terjadi Kesalahan</p>
      <p>{error}</p>
      <button onClick={fetchProperti} className="mt-4 text-blue-600 underline">
        Coba Lagi
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Properti</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola proyek perumahan dan unit rumah
          </p>
        </div>
        <button
          onClick={openAddProperti}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span className="font-medium">Properti Baru</span>
        </button>
      </div>

      {/* LIST PROPERTI */}
      {propertiList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            Belum ada properti yang ditambahkan.
          </p>
          <button
            onClick={openAddProperti}
            className="mt-2 text-blue-600 font-medium hover:underline"
          >
            Tambah sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {propertiList.map((p) => (
            <div
              key={p.id_properti}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* === CARD HEADER (PROPERTI INFO) === */}
              <div className="flex flex-col lg:flex-row justify-between gap-6 pb-6 border-b border-gray-100">

                {/* 🔽 LEFT SIDE (IMAGE + INFO) */}
                <div className="flex-1 flex gap-4">

                  {/* ✅ GAMBAR PROPERTI */}
                  <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.nama_properti}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          <Building2 size={22} className="text-blue-600" />
                          {p.nama_properti}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1 ml-8 max-w-2xl">
                          {p.deskripsi || "Tidak ada deskripsi"}
                        </p>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditProperti(p)}
                          className="p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors"
                          title="Edit Properti"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProperti(p.id_properti)}
                          className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="Hapus Properti"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 ml-0 lg:ml-8">
                      <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <MapPin size={16} className="text-orange-500" />
                        <span className="truncate">{p.lokasi || "-"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <Briefcase size={16} className="text-purple-500" />
                        <span className="truncate">{p.kontraktor || "-"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <Phone size={16} className="text-green-500" />
                        <span className="truncate">
                          {p.kontak_kontraktor || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* === CARD BODY (LIST RUMAH) === */}
              <div className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <Home size={16} /> Daftar Unit Rumah
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {p.rumahs?.length || 0}
                    </span>
                  </h3>
                  <button
                    onClick={() => openAddRumah(p)}
                    className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Tambah Unit
                  </button>
                </div>

                {!p.rumahs || p.rumahs.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-400">
                      Belum ada unit rumah di properti ini.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {p.rumahs.map((r) => {
                      const isSold =
                        Number(r.terjual) === 1 || r.terjual === true;
                      return (
                        <div
                          key={r.id_rumah}
                          className="group border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all bg-white relative overflow-hidden"
                        >
                          <div
                            className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider ${isSold
                                ? "bg-gray-200 text-gray-600"
                                : "bg-green-100 text-green-700"
                              }`}
                          >
                            {isSold ? "Terjual" : "Tersedia"}
                          </div>

                          <div className="flex justify-between items-start mt-2">
                            <div>
                              <p className="font-bold text-gray-800 text-lg">
                                Tipe {r.tipe}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                                  <Layers size={12} /> Unit: {r.unit}
                                </span>
                                {r.harga && (
                                  <span className="font-semibold text-gray-700">
                                    Rp{" "}
                                    {Number(r.harga).toLocaleString("id-ID")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditRumah(r, p)}
                              className="text-xs flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded border transition-colors"
                            >
                              <Edit size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRumah(r.id_rumah)}
                              className="text-xs flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded border transition-colors"
                            >
                              <Trash2 size={12} /> Hapus
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {isPropertiModalOpen && (
        <PropertiFormModal
          initialData={editingProperti}
          onClose={() => setIsPropertiModalOpen(false)}
          onSaved={() => {
            setIsPropertiModalOpen(false);
            fetchProperti();
          }}
        />
      )}

      {isRumahModalOpen && (
        <RumahFormModal
          editData={editingRumah}
          parentProperti={activePropertiForRumah}
          onClose={() => setIsRumahModalOpen(false)}
          onSaved={() => {
            setIsRumahModalOpen(false);
            fetchProperti();
          }}
        />
      )}
    </div>
  );
}
