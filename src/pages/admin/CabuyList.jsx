import { useEffect, useState } from "react";
import { Users, RefreshCw } from "lucide-react";
import api from "../../api/apiClient";

export default function CabuyAdmin() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCabuy = async () => {
        setLoading(true);
        try {
            const res = await api.get("/cabuy");   // 🔥 ambil semua cabuy
            setData(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert("Gagal memuat data cabuy");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCabuy();
    }, []);

    if (loading) return <p className="p-6">Loading...</p>;

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="text-blue-600" /> Data Calon Buyer
                </h1>
                <button
                    onClick={fetchCabuy}
                    className="p-2 rounded-lg border hover:bg-gray-50"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-4 py-3 text-left">Nama</th>
                            <th className="px-4 py-3 text-left">Kontak</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Rumah</th>
                            <th className="px-4 py-3 text-left">Agent</th>
                            <th className="px-4 py-3 text-left">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-400">
                                    Belum ada data cabuy
                                </td>
                            </tr>
                        ) : (
                            data.map((c) => (
                                <tr key={c.id_cabuy} className="border-t">
                                    <td className="px-4 py-3">{c.nama_cabuy}</td>
                                    <td className="px-4 py-3">{c.kontak}</td>

                                    {/* STATUS BADGE */}
                                    <td className="px-4 py-3">
                                        <StatusBadge status={c.status} />
                                    </td>

                                    <td className="px-4 py-3">
                                        {c.rumah ? `Tipe ${c.rumah.tipe}` : "-"}
                                    </td>

                                    <td className="px-4 py-3">
                                        {c.member ? c.member.nama : "-"}
                                    </td>

                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {c.tanggal_masuk
                                            ? new Date(c.tanggal_masuk).toLocaleDateString("id-ID")
                                            : "-"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ================= BADGE STATUS ================= */
function StatusBadge({ status }) {
    const map = {
        "Baru": "bg-blue-50 text-blue-600",
        "Follow Up": "bg-orange-50 text-orange-600",
        "Siap Survey": "bg-purple-50 text-purple-600",
        "Booking": "bg-indigo-50 text-indigo-600",
        "Closing": "bg-green-50 text-green-600",
        "Lost": "bg-red-50 text-red-600",
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status] || "bg-gray-50 text-gray-500"}`}
        >
            {status}
        </span>
    );
}
