import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import {
    Plus, Edit, Trash2, RefreshCw,
    BarChart3, Users
} from "lucide-react";

/* ===================== MODAL ===================== */
function KinerjaModal({ open, onClose, onSave, members, initialData }) {
    const [form, setForm] = useState({
        id_member: "",
        jumlah_proyek: "",
        jumlah_followup: "",
        rate: "",
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                id_member: initialData.id_member || "",
                jumlah_proyek: initialData.jumlah_proyek || "",
                jumlah_followup: initialData.jumlah_followup || "",
                rate: initialData.rate ?? "",
            });
        } else {
            setForm({
                id_member: "",
                jumlah_proyek: "",
                jumlah_followup: "",
                rate: "",
            });
        }
    }, [initialData, open]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            jumlah_proyek: Number(form.jumlah_proyek),
            jumlah_followup: Number(form.jumlah_followup),
            rate: form.rate === "" ? null : Number(form.rate),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold mb-4">
                    {initialData ? "Edit Kinerja Member" : "Tambah Kinerja Member"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* MEMBER */}
                    <div>
                        <label className="text-sm text-gray-600">Member</label>
                        <select
                            className="w-full border rounded-xl p-2"
                            value={form.id_member}
                            onChange={(e) =>
                                setForm({ ...form, id_member: e.target.value })
                            }
                            required
                        >
                            <option value="">-- Pilih Member --</option>
                            {members.map((m) => (
                                <option key={m.id_member} value={m.id_member}>
                                    {m.nama} — {m.jabatan}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* JUMLAH PROYEK */}
                    <div>
                        <label className="text-sm text-gray-600">Jumlah Proyek</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border rounded-xl p-2"
                            value={form.jumlah_proyek}
                            onChange={(e) =>
                                setForm({ ...form, jumlah_proyek: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* JUMLAH FOLLOW UP */}
                    <div>
                        <label className="text-sm text-gray-600">Jumlah Follow Up</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border rounded-xl p-2"
                            value={form.jumlah_followup}
                            onChange={(e) =>
                                setForm({ ...form, jumlah_followup: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* RATE */}
                    <div>
                        <label className="text-sm text-gray-600">Rate (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            className="w-full border rounded-xl p-2"
                            value={form.rate}
                            onChange={(e) =>
                                setForm({ ...form, rate: e.target.value })
                            }
                            placeholder="Contoh: 85.5"
                        />
                    </div>

                    {/* ACTION */}
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ===================== PAGE ===================== */
export default function KinerjaAdmin() {
    const [kinerja, setKinerja] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    /* ---------- FETCH MEMBERS ---------- */
    const fetchMembers = async () => {
        try {
            const res = await api.get("/members");
            setMembers(res.data.data || res.data.members || []);
        } catch (err) {
            console.error("Gagal load members:", err);
        }
    };

    /* ---------- FETCH KINERJA ---------- */
    const fetchKinerja = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/kinerja-member");
            const list = Array.isArray(res.data.data) ? res.data.data : [];
            setKinerja(list);
        } catch (err) {
            console.error("Fetch kinerja error:", err);
            setError("Gagal memuat data kinerja.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchKinerja();
    }, []);

    /* ---------- SAVE ---------- */
    const handleSave = async (form) => {
        try {
            if (editing) {
                await api.put(`/kinerja-member/${editing.id_kinerja}`, form);
            } else {
                await api.post("/kinerja-member", form);
            }
            setModalOpen(false);
            setEditing(null);
            fetchKinerja();
        } catch {
            alert("Gagal menyimpan data kinerja.");
        }
    };

    /* ---------- DELETE ---------- */
    const handleDelete = async (id) => {
        if (!window.confirm("Hapus data kinerja ini?")) return;
        try {
            await api.delete(`/kinerja-member/${id}`);
            fetchKinerja();
        } catch {
            alert("Gagal menghapus.");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto bg-gray-50/30 min-h-screen">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                        <BarChart3 size={22} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Kinerja Member
                    </h1>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchKinerja}
                        className="p-2 rounded-lg border bg-white hover:bg-gray-50"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        onClick={() => {
                            setEditing(null);
                            setModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={18} /> Tambah Kinerja
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* PERFORMANCE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        Loading...
                    </div>
                ) : kinerja.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-400">
                        Belum ada data kinerja.
                    </div>
                ) : (
                    kinerja.map((k) => (
                        <div
                            key={k.id_kinerja}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
                        >
                            {/* HEADER */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800">
                                        {k.Member?.nama || "Member"}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {k.Member?.jabatan || "-"}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditing(k);
                                            setModalOpen(true);
                                        }}
                                        className="p-2 rounded-full text-blue-600 hover:bg-blue-50"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(k.id_kinerja)}
                                        className="p-2 rounded-full text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* STATS */}
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-500">Proyek</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {k.jumlah_proyek}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-500">Follow Up</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {k.jumlah_followup}
                                    </p>
                                </div>
                            </div>

                            {/* RATE */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Performance Rate</p>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(k.rate || 0, 100)}%`,
                                        }}
                                    ></div>
                                </div>
                                <p className="text-right text-xs text-gray-600 mt-1">
                                    {k.rate ?? 0}%
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL */}
            <KinerjaModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                members={members}
                initialData={editing}
            />
        </div>
    );
}
