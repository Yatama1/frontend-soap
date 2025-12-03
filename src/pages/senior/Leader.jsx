// src/pages/senior/Leader.jsx
import React, { useEffect, useState } from "react";
import { RefreshCw, Users, Edit2, Trash2, Plus } from "lucide-react";
import api from "../../api/apiClient";

export default function Leader() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedMembersCount, setSelectedMembersCount] = useState(null);
  const [loadingCount, setLoadingCount] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // NEW: add leader modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const seniorId = user?.id ?? user?.id_member ?? null;
  const userRole = (user?.jabatan || user?.role || "").toString().toLowerCase();

  useEffect(() => {
    if (!seniorId) return;
    if (!userRole.includes("senior")) {
      setError("Hanya akun Senior yang dapat melihat halaman ini.");
      return;
    }
    fetchLeaders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seniorId]);

  const getId = (o) => o?.id_member ?? o?.id;

  /* -------------------------
     FETCH LEADERS + COUNTS
     ------------------------- */
  // fetch leaders
  const fetchLeaders = async () => {
    setLoading(true);
    setError("");
    try {
      // request daftar leader milik senior
      // beberapa backend memakai query param berbeda; gunakan 'senior_id' & 'seniorId' fallback
      const res = await api.get("/members", { params: { senior_id: seniorId, jabatan: "leader" } });
      const payload = res?.data ?? [];
      let items = Array.isArray(payload) ? payload : payload.members ?? payload.data ?? [];
      // pastikan cuma 'leader' masuk
      items = items.filter(it => ((it.jabatan ?? it.role) || "").toString().toLowerCase() === "leader");

      // normalize minimal fields and preserve original object
      const normalized = items.map(i => ({
        ...i,
        id_member: i.id_member ?? i.id ?? i._id,
        // ensure nama/email/kontak fields available for rendering consistency
        nama: i.nama ?? i.name ?? i.fullname ?? "",
        email: i.email ?? "",
        kontak: i.kontak ?? i.phone ?? i.no_hp ?? ""
      }));

      setLeaders(normalized);

      // setelah leaders tersedia, fetch counts paralel (agar table langsung akurat)
      fetchAllMemberCounts(normalized);
    } catch (err) {
      console.error("fetchLeaders error", err);
      setError("Gagal mengambil daftar leader. Periksa koneksi/backend.");
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  // fetch members count for a single leader (uses leaderId param). returns number
  const fetchMembersCount = async (leader) => {
    const lid = getId(leader);
    if (!lid) return 0;
    setLoadingCount(true);
    try {
      // primary try: query param leaderId (controller mendukung leaderId)
      const r = await api.get("/members", { params: { leaderId: lid } });
      const p = r?.data ?? [];
      const arr = Array.isArray(p) ? p : p.members ?? p.data ?? [];

      // filter accidental leader-records and ensure id_leader matches if present
      const filtered = (arr || []).filter(m => {
        const jab = (m.jabatan ?? m.role ?? "").toString().toLowerCase();
        if (jab.includes("leader")) return false;
        if (m.id_leader !== undefined || m.leaderId !== undefined || m.leader_id !== undefined) {
          return Number(m.id_leader ?? m.leaderId ?? m.leader_id ?? -1) === Number(lid);
        }
        return true; // if server already filtered, include
      });

      const count = filtered.length;
      // update selected count and also attach to leaders list
      setSelectedMembersCount(count);
      setLeaders(prev => prev.map(it => (getId(it) === lid ? { ...it, _membersCount: count } : it)));
      return count;
    } catch (err) {
      console.error("fetchMembersCount error", err);
      // fallback: try fetching all members and filter client-side
      try {
        const r2 = await api.get("/members");
        const all = r2?.data ?? [];
        const arr2 = Array.isArray(all) ? all : all.members ?? all.data ?? [];
        const filtered = (arr2 || []).filter(m => Number(m.id_leader ?? m.leaderId ?? m.leader_id ?? -1) === Number(lid));
        const count = filtered.length;
        setSelectedMembersCount(count);
        setLeaders(prev => prev.map(it => (getId(it) === lid ? { ...it, _membersCount: count } : it)));
        return count;
      } catch (err2) {
        console.error("fetchMembersCount fallback failed", err2);
        setSelectedMembersCount(0);
        return 0;
      }
    } finally {
      setLoadingCount(false);
    }
  };

  // Fetch counts for all leaders (parallel). updates leaders with _membersCount field.
  const fetchAllMemberCounts = async (leaderList) => {
    if (!Array.isArray(leaderList) || leaderList.length === 0) return;
    try {
      // perform requests in parallel for speed
      const promises = leaderList.map(async (l) => {
        const lid = getId(l);
        if (!lid) return { lid: String(lid), count: 0 };
        try {
          const r = await api.get("/members", { params: { leaderId: lid } });
          const p = r?.data ?? [];
          const arr = Array.isArray(p) ? p : p.members ?? p.data ?? [];
          const filtered = (arr || []).filter(m => {
            const jab = (m.jabatan ?? m.role ?? "").toString().toLowerCase();
            if (jab.includes("leader")) return false;
            if (m.id_leader !== undefined || m.leaderId !== undefined || m.leader_id !== undefined) {
              return Number(m.id_leader ?? m.leaderId ?? m.leader_id ?? -1) === Number(lid);
            }
            return true;
          });
          return { lid: String(lid), count: filtered.length };
        } catch (err) {
          // fallback to 0 for that leader (do not fail whole batch)
          console.warn(`count fetch failed for leader ${lid}`, err?.message ?? err);
          return { lid: String(lid), count: 0 };
        }
      });

      const results = await Promise.all(promises);
      const countsMap = results.reduce((acc, cur) => ({ ...acc, [cur.lid]: cur.count }), {});

      // apply counts into leaders
      setLeaders(prev => prev.map(it => {
        const id = String(getId(it));
        return { ...it, _membersCount: countsMap[id] ?? (it._membersCount ?? 0) };
      }));
    } catch (err) {
      console.error("fetchAllMemberCounts error", err);
      // ignore, leaders remain as-is
    }
  };

  const onSelectLeader = async (leader) => {
    setSelectedLeader(leader);
    setSelectedMembersCount(null);
    // if we already have stored count on leader object, use it
    const cached = leader._membersCount ?? leader.membersCount;
    if (cached !== undefined && cached !== null) {
      setSelectedMembersCount(cached);
      return;
    }
    // otherwise fetch count
    await fetchMembersCount(leader);
  };

  /* -------------------------
     CRUD: Edit / Delete / Add
     ------------------------- */
  const openEdit = (leader) => {
    setEditingLeader(leader);
    setShowEditModal(true);
  };

  const handleDelete = async (leader) => {
    const id = getId(leader);
    if (!id) return;
    if (!window.confirm(`Apakah yakin ingin menghapus leader "${leader.nama ?? leader.nama_member}"?`)) return;
    try {
      await api.delete(`/members/${id}`);
      setLeaders(prev => prev.filter(it => getId(it) !== id));
      if (selectedLeader && getId(selectedLeader) === id) {
        setSelectedLeader(null);
        setSelectedMembersCount(null);
      }
    } catch (err) {
      console.error("delete leader error", err);
      alert(err?.response?.data?.message || "Gagal menghapus leader.");
    }
  };

  const submitEdit = async (form) => {
    if (!editingLeader) return;
    const id = getId(editingLeader);
    setSubmitting(true);
    try {
      const payload = {
        nama: form.nama,
        email: form.email,
        kontak: form.kontak || undefined,
        jabatan: "leader",
      };
      if (form.password && form.password.trim()) payload.password = form.password;

      const res = await api.put(`/members/${id}`, payload);
      const updated = res?.data?.data ?? res?.data ?? null;
      if (updated) {
        setLeaders(prev => prev.map(it => (getId(it) === id ? { ...it, ...updated } : it)));
        setSelectedLeader(prev => (prev && getId(prev) === id ? { ...prev, ...updated } : prev));
      } else {
        await fetchLeaders();
      }
      setShowEditModal(false);
    } catch (err) {
      console.error("submitEdit error", err);
      alert(err?.response?.data?.message || "Gagal menyimpan perubahan.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- NEW: add leader ---
  const openAdd = () => {
    setShowAddModal(true);
  };

  const submitAdd = async (form) => {
    setAdding(true);
    try {
      const payload = {
        nama: form.nama,
        email: form.email,
        kontak: form.kontak || undefined,
        jabatan: "leader",
        id_senior: seniorId,
        senior_id: seniorId,
      };
      if (form.password && form.password.trim()) payload.password = form.password;

      const res = await api.post("/members", payload);
      const created = res?.data?.data ?? res?.data ?? null;

      if (created) {
        const idCreated = getId(created);
        // set leaders with new record on top and initial count 0
        setLeaders(prev => {
          if (prev.some(p => getId(p) === idCreated)) return prev;
          return [{ ...created, _membersCount: 0 }, ...prev];
        });
        // optionally refetch counts for all to be safe (commented for perf)
        // fetchAllMemberCounts([{ ...created }, ...leaders]);
      } else {
        // fallback refresh
        await fetchLeaders();
      }

      setShowAddModal(false);
    } catch (err) {
      console.error("submitAdd error", err);
      const msg = err?.response?.data?.message || "Gagal menambah leader.";
      alert(msg);
      throw err;
    } finally {
      setAdding(false);
    }
  };

  /* -------------------------
     RENDER
     ------------------------- */
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users size={20} />
            <div>
              <h2 className="text-2xl font-semibold">Leaders Saya</h2>
              <p className="text-sm text-gray-500">Kelola leader dan lihat ringkasan members mereka.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:shadow"
            >
              <Plus size={14} /> Tambah Leader
            </button>

            <button
              onClick={fetchLeaders}
              className="px-4 py-2 rounded-md border bg-white hover:shadow-sm flex items-center gap-2"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium border-b">No</th>
                    <th className="p-3 text-left text-sm font-medium border-b">Nama</th>
                    <th className="p-3 text-left text-sm font-medium border-b hidden md:table-cell">Email</th>
                    <th className="p-3 text-left text-sm font-medium border-b hidden lg:table-cell">Kontak</th>
                    <th className="p-3 text-left text-sm font-medium border-b">Members</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="p-6 text-center">Memuat...</td></tr>
                  ) : leaders.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-500 italic">Belum ada leader</td></tr>
                  ) : (
                    leaders.map((l, idx) => {
                      const id = getId(l);
                      const isSelected = selectedLeader && getId(selectedLeader) === id;
                      const membersCount = l._membersCount ?? l.membersCount ?? "—";
                      return (
                        <tr
                          key={id}
                          onClick={() => onSelectLeader(l)}
                          className={`cursor-pointer ${isSelected ? "bg-sky-50" : "hover:bg-slate-50"}`}
                        >
                          <td className="p-3 border-b align-top">{idx + 1}</td>
                          <td className="p-3 border-b align-top font-medium">{l.nama ?? l.nama_member}</td>
                          <td className="p-3 border-b align-top hidden md:table-cell text-sm text-gray-600">{l.email}</td>
                          <td className="p-3 border-b align-top hidden lg:table-cell text-sm text-gray-600">{l.kontak}</td>
                          <td className="p-3 border-b align-top text-sm text-gray-700">{membersCount}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-4 min-h-[180px] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold">Biodata Leader</h3>
                {!selectedLeader ? (
                  <p className="mt-3 text-sm text-gray-400 italic">Pilih leader pada daftar untuk melihat biodata dan aksi.</p>
                ) : (
                  <div className="mt-3 space-y-2 text-sm">
                    <div><span className="text-gray-500">Nama: </span><span className="font-medium">{selectedLeader.nama ?? selectedLeader.nama_member}</span></div>
                    <div><span className="text-gray-500">Email: </span><span className="font-medium">{selectedLeader.email}</span></div>
                    <div><span className="text-gray-500">Kontak: </span><span className="font-medium">{selectedLeader.kontak ?? "-"}</span></div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-500">Members:</span>
                      <span className="font-semibold">{loadingCount ? "..." : (selectedMembersCount ?? (selectedLeader._membersCount ?? selectedLeader.membersCount ?? 0))}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3 justify-end">
                <button
                  onClick={() => selectedLeader && openEdit(selectedLeader)}
                  disabled={!selectedLeader}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${selectedLeader ? "bg-white border hover:shadow-sm" : "opacity-50 cursor-not-allowed"}`}
                >
                  <Edit2 size={14} /> Edit
                </button>

                <button
                  onClick={() => selectedLeader && handleDelete(selectedLeader)}
                  disabled={!selectedLeader}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 ${selectedLeader ? "bg-white border hover:shadow-sm" : "opacity-50 cursor-not-allowed"}`}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit modal */}
        {showEditModal && editingLeader && (
          <EditModal
            initial={editingLeader}
            onClose={() => { setShowEditModal(false); setEditingLeader(null); }}
            onSubmit={submitEdit}
            submitting={submitting}
          />
        )}

        {/* Add modal */}
        {showAddModal && (
          <AddModal
            onClose={() => setShowAddModal(false)}
            onSubmit={submitAdd}
            submitting={adding}
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------
   EditModal & AddModal (sama seperti sebelumnya)
   ------------------------- */
function EditModal({ initial, onClose, onSubmit, submitting }) {
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

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");
    if (!form.nama?.trim()) return setLocalError("Nama wajib diisi.");
    if (!form.email?.trim()) return setLocalError("Email wajib diisi.");
    if (!validateEmail(form.email)) return setLocalError("Format email tidak valid.");
    if (form.password && form.password.length > 0 && form.password.length < 6) return setLocalError("Password minimal 6 karakter.");
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
        <h3 className="text-lg font-semibold mb-3">Edit Leader</h3>

        {localError && <div className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded">{localError}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="nama" value={form.nama} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Nama" required />
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Email" required />
          <input name="kontak" value={form.kontak} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Kontak" />
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Kosongkan jika tidak ingin ubah password (min 6)" />

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Batal</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-blue-600 text-white">{submitting ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddModal({ onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    kontak: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!form.nama?.trim()) return setLocalError("Nama wajib diisi.");
    if (!form.email?.trim()) return setLocalError("Email wajib diisi.");
    if (!validateEmail(form.email)) return setLocalError("Format email tidak valid.");
    if (!form.password || form.password.length < 6) return setLocalError("Password wajib (min 6).");

    try {
      await onSubmit(form);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Gagal menambah leader";
      setLocalError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
        <h3 className="text-lg font-semibold mb-3">Tambah Leader</h3>

        {localError && <div className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded">{localError}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="nama" value={form.nama} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Nama" required />
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Email" required />
          <input name="kontak" value={form.kontak} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Kontak" />
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Password (min 6)" required />

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Batal</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-green-600 text-white">{submitting ? "Menambah..." : "Tambah"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
