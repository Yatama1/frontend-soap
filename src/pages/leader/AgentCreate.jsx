import { useEffect, useMemo, useState } from "react";
import {
    UserPlus,
    Home,
    Users,
    Save,
    Trash2
} from "lucide-react";
import api from "../../api/apiClient";

export default function AgentPage() {
    const [agents, setAgents] = useState([]);
    const [rumahs, setRumahs] = useState([]);
    const [members, setMembers] = useState([]);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        id_rumah: "",
        id_member: "",
    });

    /* ================= FETCH DATA ================= */
    const fetchAll = async () => {
        try {
            const [agentRes, rumahRes, memberRes] = await Promise.all([
                api.get("/agent"),
                api.get("/rumah"),
                api.get("/members"),
            ]);

            const agentData = agentRes?.data?.data || agentRes?.data || [];
            const rumahData = rumahRes?.data?.data || rumahRes?.data || [];
            const memberData = memberRes?.data?.members || memberRes?.data || [];

            setAgents(agentData);
            setRumahs(rumahData);
            setMembers(memberData.filter((m) => m.jabatan === "member"));
        } catch (err) {
            console.error("Fetch agent error:", err);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    /* ================= FILTER RUMAH ================= */
    const usedRumahIds = useMemo(() => {
        return agents.map((a) => Number(a.id_rumah));
    }, [agents]);

    const availableRumahs = useMemo(() => {
        return rumahs.filter(
            (r) => !usedRumahIds.includes(Number(r.id_rumah))
        );
    }, [rumahs, usedRumahIds]);

    /* ================= SUBMIT ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.id_rumah || !form.id_member) {
            alert("Pilih rumah dan member terlebih dahulu");
            return;
        }

        try {
            setLoading(true);
            await api.post("/agent", form);

            alert("Agent berhasil ditambahkan");

            setForm({ id_rumah: "", id_member: "" });
            fetchAll();
        } catch (err) {
            console.error("Create agent error:", err);
            alert("Gagal menambahkan agent");
        } finally {
            setLoading(false);
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!window.confirm("Hapus agent ini?")) return;

        try {
            await api.delete(`/agent/${id}`);
            fetchAll();
        } catch {
            alert("Gagal menghapus agent");
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">

            {/* ================= HEADER ================= */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="text-blue-600" /> Manajemen Agent
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Satu rumah hanya bisa dimiliki satu agent, agent bisa memiliki banyak rumah.
                    </p>
                </div>
            </div>

            {/* ================= FORM ADD ================= */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-10 max-w-2xl">

                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UserPlus size={18} className="text-blue-600" />
                    Tambah Agent
                </h2>

                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">

                    {/* RUMAH */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Home size={16} className="inline mr-1" />
                            Pilih Rumah
                        </label>
                        <select
                            value={form.id_rumah}
                            onChange={(e) =>
                                setForm({ ...form, id_rumah: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">-- Pilih Rumah --</option>
                            {availableRumahs.length === 0 && (
                                <option disabled>Semua rumah sudah memiliki agent</option>
                            )}
                            {availableRumahs.map((r) => (
                                <option key={r.id_rumah} value={r.id_rumah}>
                                    {r.tipe} — Rp{" "}
                                    {r.harga
                                        ? Number(r.harga).toLocaleString("id-ID")
                                        : "N/A"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* MEMBER */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Users size={16} className="inline mr-1" />
                            Pilih Member (Agent)
                        </label>
                        <select
                            value={form.id_member}
                            onChange={(e) =>
                                setForm({ ...form, id_member: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">-- Pilih Member --</option>
                            {members.map((m) => (
                                <option key={m.id_member} value={m.id_member}>
                                    {m.nama} — {m.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2 flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 transition"
                        >
                            <Save size={18} />
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>

            {/* ================= LIST AGENT ================= */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Daftar Agent
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                    Rumah
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                    Member (Agent)
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {agents.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="px-6 py-10 text-center text-gray-400"
                                    >
                                        Belum ada data agent.
                                    </td>
                                </tr>
                            ) : (
                                agents.map((a) => (
                                    <tr
                                        key={a.id_agent}
                                        className="hover:bg-blue-50/30 transition"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                Rumah Tipe {a.rumah?.tipe || "-"}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                ID Rumah: {a.id_rumah}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {a.member?.nama || "-"}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {a.member?.email || ""}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(a.id_agent)}
                                                className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
