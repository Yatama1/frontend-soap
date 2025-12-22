import React, { useEffect, useState } from "react";
import { 
  Users, UserPlus, Search, RefreshCw, 
  Edit, Trash2, Phone, Mail, Shield, MoreHorizontal 
} from "lucide-react";
import api from "../../api/apiClient";
import SeniorFormModal from "../../components/SeniorFormModal";

export default function Senior() {
  const [seniors, setSeniors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSenior, setSelectedSenior] = useState(null);

  // --- FETCH DATA ---
  const fetchSeniors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/members");
      const data = res?.data?.members || [];

      const formatted = data
        .filter(item => item.jabatan === "senior_leader")
        .map(item => ({
          ...item,
          id: item.id_member || item.id,
        }));

      setSeniors(formatted);
    } catch (error) {
      console.error("Error:", error);
      // Optional: Gunakan toast notification library jika ada
      alert("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeniors();
  }, []);

  // --- HANDLERS ---
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

  // --- LOADING SKELETON ---
  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-purple-600 fill-purple-100" /> 
            Senior Leaders
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola akses dan data tim senior leader
          </p>
        </div>
        <div className="flex gap-3">
            <button
            onClick={fetchSeniors}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-purple-600 transition-colors shadow-sm"
            title="Refresh Data"
            >
            <RefreshCw size={20} />
            </button>
            <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95"
            >
            <UserPlus size={18} /> 
            <span className="font-medium">Tambah Senior</span>
            </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search size={20} className="text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau email..."
          className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE CONTENT */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-medium">Tidak ada data ditemukan</h3>
            <p className="text-gray-500 text-sm mt-1">Coba kata kunci lain atau tambahkan senior baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-semibold">Profil Senior</th>
                  <th className="px-6 py-4 font-semibold">Kontak</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => {
                   // Generate inisial untuk avatar
                   const initial = (s.nama || s.nama_member || "S").charAt(0).toUpperCase();
                   
                   return (
                    <tr key={s.id} className="group hover:bg-purple-50/30 transition-colors duration-200">
                        {/* Kolom Profil */}
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-bold text-lg flex items-center justify-center shadow-sm ring-2 ring-white">
                                {initial}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{s.nama || s.nama_member}</p>
                                <p className="text-xs text-purple-600 font-medium bg-purple-100 inline-block px-2 py-0.5 rounded-full mt-1">
                                    Senior Leader
                                </p>
                            </div>
                        </div>
                        </td>

                        {/* Kolom Kontak */}
                        <td className="px-6 py-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail size={14} className="text-gray-400" />
                                <span>{s.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone size={14} className="text-gray-400" />
                                <span>{s.kontak || "-"}</span>
                            </div>
                        </div>
                        </td>

                        {/* Kolom Status (Dummy active) */}
                        <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Aktif
                            </span>
                        </td>

                        {/* Kolom Aksi */}
                        <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                            onClick={() => openEditModal(s)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            title="Edit Data"
                            >
                            <Edit size={18} />
                            </button>
                            <button
                            onClick={() => handleDelete(s.id, s.nama || s.nama_member)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Hapus Data"
                            >
                            <Trash2 size={18} />
                            </button>
                        </div>
                        </td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL GLOBAL */}
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