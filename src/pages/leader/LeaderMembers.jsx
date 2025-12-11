// src/pages/leader/LeaderMembers.jsx
import React, { useEffect, useState } from "react";
import { Users, UserPlus, Search, RefreshCw, Edit, Trash2, Phone, Mail } from "lucide-react";
import api from "../../api/apiClient";
import MemberFormModal from "../../components/MemberFormModal"; // 🔥 pakai modal global

export default function LeaderMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null); // null = tambah, objek = edit

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

  // --- HANDLERS (Delete, Add, Edit) ---
  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin hapus member "${nama}"?`)) return;
    try {
      await api.delete(`/members/${id}`);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      alert("Gagal menghapus.");
    }
  };

  const openAddModal = () => {
    setSelectedMember(null);     // -> MemberFormModal akan masuk mode "add"
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setSelectedMember(member);   // -> MemberFormModal akan masuk mode "edit"
    setIsModalOpen(true);
  };

  const filteredMembers = members.filter(m => 
    m.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" /> Member Binaan
          </h1>
          <p className="text-gray-500 text-sm">Kelola tim dan pantau produktivitas leads mereka.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchMembers} className="p-2 bg-white border rounded hover:bg-gray-100 shadow-sm">
            <RefreshCw size={20} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-md"
          >
            <UserPlus size={18} /> Tambah Member
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama member..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama Member</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kontak</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Total Leads</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-400">Belum ada member.</td></tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/30 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3 shadow-sm">
                          {m.nama ? m.nama.charAt(0).toUpperCase() : "M"}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{m.nama}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail size={10}/> {m.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone size={14}/> {m.kontak || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        m.total_leads > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
                      }`}>
                        {m.total_leads} Leads
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                        >
                          <Edit size={16}/>
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.nama)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: pakai MemberFormModal global */}
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
