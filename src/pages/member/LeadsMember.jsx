import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import LeadsFormModal from "../../components/LeadsFormModal";
import api from "../../api/apiClient";

export default function LeadsMember() {
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ✅ ambil data user yang login dari localStorage (TIDAK DIUBAH)
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ BARU: pastikan kita punya id member yang benar
  //    kalau di auth kamu pakai "id", kita fallback ke user.id
  const memberId = user.id_member || user.id; // ⬅️ DITAMBAHKAN

  // 🔥 hanya ambil leads yang dimiliki member login
  const fetchLeads = async () => {
    setLoading(true);
    try {
      // ❌ SEBELUM:
      // const res = await api.get(`/cabuy?member_id=${user.id}`);

      // ✅ SESUDAH: pakai memberId + params (lebih aman)
      const res = await api.get("/cabuy", {
        params: { member_id: memberId }, // ⬅️ INI YANG PENTING
      });

      const payload = res?.data ?? [];
      setLeads(Array.isArray(payload) ? payload : payload.data ?? []);
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
    if (!window.confirm("Yakin ingin menghapus leads ini?")) return;

    try {
      setDeletingId(id_cabuy);
      await api.delete(`/cabuy/${id_cabuy}`);
      setLeads((prev) => prev.filter((c) => (c.id_cabuy ?? c.id) !== id_cabuy));
    } catch (err) {
      console.error("Gagal menghapus leads:", err);
      alert("Gagal menghapus leads.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Data Leads</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} /> Tambah Leads
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
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
                <td colSpan={7} className="text-center p-6">Memuat data...</td>
              </tr>
            ) : leads.length > 0 ? (
              leads.map((cabuy, index) => {
                const idCabuy = cabuy.id_cabuy ?? cabuy.id;
                return (
                  <tr key={idCabuy} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{index + 1}</td>
                    <td className="p-3 border-b">{cabuy.nama_cabuy}</td>
                    <td className="p-3 border-b">{cabuy.kontak}</td>
                    <td className="p-3 border-b">
                      {cabuy.tanggal_follow_up
                        ? new Date(cabuy.tanggal_follow_up).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="p-3 border-b">
                      {cabuy.tanggal_masuk
                        ? new Date(cabuy.tanggal_masuk).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="p-3 border-b">
                      <span className="px-3 py-1 rounded-full text-sm">
                        {cabuy.status}
                      </span>
                    </td>
                    <td className="p-3 border-b text-center">
                      <button
                        onClick={() => handleEdit(cabuy)}
                        className="text-yellow-500 mr-3"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(idCabuy)}
                        className="text-red-500"
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
            fetchLeads(); // ⬅️ reload lagi setelah tambah/edit
          }}
          cabuy={selectedLead}
        />
      )}
    </div>
  );
}
