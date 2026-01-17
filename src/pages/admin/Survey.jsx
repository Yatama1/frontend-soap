import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";

/* ===================== MODAL ===================== */
function SurveyModal({ open, onClose, onSave, masters, initialData }) {
    const [form, setForm] = useState({
        id_cabuy: "",
        id_member: "",
        id_rumah: "",
        tanggal_survey: "",
        status_survey: "Belum",
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                id_cabuy: initialData.id_cabuy || "",
                id_member: initialData.id_member || "",
                id_rumah: initialData.id_rumah || "",
                tanggal_survey: initialData.tanggal_survey
                    ? initialData.tanggal_survey.slice(0, 16)
                    : "",
                status_survey: initialData.status_survey || "Belum",
            });
        } else {
            setForm({
                id_cabuy: "",
                id_member: "",
                id_rumah: "",
                tanggal_survey: "",
                status_survey: "Belum",
            });
        }
    }, [initialData, open]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    const { buyers, agents, houses } = masters;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
                <h3 className="text-lg font-bold mb-4">
                    {initialData ? "Edit Survey" : "Tambah Survey"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-3">

                    {/* BUYER */}
                    <div>
                        <label className="text-sm text-gray-600">Buyer</label>
                        <select
                            className="w-full border rounded-lg p-2"
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
                            className="w-full border rounded-lg p-2"
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

                    {/* RUMAH */}
                    <div>
                        <label className="text-sm text-gray-600">Rumah</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={form.id_rumah}
                            onChange={(e) => setForm({ ...form, id_rumah: e.target.value })}
                            required
                        >
                            <option value="">-- Pilih Rumah --</option>
                            {houses.map((h) => (
                                <option key={h.id_rumah} value={h.id_rumah}>
                                    {h.tipe} | LT {h.lt} / LB {h.lb}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* TANGGAL */}
                    <div>
                        <label className="text-sm text-gray-600">Tanggal Survey</label>
                        <input
                            type="datetime-local"
                            className="w-full border rounded-lg p-2"
                            value={form.tanggal_survey}
                            onChange={(e) =>
                                setForm({ ...form, tanggal_survey: e.target.value })
                            }
                        />
                    </div>

                    {/* STATUS */}
                    <div>
                        <label className="text-sm text-gray-600">Status</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={form.status_survey}
                            onChange={(e) =>
                                setForm({ ...form, status_survey: e.target.value })
                            }
                        >
                            <option value="Belum">Belum</option>
                            <option value="Sudah">Sudah</option>
                        </select>
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
export default function SurveyAdmin() {
    const [survey, setSurvey] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [buyers, setBuyers] = useState([]);
    const [agents, setAgents] = useState([]);
    const [houses, setHouses] = useState([]);

    /* ---------- FETCH MASTER DATA ---------- */
    const fetchMasters = async () => {
        try {
            const [b, a, h] = await Promise.all([
                api.get("/cabuy"),
                api.get("/members/leaders"),
                api.get("/rumah"),
            ]);

            setBuyers(b.data.data || b.data.cabuy || []);
            setAgents(a.data.data || a.data.members || []);
            setHouses(h.data.data || h.data.rumah || []);
        } catch (err) {
            console.error("Gagal load master:", err);
        }
    };

    /* ---------- FETCH SURVEY ---------- */
    const fetchSurvey = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/survey");
            const list = Array.isArray(res.data.data) ? res.data.data : [];
            setSurvey(list);
        } catch (err) {
            console.error("Fetch survey error:", err);
            setError("Gagal memuat data survey.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurvey();
        fetchMasters();
    }, []);

    /* ---------- SAVE (CREATE / UPDATE) ---------- */
    const handleSave = async (form) => {
        try {
            if (editing) {
                await api.put(`/survey/${editing.id_survey}`, form);
            } else {
                await api.post("/survey", form);
            }
            setModalOpen(false);
            setEditing(null);
            fetchSurvey();
        } catch (err) {
            alert("Gagal menyimpan data.");
        }
    };

    /* ---------- DELETE ---------- */
    const handleDelete = async (id) => {
        if (!window.confirm("Hapus data survey ini?")) return;
        try {
            await api.delete(`/survey/${id}`);
            fetchSurvey();
        } catch {
            alert("Gagal menghapus.");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50/30 min-h-screen">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Manajemen Jadwal Survey
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={fetchSurvey}
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
                        <Plus size={18} /> Tambah Survey
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            {/* HEAD */}
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                                <tr className="text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-5 py-4 text-center w-12">#</th>
                                    <th className="px-5 py-4 text-left">Buyer</th>
                                    <th className="px-5 py-4 text-left">Agent</th>
                                    <th className="px-5 py-4 text-left">Rumah</th>
                                    <th className="px-5 py-4 text-center">Tanggal</th>
                                    <th className="px-5 py-4 text-center">Status</th>
                                    <th className="px-5 py-4 text-center w-28">Aksi</th>
                                </tr>
                            </thead>

                            {/* BODY */}
                            <tbody className="divide-y divide-gray-100">
                                {survey.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center text-gray-400">
                                            Belum ada data survey.
                                        </td>
                                    </tr>
                                ) : (
                                    survey.map((s, i) => (
                                        <tr
                                            key={s.id_survey}
                                            className="group hover:bg-blue-50/40 transition-colors"
                                        >
                                            {/* NO */}
                                            <td className="px-5 py-4 text-center font-medium text-gray-500">
                                                {i + 1}
                                            </td>

                                            {/* BUYER */}
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-gray-800">
                                                    {s.Cabuy?.nama_cabuy || "-"}
                                                </div>
                                            </td>

                                            {/* AGENT */}
                                            <td className="px-5 py-4 text-gray-700">
                                                {s.Member?.nama || "-"}
                                            </td>

                                            {/* RUMAH */}
                                            <td className="px-5 py-4 text-gray-700">
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="font-medium">Type</span>
                                                    {s.Rumah?.tipe || "-"}
                                                </span>
                                            </td>

                                            {/* TANGGAL */}
                                            <td className="px-5 py-4 text-center text-gray-600">
                                                {s.tanggal_survey
                                                    ? new Date(s.tanggal_survey).toLocaleString("id-ID")
                                                    : "-"}
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-5 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${s.status_survey === "Sudah"
                                                        ? "bg-green-50 text-green-700 border border-green-200"
                                                        : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                                        }`}
                                                >
                                                    {s.status_survey}
                                                </span>
                                            </td>

                                            {/* AKSI */}
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                                                    <button
                                                        onClick={() => {
                                                            setEditing(s);
                                                            setModalOpen(true);
                                                        }}
                                                        className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(s.id_survey)}
                                                        className="p-2 rounded-full text-red-600 hover:bg-red-100 transition"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


            {/* MODAL */}
            <SurveyModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                masters={{ buyers, agents, houses }}
                initialData={editing}
            />
        </div>
    );
}
