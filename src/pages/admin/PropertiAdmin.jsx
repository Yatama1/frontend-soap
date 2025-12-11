// src/pages/admin/PropertiAdmin.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import PropertiFormModal from "../../components/PropertiFormModal";
//import RumahFormModal from "../../components/properti/RumahFormModal";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

export default function PropertiAdmin() {
  const [propertiList, setPropertiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPropertiModalOpen, setIsPropertiModalOpen] = useState(false);
  const [editingProperti, setEditingProperti] = useState(null);

  const [isRumahModalOpen, setIsRumahModalOpen] = useState(false);
  const [editingRumah, setEditingRumah] = useState(null);
  const [activePropertiForRumah, setActivePropertiForRumah] = useState(null);

  const fetchProperti = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/properti");
      // backend Anda mengembalikan { success, message, data }
      const data = res?.data?.data ?? [];
      setPropertiList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch properti error:", err);
      setError("Gagal memuat data properti. Pastikan backend berjalan dan token valid.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperti();
  }, []);

  const openAddProperti = () => {
    setEditingProperti(null);
    setIsPropertiModalOpen(true);
  };
  const openEditProperti = (p) => {
    setEditingProperti(p);
    setIsPropertiModalOpen(true);
  };

  const handleDeleteProperti = async (id) => {
    if (!window.confirm("Yakin menghapus properti ini?")) return;
    try {
      await api.delete(`/properti/${id}`);
      setPropertiList(prev => prev.filter(x => x.id_properti !== id));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal menghapus properti");
    }
  };

  // Rumah actions
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
      // update local
      setPropertiList(prev => prev.map(p => ({
        ...p,
        Rumah: p.Rumah ? (Array.isArray(p.Rumah) ? p.Rumah.filter(r => r.id_rumah !== id) : (p.Rumah.id_rumah === id ? null : p.Rumah)) : p.Rumah
      })));
      fetchProperti();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal menghapus rumah");
    }
  };

  if (loading) return <p className="text-center mt-12 text-gray-500">Memuat properti...</p>;
  if (error) return <p className="text-center mt-12 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Kelola Properti</h1>
        <div className="flex gap-2">
          <button onClick={fetchProperti} className="px-3 py-2 border rounded">Refresh</button>
          <button onClick={openAddProperti} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
            <Plus size={16}/> Tambah Properti
          </button>
        </div>
      </div>

      {propertiList.length === 0 ? (
        <p className="text-gray-500">Belum ada data properti.</p>
      ) : (
        <div className="space-y-4">
          {propertiList.map((p) => (
            <div key={p.id_properti} className="bg-white border rounded shadow p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    {p.image ? <img src={p.image} alt={p.nama_properti} className="w-full h-full object-cover" /> : <div className="text-gray-400">No Img</div>}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{p.nama_properti}</h2>
                    <p className="text-sm text-gray-600">{p.deskripsi}</p>
                    <p className="text-xs text-gray-500 mt-1">Lokasi: {p.lokasi || "-"}</p>
                    <p className="text-xs text-gray-500">Owner (senior): {p.owner_senior?.nama || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => openAddRumah(p)} className="px-3 py-2 bg-green-600 text-white rounded">Tambah Rumah</button>
                  <button onClick={() => openEditProperti(p)} title="Edit" className="p-2 border rounded"><Edit size={16}/></button>
                  <button onClick={() => handleDeleteProperti(p.id_properti)} title="Hapus" className="p-2 border rounded text-red-600"><Trash2 size={16}/></button>
                </div>
              </div>

              {/* daftar rumah */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Daftar Rumah</h3>
                {(!p.rumahs && !p.Rumah) || (Array.isArray(p.rumahs || p.Rumah) && (p.rumahs || p.Rumah).length === 0) ? (
                  <p className="text-xs text-gray-400">Belum ada rumah</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(p.rumahs || p.Rumah || []).map(r => (
                      <div key={r.id_rumah} className="border rounded p-3 flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{r.tipe}</div>
                          <div className="text-xs text-gray-500">Harga: {r.harga ? `Rp ${Number(r.harga).toLocaleString("id-ID")}` : "-"}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEditRumah(r, p)} className="p-2 border rounded"><Edit size={14}/></button>
                          <button onClick={() => handleDeleteRumah(r.id_rumah)} className="p-2 border rounded text-red-600"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isPropertiModalOpen && (
        <PropertiFormModal
          initialData={editingProperti}
          onClose={() => { setIsPropertiModalOpen(false); setEditingProperti(null); }}
          onSaved={() => { setIsPropertiModalOpen(false); fetchProperti(); }}
        />
      )}

      {isRumahModalOpen && (
        <RumahFormModal
          initialData={editingRumah}
          parentProperti={activePropertiForRumah}
          onClose={() => { setIsRumahModalOpen(false); setEditingRumah(null); setActivePropertiForRumah(null); }}
          onSaved={() => { setIsRumahModalOpen(false); fetchProperti(); }}
        />
      )}
    </div>
  );
}
