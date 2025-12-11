// src/pages/senior/Leader.jsx
import React, { useEffect, useState } from "react";
import { Users, UserPlus, Search, RefreshCw, Edit, Trash2, Phone } from "lucide-react";
import api from "../../api/apiClient";
import LeaderFormModal from "../../components/LeaderFormModal"; // 🔥 pakai modal global

export default function Leader() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState(null);

  const fetchLeaders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/members");
      const data = res?.data?.members || [];

      console.log("Data Leaders dari API:", data);

      const formatted = data
        .map(item => ({
          ...item,
          id: item.id_member || item.id,
          nama: item.nama || item.nama_member,
          total_members: item.total_members ? parseInt(item.total_members) : 0,
        }));

      setLeaders(formatted);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus leader "${nama}"?`)) return;
    try {
      await api.delete(`/members/${id}`);
      setLeaders(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      alert("Gagal menghapus.");
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" /> Leaders Saya
          </h1>
          <p className="text-gray-500 text-sm">Kelola tim leader Anda di sini.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLeaders}
            className="p-2 bg-white border rounded hover:bg-gray-100 shadow-sm"
          >
            <RefreshCw size={20} className={loading ? "animate-spin text-blue-600" : "text-gray-600"} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-md"
          >
            <UserPlus size={18} /> Tambah Leader
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama leader..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama Leader</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kontak</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Total Member</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLeaders.map((leader) => (
              <tr key={leader.id} className="hover:bg-blue-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3">
                      {leader.nama ? leader.nama.substring(0, 2).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{leader.nama}</div>
                      <div className="text-xs text-gray-500">{leader.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14}/> {leader.kontak || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    leader.total_members > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}>
                    {leader.total_members} Orang
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(leader)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                    >
                      <Edit size={18}/>
                    </button>
                    <button
                      onClick={() => handleDelete(leader.id, leader.nama)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeaders.length === 0 && (
          <p className="p-8 text-center text-gray-400">Tidak ada data leader.</p>
        )}
      </div>

      {/* MODAL: pakai LeaderFormModal global */}
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
