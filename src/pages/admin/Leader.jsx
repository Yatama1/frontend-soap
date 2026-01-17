import React, { useEffect, useState } from "react";
import {
  Users, UserPlus, Search, RefreshCw,
  Edit, Trash2, Phone, Mail, Briefcase,
  ChevronRight, MoreHorizontal
} from "lucide-react";
import api from "../../api/apiClient";
import LeaderFormModal from "../../components/LeaderFormModal";

export default function Leader() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState(null);

  // --- FETCH DATA ---
  const fetchLeaders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/members/leaders");
      // ✅ ambil dari field yang benar
      const data = res?.data?.data || [];

      const formatted = data.map(item => ({
        ...item,
        id: item.id_member || item.id,
      }));

      setLeaders(formatted);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal memuat data leader.");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchLeaders();
  }, []);

  // --- HANDLERS ---
  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus leader "${nama}" beserta datanya?`)) return;
    try {
      await api.delete(`/members/${id}`);
      setLeaders(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      alert("Gagal menghapus.");
      console.log("Gagal menghapus: ", error);
    }
  };

  const openAddModal = () => {
    setSelectedLeader(null);
    setIsModalOpen(true);
  };

  const openEditModal = (leader) => {
    setSelectedLeader(leader);
    setIsModalOpen(true);
  };

  const filteredLeaders = leaders.filter(l =>
    (l.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LOADING SKELETON ---
  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50 font-sans">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="text-blue-600" size={24} />
            </div>
            Team Leaders
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Kelola data leader dan performa tim mereka.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchLeaders}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <UserPlus size={18} />
            <span className="font-medium">Tambah Leader</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-2">
        <div className="p-2 text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Cari nama leader atau email..."
          className="w-full py-2 bg-transparent outline-none text-gray-700 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* CONTENT: TABLE LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredLeaders.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-medium">Data tidak ditemukan</h3>
            <p className="text-gray-500 text-sm mt-1">Belum ada leader yang ditambahkan atau tidak sesuai pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-semibold">Profil Leader</th>
                  <th className="px-6 py-4 font-semibold">Kontak</th>
                  <th className="px-6 py-4 font-semibold text-center">Tim Member</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLeaders.map((leader) => {
                  const initial = (leader.nama || "U").charAt(0).toUpperCase();

                  return (
                    <tr key={leader.id} className="group hover:bg-blue-50/30 transition-colors duration-200">

                      {/* PROFIL */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 font-bold text-lg flex items-center justify-center shadow-sm border border-white">
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{leader.nama}</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 mt-1">
                              Leader
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* KONTAK */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} className="text-gray-400" />
                            <span className="truncate max-w-[150px]">{leader.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} className="text-gray-400" />
                            <span>{leader.kontak || "-"}</span>
                          </div>
                        </div>
                      </td>

                      {/* STATISTIK MEMBER */}
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${leader.total_members > 0
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-gray-50 text-gray-500 border-gray-100"
                          }`}>
                          <Users size={12} className="mr-1.5" />
                          {leader.total_members} Member
                        </div>
                      </td>

                      {/* AKSI */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(leader)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(leader.id, leader.nama)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
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
        <LeaderFormModal
          leaderData={selectedLeader}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            fetchLeaders();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}