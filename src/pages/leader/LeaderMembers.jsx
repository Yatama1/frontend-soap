// src/pages/leader/LeaderMembers.jsx
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../../api/apiClient";

export default function LeaderMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ambil leader user dari localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const leaderId = user?.id_member || user?.id || null;

  useEffect(() => {
    if (leaderId) fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      // primary: try param leader_id
      const res = await api.get("/member", { params: { leader_id: leaderId } });
      const payload = res?.data ?? [];
      // payload might be { data: [...] } or [...]
      const items = Array.isArray(payload) ? payload : payload.data ?? [];
      setMembers(items);
    } catch (err) {
      // fallback: try leader specific endpoint
      try {
        const res2 = await api.get(`/leader/${leaderId}/members`);
        const payload2 = res2?.data ?? [];
        const items2 = Array.isArray(payload2) ? payload2 : payload2.data ?? [];
        setMembers(items2);
      } catch (err2) {
        console.error("Gagal mengambil members untuk leader:", err2);
        setMembers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setShowModal(true);
  };

  const handleDelete = async (id_member) => {
    if (!window.confirm("Yakin ingin menghapus member ini?")) return;
    try {
      setDeletingId(id_member);
      await api.delete(`/member/${id_member}`);
      await fetchMembers();
    } catch (err) {
      console.error("Gagal menghapus member:", err);
      alert("Gagal menghapus member.");
    } finally {
      setDeletingId(null);
    }
  };

  // Modal internal form for add/edit (keperluan leader)
  function MemberModal({ open, onClose, initial }) {
    const [form, setForm] = useState({
      nama_member: initial?.nama_member || "",
      email: initial?.email || "",
      kontak: initial?.kontak || "",
      jabatan: initial?.jabatan || "Member",
    });
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
      setForm({
        nama_member: initial?.nama_member || "",
        email: initial?.email || "",
        kontak: initial?.kontak || "",
        jabatan: initial?.jabatan || "Member",
      });
    }, [initial]);

    if (!open) return null;

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((p) => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!form.nama_member) return alert("Nama wajib diisi");
      setSubmitting(true);
      try {
        if (initial) {
          // edit member (leader can only edit members under him but backend should enforce)
          await api.put(`/member/${initial.id_member || initial.id}`, {
            ...form,
            leader_id: leaderId, // ensure still assigned to this leader
          });
        } else {
          // create member assigned to this leader
          await api.post("/member", {
            ...form,
            leader_id: leaderId,
            // default password optional or handled by backend
          });
        }
        onClose();
        fetchMembers();
      } catch (err) {
        console.error("Gagal simpan member:", err);
        alert(err?.response?.data?.message || "Gagal menyimpan member");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
          <h3 className="font-semibold mb-3">{initial ? "Edit Member" : "Tambah Member"}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input name="nama_member" value={form.nama_member} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Nama" required />
            <input name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Email" />
            <input name="kontak" value={form.kontak} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Kontak" />
            <select name="jabatan" value={form.jabatan} onChange={handleChange} className="w-full border p-2 rounded">
              <option>Member</option>
              <option>Leader</option>
              <option>Senior</option>
              <option>Admin</option>
            </select>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Batal</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-blue-600 text-white">{submitting ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Member Bawahan</h2>
        <div className="flex items-center gap-3">
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus size={16} /> Tambah Member
          </button>
          <button onClick={fetchMembers} className="px-3 py-2 border rounded">Refresh</button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 border-b">No</th>
              <th className="p-3 border-b">Nama</th>
              <th className="p-3 border-b">Kontak</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Jabatan</th>
              <th className="p-3 border-b text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center">Memuat...</td></tr>
            ) : members.length ? (
              members.map((m, idx) => {
                const id = m.id_member ?? m.id;
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{idx + 1}</td>
                    <td className="p-3 border-b">{m.nama_member}</td>
                    <td className="p-3 border-b">{m.kontak}</td>
                    <td className="p-3 border-b">{m.email}</td>
                    <td className="p-3 border-b">{m.jabatan}</td>
                    <td className="p-3 border-b text-center">
                      <button onClick={() => openEdit(m)} className="text-yellow-500 mr-3" title="Edit"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(id)} className="text-red-500" disabled={deletingId === id} title="Hapus"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500 italic">Belum ada member</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <MemberModal open={showModal} onClose={() => setShowModal(false)} initial={editing} />
    </div>
  );
}
