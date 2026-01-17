import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import { Plus, Edit, Trash2, RefreshCw, Clock } from "lucide-react";

/* ===================== MODAL ===================== */
function CrmModal({ open, onClose, onSave, masters, initialData }) {
    const [form, setForm] = useState({
        id_cabuy: "",
        id_member: "",
        catatan: "",
        interaksi_terakhir: "",
        strategi_followup: "",
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                id_cabuy: initialData.id_cabuy || "",
                id_member: initialData.id_member || "",
                catatan: initialData.catatan || "",
                interaksi_terakhir: initialData.interaksi_terakhir
                    ? initialData.interaksi_terakhir.slice(0, 16)
                    : "",
                strategi_followup: initialData.strategi_followup || "",
            });
        } else {
            setForm({
                id_cabuy: "",
                id_member: "",
                catatan: "",
                interaksi_terakhir: "",
                strategi_followup: "",
            });
        }
    }, [initialData, open]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    const { buyers, agents } = masters;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold mb-4">
                    {initialData ? "Edit CRM Log" : "Tambah CRM Log"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* BUYER */}
                    <div>
                        <label className="text-sm text-gray-600">Buyer</label>
                        <select
                            className="w-full border rounded-xl p-2"
                            value={form.id_cabuy}
                            onChange={(e) => setForm({ ...form, id_cabuy: e.target.value })}
                            required
                        >
                            <option value="">-- Pilih Buyer --</option>
                            {buyers.map((b) => (
                                <option key={b.id_cabuy} value={b.id_cabuy}>
                                    {b.nama_cabuy}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* AGENT */}
                    <div>
                        <label className="text-sm text-gray-600">Agent</label>
                        <select
                            className="w-full border rounded-xl p-2"
                            value={form.id_member}
                            onChange={(e) => setForm({ ...form, id_member: e.target.value })}
                            required
                        >
                            <option value="">-- Pilih Agent --</option>
                            {agents.map((a) => (
                                <option key={a.id_member} value={a.id_member}>
                                    {a.nama} — {a.jabatan}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* INTERAKSI */}
                    <div>
                        <label className="text-sm text-gray-600">Interaksi Terakhir</label>
                        <input
                            type="datetime-local"
                            className="w-full border rounded-xl p-2"
                            value={form.interaksi_terakhir}
                            onChange={(e) =>
                                setForm({ ...form, interaksi_terakhir: e.target.value })
                            }
                        />
                    </div>

                    {/* CATATAN */}
                    <div>
                        <label className="text-sm text-gray-600">Catatan</label>
                        <textarea
                            rows="3"
                            className="w-full border rounded-xl p-2"
                            value={form.catatan}
                            onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                            placeholder="Ringkasan komunikasi dengan buyer..."
                        />
                    </div>

                    {/* STRATEGI */}
                    <div>
                        <label className="text-sm text-gray-600">Strategi Follow Up</label>
                        <input
                            type="text"
                            className="w-full border rounded-xl p-2"
                            value={form.strategi_followup}
                            onChange={(e) =>
                                setForm({ ...form, strategi_followup: e.target.value })
                            }
                            placeholder="Contoh: Follow up via WhatsApp 3 hari lagi"
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
export default function CrmAdmin() {
    const [crm, setCrm] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [buyers, setBuyers] = useState([]);
    const [agents, setAgents] = useState([]);

    /* ---------- FETCH MASTER DATA ---------- */
    const fetchMasters = async () => {
        try {
            const [b, a] = await Promise.all([
                api.get("/cabuy"),
                api.get("/members"),
            ]);

            setBuyers(b.data.data || b.data.cabuy || []);
            setAgents(
                (a.data.data || a.data.members || []).filter(
                    (m) => m.jabatan === "member" || m.jabatan === "leader"
                )
            );
        } catch (err) {
            console.error("Gagal load master:", err);
        }
    };

    /* ---------- FETCH CRM ---------- */
    const fetchCrm = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/crm");
            const list = Array.isArray(res.data.data) ? res.data.data : [];
            setCrm(list);
        } catch (err) {
            console.error("Fetch CRM error:", err);
            setError("Gagal memuat data CRM.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCrm();
        fetchMasters();
    }, []);

    /* ---------- SAVE ---------- */
    const handleSave = async (form) => {
        try {
            if (editing) {
                await api.put(`/crm/${editing.id_crm}`, form);
            } else {
                await api.post("/crm", form);
            }
            setModalOpen(false);
            setEditing(null);
            fetchCrm();
        } catch {
            alert("Gagal menyimpan data.");
        }
    };

    /* ---------- DELETE ---------- */
    const handleDelete = async (id) => {
        if (!window.confirm("Hapus data CRM ini?")) return;
        try {
            await api.delete(`/crm/${id}`);
            fetchCrm();
        } catch {
            alert("Gagal menghapus.");
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto bg-gray-50/30 min-h-screen">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    CRM Activity Log
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={fetchCrm}
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
                        <Plus size={18} /> Tambah Log
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* NOTE LOG LIST */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-20 text-gray-500">
                        Loading...
                    </div>
                ) : crm.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        Belum ada catatan CRM.
                    </div>
                ) : (
                    crm.map((c) => (
                        <div
                            key={c.id_crm}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
                        >
                            {/* HEADER */}
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-800">
                                        {c.Cabuy?.nama_cabuy || "Buyer"}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Agent: {c.Member?.nama || "-"}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditing(c);
                                            setModalOpen(true);
                                        }}
                                        className="p-2 rounded-full text-blue-600 hover:bg-blue-50"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id_crm)}
                                        className="p-2 rounded-full text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* META */}
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                <Clock size={14} />
                                {c.interaksi_terakhir
                                    ? new Date(c.interaksi_terakhir).toLocaleString("id-ID")
                                    : "Belum ada interaksi"}
                            </div>

                            {/* NOTE */}
                            <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                {c.catatan || "— Tidak ada catatan —"}
                            </p>

                            {/* STRATEGY */}
                            {c.strategi_followup && (
                                <div className="mt-2 inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                                    Strategi: {c.strategi_followup}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* MODAL */}
            <CrmModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                masters={{ buyers, agents }}
                initialData={editing}
            />
        </div>
    );
}
