import React, { useEffect, useState } from "react";
// 🔥 BARU: Import icon agar tampilan lebih menarik
import { 
  Users, UserPlus, Search, RefreshCw, 
  Edit, Trash2, Phone, Mail 
} from "lucide-react";
import api from "../../api/apiClient";

export default function Leader() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 🔥 BARU: State Modal disatukan biar code lebih bersih
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" atau "edit"
  const [selectedLeader, setSelectedLeader] = useState(null);

  // --- FETCH DATA ---
  const fetchLeaders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/members"); 
      const data = res?.data?.members || [];
      
      // 🔥 BARU: Debugging untuk melihat data dari backend
      console.log("Data Leaders dari API:", data);

      const formatted = data
        .filter(item => (item.jabatan || item.role) === 'leader')
        .map(item => ({
          ...item,
          id: item.id_member || item.id,
          // 🔥 BARU: Ambil 'total_members' dari backend. Jika error/null, set 0.
          total_members: item.total_members ? parseInt(item.total_members) : 0 
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

  // --- HANDLERS (Delete, Modal, Submit) ---
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
    setModalMode("add");
    setSelectedLeader(null);
    setIsModalOpen(true);
  };

  const openEditModal = (leader) => {
    setModalMode("edit");
    setSelectedLeader(leader);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (modalMode === "add") {
        await api.post("/members", { ...formData, jabatan: "leader" });
      } else {
        await api.put(`/members/${selectedLeader.id}`, formData);
      }
      fetchLeaders();
      setIsModalOpen(false);
    } catch (error) {
      alert("Gagal menyimpan data.");
    }
  };

  // Filter Search
  const filteredLeaders = leaders.filter(l => 
    l.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* 🔥 BARU: HEADER SECTION DENGAN BUTTON */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" /> Leaders Saya
          </h1>
          <p className="text-gray-500 text-sm">Kelola tim leader Anda di sini.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLeaders} className="p-2 bg-white border rounded hover:bg-gray-100 shadow-sm">
            <RefreshCw size={20} className={loading ? "animate-spin text-blue-600" : "text-gray-600"} />
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-md">
            <UserPlus size={18} /> Tambah Leader
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
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

      {/* 🔥 BARU: TABEL DENGAN DESIGN CARD */}
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
                    {/* 🔥 BARU: Avatar Inisial */}
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3">
                      {leader.nama ? leader.nama.substring(0,2).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{leader.nama}</div>
                      <div className="text-xs text-gray-500">{leader.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                   <div className="flex items-center gap-2"><Phone size={14}/> {leader.kontak || "-"}</div>
                </td>
                
                {/* 🔥 BARU: Highlight Jumlah Member */}
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${leader.total_members > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {leader.total_members} Orang
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(leader)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(leader.id, leader.nama)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeaders.length === 0 && <p className="p-8 text-center text-gray-400">Tidak ada data leader.</p>}
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <LeaderFormModal 
          mode={modalMode} 
          initialData={selectedLeader} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleModalSubmit} 
        />
      )}
    </div>
  );
}

// 🔥 BARU: Sub-komponen Modal Form
function LeaderFormModal({ mode, initialData, onClose, onSubmit }) {
  const [form, setForm] = useState({ nama: "", email: "", kontak: "", password: "" });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        nama: initialData.nama || "",
        email: initialData.email || "",
        kontak: initialData.kontak || "",
        password: ""
      });
    }
  }, [mode, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-4">{mode === "add" ? "Tambah Leader" : "Edit Leader"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required className="w-full border p-2 rounded" placeholder="Nama" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} />
          <input required type="email" className="w-full border p-2 rounded" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input className="w-full border p-2 rounded" placeholder="Kontak" value={form.kontak} onChange={e => setForm({...form, kontak: e.target.value})} />
          <input type="password" className="w-full border p-2 rounded" placeholder={mode === "add" ? "Password (Wajib)" : "Password (Opsional)"} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={mode === "add"} />
          
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border p-2 rounded hover:bg-gray-50">Batal</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}