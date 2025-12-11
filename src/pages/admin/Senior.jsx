// src/pages/admin/Senior.jsx
import React, { useEffect, useState } from "react";
import { 
  Users, UserPlus, Search, RefreshCw, 
  Edit, Trash2, Phone, Mail 
} from "lucide-react";
import api from "../../api/apiClient";
import SeniorFormModal from "../../components/SeniorFormModal"; // 🔥 pakai modal global

export default function Senior() {
  const [seniors, setSeniors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSenior, setSelectedSenior] = useState(null);

  // --- FETCH DATA SENIOR LEADER ---
  const fetchSeniors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/members");
      const data = res?.data?.members || [];

      console.log("Data Senior dari API:", data);

      const formatted = data
        // backup filter kalau backend belum filter by role
        .filter(item => item.jabatan === "senior_leader")
        .map(item => ({
          ...item,
          id: item.id_member || item.id,
        }));

      setSeniors(formatted);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeniors();
  }, []);

  // CRUD HANDLERS
  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus Senior "${nama}"?`)) return;
    try {
      await api.delete(`/members/${id}`);
      setSeniors(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      alert("Gagal menghapus.");
    }
  };

  const openAddModal = () => {
    setSelectedSenior(null);
    setIsModalOpen(true);
  };

  const openEditModal = (senior) => {
    setSelectedSenior(senior);
    setIsModalOpen(true);
  };

  const filtered = seniors.filter(s =>
    (s.nama || s.nama_member || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-purple-600" /> Senior Leader
        </h1>
        <div className="flex gap-2">
          <button
            onClick={fetchSeniors}
            className="p-2 bg-white border rounded hover:bg-gray-100 shadow-sm"
          >
            <RefreshCw
              size={20}
              className={loading ? "animate-spin text-purple-600" : "text-gray-600"}
            />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 shadow-md"
          >
            <UserPlus size={18} /> Tambah Senior
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama senior..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Senior Leader
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Kontak
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-purple-50/50 transition">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 text-purple-600 font-bold rounded-full flex items-center justify-center">
                    {(s.nama || s.nama_member || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{s.nama || s.nama_member}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail size={10} /> {s.email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                  <Phone size={14} /> {s.kontak || "-"}
                </td>
                <td className="px-6 py-4 text-right flex gap-2 justify-end">
                  <button
                    onClick={() => openEditModal(s)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.nama || s.nama_member)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="p-8 text-center text-gray-400">
            Tidak ada data senior leader.
          </p>
        )}
      </div>

      {isModalOpen && (
        <SeniorFormModal
          seniorData={selectedSenior}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            fetchSeniors();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
