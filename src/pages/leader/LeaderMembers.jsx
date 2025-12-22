import React, { useEffect, useState } from "react";
import { 
  Users, UserPlus, Search, RefreshCw, 
  Edit, Trash2, Phone, Mail, UserCheck, 
  TrendingUp, MoreVertical 
} from "lucide-react";
import api from "../../api/apiClient";
import MemberFormModal from "../../components/MemberFormModal";

export default function LeaderMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // --- FETCH DATA ---
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/members"); 
      const data = res?.data?.members || [];
      
      const formatted = data.map(item => ({
        ...item,
        id: item.id_member || item.id,
        nama: item.nama || item.nama_member,
        total_leads: item.total_leads ? parseInt(item.total_leads) : 0
      }));

      setMembers(formatted);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // --- HANDLERS ---
  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin hapus member "${nama}"? Data yang dihapus tidak bisa dikembalikan.`)) return;
    try {
      await api.delete(`/members/${id}`);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      alert("Gagal menghapus.");
    }
  };

  const openAddModal = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const filteredMembers = members.filter(m => 
    (m.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.email || "").toLowerCase().includes(searchTerm.toLowerCase())
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
            <UserCheck className="text-blue-600" size={28} /> 
            Member Binaan
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola anggota tim Anda dan pantau perolehan leads mereka.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchMembers} 
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
            <span className="font-medium">Tambah Member</span>
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
          placeholder="Cari member berdasarkan nama atau email..."
          className="w-full py-2 bg-transparent outline-none text-gray-700 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* CONTENT: TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredMembers.length === 0 ? (
           <div className="text-center py-20">
             <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <Users size={32} className="text-gray-300" />
             </div>
             <h3 className="text-gray-900 font-medium">Tidak ada member ditemukan</h3>
             <p className="text-gray-500 text-sm mt-1">Silakan tambah member baru untuk memulai.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-semibold">Profil Member</th>
                  <th className="px-6 py-4 font-semibold">Kontak</th>
                  <th className="px-6 py-4 font-semibold text-center">Performa Leads</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.map((m) => {
                  const initial = (m.nama || "M").charAt(0).toUpperCase();

                  return (
                    <tr key={m.id} className="group hover:bg-blue-50/30 transition-colors duration-200">
                      
                      {/* PROFIL */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{m.nama}</p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                              <Mail size={10} /> {m.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* KONTAK */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2 bg-gray-50 w-fit px-2 py-1 rounded text-xs border border-gray-100">
                          <Phone size={12} className="text-gray-400" /> 
                          {m.kontak || "-"}
                        </div>
                      </td>

                      {/* TOTAL LEADS */}
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          m.total_leads > 0 
                            ? "bg-blue-50 text-blue-700 border-blue-100" 
                            : "bg-gray-50 text-gray-400 border-gray-100"
                        }`}>
                          <TrendingUp size={12} />
                          {m.total_leads} Leads
                        </div>
                      </td>

                      {/* AKSI */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                            title="Edit Data"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.nama)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Hapus Member"
                          >
                            <Trash2 size={16} />
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
        <MemberFormModal
          member={selectedMember}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            fetchMembers();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}