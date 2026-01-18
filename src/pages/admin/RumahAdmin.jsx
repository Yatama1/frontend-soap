import React, { useEffect, useState } from "react";
import api from "../../api/apiClient"; // Sesuaikan path jika berbeda
import RumahFormModal from "../../components/RumahFormModal"; // Sesuaikan path komponen
import { Plus, Edit, Trash2 } from "lucide-react";

export default function RumahAdmin() {
  // --- STATE ---
  const [rumahList, setRumahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRumah, setEditingRumah] = useState(null);

  // --- FETCH DATA ---
  const fetchRumah = async () => {
    setLoading(true);
    setError("");
    try {
      // Mengambil semua data rumah
      const res = await api.get("/rumah");
      setRumahList(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data rumah");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRumah();
  }, []);

  // --- HANDLERS ---
  const openAddRumah = () => {
    setEditingRumah(null); // Mode Tambah: Data kosong
    setIsModalOpen(true);
  };

  const openEditRumah = (rumah) => {
    setEditingRumah(rumah); // Mode Edit: Isi data
    setIsModalOpen(true);
  };

  const handleDeleteRumah = async (id) => {
    if (!window.confirm("Yakin menghapus rumah ini?")) return;
    try {
      await api.delete(`/rumah/${id}`);
      fetchRumah(); // Refresh list setelah hapus
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus rumah");
    }
  };

  // --- UI RENDER ---
  if (loading) return <p className="text-center mt-12 text-gray-500">Memuat data rumah...</p>;
  if (error) return <p className="text-center mt-12 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Rumah</h1>
        <button
          onClick={openAddRumah}
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Tambah Rumah
        </button>
      </div>

      {/* LIST RUMAH */}
      {rumahList.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
          <p className="text-gray-500">Belum ada data rumah.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rumahList.map((r) => {
            const isSold = Number(r.terjual) === 1 || r.terjual === true;

            return (
              <div
                key={r.id_rumah}
                className={`border rounded-xl p-5 shadow-sm transition hover:shadow-md ${isSold ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"
                  }`}
              >
                {/* --- TAMBAHKAN BAGIAN INI UNTUK MENAMPILKAN GAMBAR --- */}
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={`Tipe ${r.tipe}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-xs">No Image</span>
                    </div>
                  )}
                </div>
                {/* ----------------------------------------------------- */}
                {/* Header Card */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      Tipe {r.tipe}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      🏙 {r.properti ? r.properti.nama_properti : "Tanpa Properti"}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${isSold
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                      }`}
                  >
                    {isSold ? "Terjual" : "Tersedia"}
                  </span>
                </div>

                {/* Info Card */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between border-b pb-1">
                    <span>Harga:</span>
                    <span className="font-semibold text-gray-900">
                      {r.harga ? `Rp ${Number(r.harga).toLocaleString("id-ID")}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Stok Unit:</span>
                    <span className="font-semibold">{r.unit || 0}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    <span>🛏 {r.jml_kamar} KT</span>
                    <span>•</span>
                    <span>🏢 {r.jml_lantai} LT</span>
                    <span>•</span>
                    <span>📐 {r.lb}/{r.lt}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-auto pt-2 border-t">
                  <button
                    onClick={() => openEditRumah(r)}
                    className="flex items-center gap-1 px-3 py-1.5 border rounded text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRumah(r.id_rumah)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <RumahFormModal
          // PENTING: Gunakan 'editData' agar cocok dengan komponen RumahFormModal yang kita buat sebelumnya
          editData={editingRumah}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            fetchRumah(); // Refresh data setelah simpan/update
          }}
        />
      )}
    </div>
  );
}