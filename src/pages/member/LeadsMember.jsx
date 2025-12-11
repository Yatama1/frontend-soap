import React, { useEffect, useState } from "react";
import { 
  Users, UserPlus, Search, RefreshCw, 
  Edit, Trash2, Phone, Filter, Calendar
} from "lucide-react";
// Sesuaikan path ke api client utama Anda
import api from "../../api/apiClient"; 
import LeadsFormModal from "../../components/LeadsFormModal"; 

export default function LeadsMember() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cabuy"); 
      const rawData = res?.data?.data || res?.data || [];
      
      console.log("📦 Data Leads dari API:", rawData);

      const formatted = Array.isArray(rawData) ? rawData.map(item => ({
        ...item,
        id: item.id_cabuy || item.id, 
        nama: item.nama_cabuy || item.nama,
        kontak: item.kontak || "-",
        status: item.status || "Baru",
        tanggal_masuk: item.tanggal_masuk,
        tanggal_follow_up: item.tanggal_follow_up
      })) : [];

      setLeads(formatted);
    } catch (error) {
      console.error("Gagal ambil leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin hapus leads "${nama}"?`)) return;
    try {
      await api.delete(`/cabuy/${id}`);
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      alert("Gagal menghapus data.");
    }
  };

  const openAddModal = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const filteredLeads = leads.filter(l => {
    const term = searchTerm.toLowerCase();
    const matchSearch = (l.nama || "").toLowerCase().includes(term) || 
                        (l.kontak || "").includes(term);
    const matchStatus = filterStatus === "Semua" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" /> Leads Saya (CaBuY)
          </h1>
          <p className="text-gray-500 text-sm">Kelola calon pembeli properti Anda.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLeads} className="p-2 bg-white border rounded hover:bg-gray-100 shadow-sm">
            <RefreshCw size={20} className={loading ? "animate-spin text-blue-600" : "text-gray-600"} />
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-md">
            <UserPlus size={18} /> Input Leads Baru
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
          <input 
            type="text" placeholder="Cari nama atau no WA..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter size={18} className="absolute left-3 top-3.5 text-gray-400" />
          <select 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Semua">Semua Status</option>
            <option value="Baru">Baru</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Siap Survey">Siap Survey</option>
            <option value="Booking">Booking</option>
            <option value="Closing">Closing</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama Calon Pembeli</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kontak & Tgl Masuk</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-400">Sedang memuat data...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-400">Belum ada data leads.</td></tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-blue-50/30 transition group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{lead.nama}</div>
                      <div className="text-xs text-gray-400">ID: {lead.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                        <Phone size={14} className="text-gray-400"/> {lead.kontak}
                      </div>
                      {lead.tanggal_masuk && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={12}/> {new Date(lead.tanggal_masuk).toLocaleDateString("id-ID")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(lead)} className="p-2 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(lead.id, lead.nama)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <LeadsFormModal 
          cabuy={selectedLead}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            fetchLeads(); 
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}