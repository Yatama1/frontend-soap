import { useEffect, useState } from "react";
import { Users, Phone, Calendar, RefreshCw, Home } from "lucide-react";
import api from "../../api/apiClient";

export default function CabuyFollowUp() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rumahMap, setRumahMap] = useState({}); // 🔹 id_rumah -> nama rumah

    const statusColor = (status) => {
        switch (status) {
            case "Follow Up":
                return "bg-indigo-100 text-indigo-700";
            case "Siap Survey":
                return "bg-green-100 text-green-700";
            case "Booking":
                return "bg-yellow-100 text-yellow-700";
            case "Closing":
                return "bg-orange-100 text-orange-700";
            case "Lost":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    /* ================= FETCH RUMAH ================= */
    const fetchRumah = async () => {
        try {
            const res = await api.get("/rumah");
            const list = res?.data?.data || res?.data || [];

            const map = {};
            list.forEach(r => {
                map[r.id_rumah] = `Tipe ${r.tipe}`;
            });

            setRumahMap(map);
        } catch (err) {
            console.error("Gagal ambil rumah:", err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/cabuy/senior");
            const list = res?.data?.data || [];
            setData(list);
        } catch (err) {
            console.error("Gagal ambil follow up:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchRumah();
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="text-orange-500" />
                        Cabuy – Follow Up
                    </h1>
                    <p className="text-sm text-gray-500">
                        Daftar calon buyer yang perlu ditindaklanjuti.
                    </p>
                </div>

                <button
                    onClick={fetchData}
                    className="p-2 bg-white border rounded hover:bg-gray-100 shadow-sm"
                >
                    <RefreshCw
                        size={20}
                        className={loading ? "animate-spin text-orange-500" : "text-gray-600"}
                    />
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                                Nama Buyer
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                                Kontak
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                                Pilihan Rumah
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                                Tanggal Follow Up
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-400">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-400">
                                    Tidak ada cabuy follow up.
                                </td>
                            </tr>
                        ) : (
                            data.map((c) => (
                                <tr key={c.id_cabuy} className="hover:bg-orange-50/40">
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {c.nama_cabuy}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-gray-400" />
                                            {c.kontak}
                                        </div>
                                    </td>
                                    {/* ===== RUMAH ===== */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <Home size={14} className="text-gray-400" />
                                            {c.id_rumah
                                                ? rumahMap[c.id_rumah] || "Rumah tidak ditemukan"
                                                : "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {c.tanggal_follow_up ? (
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(c.tanggal_follow_up).toLocaleDateString("id-ID")}
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(c.status)}`}
                                        >
                                            {c.status || "Baru"}
                                        </span>
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
