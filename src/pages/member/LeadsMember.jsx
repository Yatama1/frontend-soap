// pages/member/LeadsMember.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2 } from "lucide-react";
import LeadsFormModal from "../../components/LeadsFormModal";
import api from "../../api/apiClient"; // gunakan apiClient jika ada; jika tidak, ganti ke axios base url

export default function LeadsMember() {
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Ambil data leads dari backend
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cabuy");
      const payload = res?.data ?? [];
      setLeads(Array.isArray(payload) ? payload : payload.data ?? []);
      console.log("sample cabuy:", (Array.isArray(payload) && payload[0]) || payload?.data?.[0]);
    } catch (err) {
      console.error("Gagal mengambil data leads:", err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAdd = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cabuy) => {
    setSelectedLead(cabuy);
    setIsModalOpen(true);
  };

  const handleDelete = async (id_cabuy) => {
    if (!id_cabuy) {
      alert("ID leads tidak valid");
      return;
    }
    if (!window.confirm("Yakin ingin menghapus leads ini?")) return;
    try {
      setDeletingId(id_cabuy);
      await api.delete(`/cabuy/${id_cabuy}`);
      // update local state tanpa fetch full lagi:
      setLeads((prev) => prev.filter((c) => (c.id_cabuy ?? c.id) !== id_cabuy));
    } catch (err) {
      console.error("Gagal menghapus leads:", err);
      alert("Gagal menghapus leads: " + (err?.response?.data?.message || err?.message || err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-red-600">Data Leads</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-gray-900 text-red-600 px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          <Plus size={18} /> Tambah Leads
        </button>
      </div>

      <div className="overflow-x-auto bg-gray-900 shadow rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-400">
              <th className="p-3 border-b">No</th>
              <th className="p-3 border-b">Nama</th>
              <th className="p-3 border-b">Telepon</th>
              <th className="p-3 border-b">Tanggal Follow Up</th>
              <th className="p-3 border-b">Tanggal Masuk</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-6 text-gray-400">Memuat data...</td>
              </tr>
            ) : leads.length > 0 ? (
              leads.map((cabuy, index) => {
                const idCabuy = cabuy?.id_cabuy ?? cabuy?.id;
                return (
                  <tr key={idCabuy ?? `cabuy-${index}`} className="hover:bg-gray-950">
                    <td className="p-3 border-b text-gray-300">{index + 1}</td>
                    <td className="p-3 border-b text-gray-300">{cabuy.nama_cabuy}</td>
                    <td className="p-3 border-b text-gray-300">{cabuy.kontak}</td>
                    <td className="p-3 border-b text-gray-300">{cabuy.tanggal_follow_up ? new Date(cabuy.tanggal_follow_up).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="p-3 border-b text-gray-300">{cabuy.tanggal_masuk ? new Date(cabuy.tanggal_masuk).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="p-3 border-b text-gray-300">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${cabuy.status === "Closing"
                          ? "bg-green-100 text-green-700"
                          : cabuy.status === "Follow Up"
                            ? "bg-yellow-100 text-yellow-700"
                            : cabuy.status === "Lost"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {cabuy.status}
                      </span>
                    </td>

                    <td className="p-3 border-b text-center">
                      <button
                        onClick={() => handleEdit(cabuy)}
                        className="text-yellow-500 hover:text-yellow-600 mr-3"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(idCabuy)}
                        className="text-red-500 hover:text-red-600"
                        disabled={deletingId === idCabuy}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-500 italic">
                  Belum ada data Leads
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <LeadsFormModal
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            fetchLeads();
          }}
          cabuy={selectedLead}
        />
      )}
    </div>
  );
}
