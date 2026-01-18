import { useEffect, useState } from "react";
import {
    Home,
    Search,
    RefreshCw,
    CheckCircle2,
    XCircle,
    MapPin,
} from "lucide-react";
import api from "../../api/apiClient";

export default function RumahListLeader() {
    const [rumah, setRumah] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    /* ================= FETCH DATA ================= */
    const fetchRumah = async () => {
        setLoading(true);
        try {
            const res = await api.get("/rumah");
            // asumsi response: { data: [...] }
            const list = res?.data?.data || res?.data || [];
            setRumah(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Gagal ambil data rumah:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRumah();
    }, []);

    /* ================= FILTER ================= */
    const filtered = rumah.filter((r) => {
        const q = search.toLowerCase();
        return (
            (r.tipe || "").toLowerCase().includes(q) ||
            (r.lokasi || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">

            {/* ================= HEADER ================= */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Home className="text-blue-600" />
                        Data Rumah
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Daftar unit rumah yang telah diinput oleh Admin.
                    </p>
                </div>

                <button
                    onClick={fetchRumah}
                    className="p-2 bg-white border rounded-lg hover:bg-gray-100 shadow-sm w-fit"
                    title="Refresh"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* ================= SEARCH ================= */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search
                        size={18}
                        className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Cari tipe rumah atau lokasi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* ================= LIST ================= */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Memuat data rumah...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">
                        Belum ada data rumah.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                                        Rumah
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                                        Properti
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                                        Harga
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((r) => {
                                    const sold =
                                        Number(r.terjual) === 1 || r.terjual === true;

                                    return (
                                        <tr
                                            key={r.id_rumah}
                                            className="hover:bg-blue-50/30 transition"
                                        >
                                            {/* RUMAH */}
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    Tipe {r.tipe}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    ID: {r.id_rumah}
                                                </div>
                                            </td>

                                            {/* PROPERTI */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <MapPin size={14} className="text-gray-400" />
                                                    {r.id_properti || r.nama_properti || "-"}
                                                </div>
                                            </td>

                                            {/* HARGA */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-semibold text-gray-800">
                                                    {r.harga
                                                        ? `Rp ${Number(r.harga).toLocaleString("id-ID")}`
                                                        : "-"}
                                                </span>
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-6 py-4 text-center">
                                                {sold ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                        <XCircle size={12} /> Terjual
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        <CheckCircle2 size={12} /> Tersedia
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
