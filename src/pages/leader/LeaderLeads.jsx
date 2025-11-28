// src/pages/leader/LeaderLeads.jsx
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import LeadsFormModal from "../../components/LeadsFormModal";
import api from "../../api/apiClient";

export default function LeaderLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const leaderId = user?.id_member || user?.id || null;

  useEffect(() => {
    if (leaderId) fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderId]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      // try param leader_id first
      const res = await api.get("/cabuy", { params: { leader_id: leaderId } });
      const payload = res?.data ?? [];
      const items = Array.isArray(payload) ? payload : payload.data ?? [];
      setLeads(items);
    } catch (err) {
      // fallback to leader specific endpoint if exists
      try {
        const res2 = await api.get(`/cabuy/leader/${leaderId}`);
        const payload2 = res2?.data ?? [];
        const items2 = Array.isArray(payload2) ? payload2 : payload2.data ?? [];
        setLeads(items2);
      } catch (err2) {
        console.error("Gagal mengambil leads untuk leader:", err2);
        setLeads([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (c) => {
    setEditing(c);
    setShowModal(true);
  };

  const handleStatusChange = async (id_cabuy, status) => {
    try {
      await api.put(`/cabuy/${id_cabuy}`, { status });
      fetchLeads();
    } catch (err) {
      console.error("Gagal update status:", err);
      alert("Gagal update status.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Leads Tim</h2>
        <button onClick={fetchLeads} className="px-3 py-2 border rounded">Refresh</button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 border-b">No</th>
              <th className="p-3 border-b">Nama</th>
              <th className="p-3 border-b">Kontak</th>
              <th className="p-3 border-b">Member</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center">Memuat...</td></tr>
            ) : leads.length ? (
              leads.map((l, idx) => {
                const id = l.id_cabuy ?? l.id;
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{idx + 1}</td>
                    <td className="p-3 border-b">{l.nama_cabuy}</td>
                    <td className="p-3 border-b">{l.kontak}</td>
                    <td className="p-3 border-b">{l.Member?.nama_member ?? l.member_name ?? "-"}</td>
                    <td className="p-3 border-b">
                      <span className="px-3 py-1 rounded-full bg-gray-100">{l.status}</span>
                    </td>
                    <td className="p-3 border-b text-center">
                      <button onClick={() => openEdit(l)} className="text-yellow-500 mr-3" title="Edit">
                        <Pencil size={16} />
                      </button>

                      {/* contoh quick actions */}
                      <div className="inline-flex gap-2">
                        <button className="px-2 py-1 text-xs border rounded" onClick={() => handleStatusChange(id, "Survey")}>Set Survey</button>
                        <button className="px-2 py-1 text-xs border rounded" onClick={() => handleStatusChange(id, "Closing")}>Set Closing</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500 italic">Belum ada leads</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <LeadsFormModal
          cabuy={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { setShowModal(false); setEditing(null); fetchLeads(); }}
        />
      )}
    </div>
  );
}
