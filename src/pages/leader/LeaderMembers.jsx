// src/pages/leader/LeaderMembers.jsx
import React, { useEffect, useState } from "react";
import { RefreshCw, Plus, Edit2, Trash2 } from "lucide-react";
import api from "../../api/apiClient";

export default function LeaderMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [selected, setSelected] = useState(null); // selected member object
  const [selectedCountLoading, setSelectedCountLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Leader identity from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const leaderId = user?.id_member ?? user?.id ?? null;

  useEffect(() => {
    if (!leaderId) return;
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderId]);

  const getId = (o) => o?.id_member ?? o?.id;

  const fetchMembers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.get("/members", { params: { leader_id: leaderId, jabatan: "member" } });
      const payload = res?.data ?? [];
      let items = Array.isArray(payload) ? payload : payload.members ?? payload.data ?? [];
      items = items.filter(it => ((it.jabatan ?? it.role) || "").toString().toLowerCase() === "member");
      setMembers(items);

      if (selected) {
        const exists = items.some(it => getId(it) === getId(selected));
        if (!exists) setSelected(null);
      }
    } catch (err) {
      console.error("fetchMembers error", err);
      // fallback endpoint
      try {
        const r2 = await api.get(`/leader/${leaderId}/members`);
        const p2 = r2?.data ?? [];
        const items2 = Array.isArray(p2) ? p2 : p2.members ?? p2.data ?? [];
        setMembers(items2.filter(it => ((it.jabatan ?? it.role) || "").toString().toLowerCase() === "member"));
      } catch (err2) {
        console.error("fallback fetchMembers error", err2);
        setErrorMsg("Gagal mengambil daftar member. Periksa koneksi/backend.");
        setMembers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (m) => {
    setSelected(m);
    setSelectedCountLoading(true);
    setTimeout(() => setSelectedCountLoading(false), 150);
  };

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setShowModal(true);
  };

  const handleDelete = async (m) => {
    const id = getId(m);
    if (!id) return;
    if (!window.confirm(`Hapus member "${m.nama ?? m.nama_member}"?`)) return;
    try {
      setDeletingId(id);
      await api.delete(`/members/${id}`);
      setMembers(prev => prev.filter(item => getId(item) !== id));
      if (selected && getId(selected) === id) setSelected(null);
    } catch (err) {
      console.error("delete member error", err);
      alert(err?.response?.data?.message || "Gagal menghapus member.");
    } finally {
      setDeletingId(null);
    }
  };

  const submitMember = async (form) => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const payload = {
        nama: form.nama,
        email: form.email,
        kontak: form.kontak || undefined,
        // FORCED: member role only (no dropdown) — ensures leader-created users are members
        jabatan: "member",
      };

      if (form.password && form.password.trim()) payload.password = form.password;

      // include leader relation
      if (leaderId) {
        payload.id_leader = leaderId;
        payload.leader_id = leaderId;
      }

      if (editing) {
        const id = getId(editing);
        const res = await api.put(`/members/${id}`, payload);
        const updated = res?.data?.data ?? res?.data ?? null;
        if (updated) {
          setMembers(prev => prev.map(item => (getId(item) === id ? { ...item, ...updated } : item)));
          if (selected && getId(selected) === id) setSelected(prev => ({ ...prev, ...updated }));
        } else {
          await fetchMembers();
        }
      } else {
        const res = await api.post("/members", payload);
        const created = res?.data?.data ?? res?.data ?? null;
        if (created) {
          setMembers(prev => {
            const idCreated = getId(created);
            if (prev.some(p => (getId(p) === idCreated))) return prev;
            return [...prev, created];
          });
        } else {
          await fetchMembers();
        }
      }

      setShowModal(false);
      setEditing(null);
    } catch (err) {
      console.error("submitMember error", err);
      const msg = err?.response?.data?.message || JSON.stringify(err?.response?.data) || err?.message || "Gagal menyimpan";
      setErrorMsg(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const renderId = (m) => getId(m) ?? "-";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Member Bawahan</h2>
            <p className="text-sm text-gray-500">Menampilkan semua member yang dimiliki oleh leader Anda.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={openAdd} className="px-3 py-2 rounded-md bg-green-600 text-white flex items-center gap-2">
              <Plus size={14} /> Tambah
            </button>
            <button onClick={fetchMembers} className="px-4 py-2 rounded-md border bg-white flex items-center gap-2">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {errorMsg && <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{errorMsg}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* left: members table */}
          <div className="lg:col-span-2">
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium border-b">No</th>
                    <th className="p-3 text-left text-sm font-medium border-b">Nama</th>
                    <th className="p-3 text-left text-sm font-medium border-b hidden md:table-cell">Email</th>
                    <th className="p-3 text-left text-sm font-medium border-b hidden lg:table-cell">Kontak</th>
                    <th className="p-3 text-left text-sm font-medium border-b">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="p-6 text-center">Memuat...</td></tr>
                  ) : members.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-500 italic">Belum ada member</td></tr>
                  ) : (
                    members.map((m, idx) => {
                      const id = getId(m);
                      const isSelected = selected && getId(selected) === id;
                      return (
                        <tr
                          key={id}
                          onClick={() => onSelect(m)}
                          className={`cursor-pointer ${isSelected ? "bg-sky-50" : "hover:bg-slate-50"}`}
                        >
                          <td className="p-3 border-b">{idx + 1}</td>
                          <td className="p-3 border-b font-medium">{m.nama_member ?? m.nama}</td>
                          <td className="p-3 border-b hidden md:table-cell text-sm text-gray-600">{m.email}</td>
                          <td className="p-3 border-b hidden lg:table-cell text-sm text-gray-600">{m.kontak}</td>
                          <td className="p-3 border-b text-sm text-gray-700">{renderId(m)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* right: biodata panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-4 min-h-[180px] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold">Biodata Member</h3>
                {!selected ? (
                  <p className="mt-3 text-sm text-gray-400 italic">Klik salah satu member di kiri untuk melihat biodata dan aksi.</p>
                ) : (
                  <div className="mt-3 space-y-2 text-sm">
                    <div><span className="text-gray-500">Nama: </span><span className="font-medium">{selected.nama_member ?? selected.nama}</span></div>
                    <div><span className="text-gray-500">Email: </span><span className="font-medium">{selected.email}</span></div>
                    <div><span className="text-gray-500">Kontak: </span><span className="font-medium">{selected.kontak ?? "-"}</span></div>
                    <div><span className="text-gray-500">Jabatan: </span><span className="font-medium">{selected.jabatan ?? selected.role ?? "member"}</span></div>
                    <div><span className="text-gray-500">ID: </span><span className="font-medium">{renderId(selected)}</span></div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3 justify-end">
                <button
                  onClick={() => selected && openEdit(selected)}
                  disabled={!selected}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${selected ? "bg-white border hover:shadow-sm" : "opacity-50 cursor-not-allowed"}`}
                >
                  <Edit2 size={14} /> Edit
                </button>

                <button
                  onClick={() => selected && handleDelete(selected)}
                  disabled={!selected}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 ${selected ? "bg-white border hover:shadow-sm" : "opacity-50 cursor-not-allowed"}`}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal add/edit */}
        {showModal && (
          <MemberModal
            initial={editing}
            onClose={() => { setShowModal(false); setEditing(null); }}
            onSubmit={submitMember}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}

// Member modal component (create / edit)
// NOTE: removed dropdown for jabatan — role is forced to "member" on submit.
// This keeps leader-created users as members and prevents selecting jabatan.
function MemberModal({ initial, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({
    nama: initial?.nama ?? initial?.nama_member ?? "",
    email: initial?.email ?? "",
    kontak: initial?.kontak ?? "",
    password: "",
  });
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setForm({
      nama: initial?.nama ?? initial?.nama_member ?? "",
      email: initial?.email ?? "",
      kontak: initial?.kontak ?? "",
      password: "",
    });
    setLocalError("");
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!form.nama?.trim()) return setLocalError("Nama wajib diisi.");
    if (!form.email?.trim()) return setLocalError("Email wajib diisi.");
    if (!validateEmail(form.email)) return setLocalError("Format email tidak valid.");
    if (!initial && !form.password) return setLocalError("Password wajib untuk user baru.");
    if (form.password && form.password.length > 0 && form.password.length < 6) return setLocalError("Password minimal 6 karakter.");

    // Build payload for parent onSubmit — parent will force jabatan: "member"
    await onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
        <h3 className="text-lg font-semibold mb-3">{initial ? "Edit Member" : "Tambah Member"}</h3>

        {localError && <div className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded">{localError}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="nama" value={form.nama} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Nama" required />
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Email" required />
          <input name="kontak" value={form.kontak} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Kontak" />

          {/* note: removed jabatan select */}
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder={initial ? "Kosongkan jika tidak ingin ubah password" : "Password (min 6)"}
            {...(!initial ? { required: true } : {})}
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Batal</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-blue-600 text-white">{submitting ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
