import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import { CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";

export default function CrmValidation() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get("/crm");
            setList(res.data.data || []);
        } catch (err) {
            console.error("Fetch CRM error:", err);
            setError("Gagal memuat data CRM");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleValidate = async (id, status) => {
        let note = null;
        if (status === "Ditolak") {
            note = prompt("Masukkan alasan penolakan:");
            if (!note) return;
        }

        try {
            await api.put(`/crm/${id}`, {
                status,
                catatan: note,
            });
            fetchData();
        } catch (err) {
            alert("Gagal memvalidasi data");
        }
    };

    if (loading)
        return (
            <div className="p-10 text-center text-slate-500">
                Memuat data CRM...
            </div>
        );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-slate-800">
                    Validasi Hasil Survey
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Review & validasi laporan survey dari para leader
                </p>
            </div>

            {/* ERROR */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200">
                    {error}
                </div>
            )}

            {/* EMPTY */}
            {list.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center shadow-sm">
                    <p className="text-slate-500 font-medium">
                        Tidak ada data menunggu validasi
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {list.map((c) => (
                        <div
                            key={c.id_crm}
                            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition"
                        >
                            {/* HEADER CARD */}
                            <div className="p-5 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
                                <h3 className="font-bold text-lg text-slate-800">
                                    {c.Cabuy?.nama_cabuy}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Dilaporkan oleh{" "}
                                    <b>{c.Member?.nama}</b>
                                </p>
                            </div>

                            {/* BODY */}
                            <div className="p-5 space-y-4 text-sm text-slate-600">
                                {/* HASIL */}
                                <div>
                                    <span className="text-xs text-slate-400">
                                        Hasil Survey
                                    </span>
                                    <p className="font-semibold text-slate-800">
                                        {c.hasil_survey}
                                    </p>
                                </div>

                                {/* CATATAN */}
                                <div>
                                    <span className="text-xs text-slate-400">
                                        Catatan
                                    </span>
                                    <p className="text-slate-600">
                                        {c.catatan || "-"}
                                    </p>
                                </div>

                                {/* GAMBAR */}
                                <div>
                                    <span className="text-xs text-slate-400">
                                        Bukti Foto Survey
                                    </span>

                                    {c.gambar ? (
                                        <div className="mt-2 w-full h-40 rounded-xl overflow-hidden border bg-slate-50">
                                            <img
                                                src={`data:image/jpeg;base64,${c.gambar}`}
                                                alt="Bukti survey"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="mt-2 flex items-center gap-2 text-slate-400 text-xs">
                                            <ImageIcon size={16} />
                                            Tidak ada gambar
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* FOOTER ACTION */}
                            <div className="p-5 pt-0 flex gap-3">
                                <button
                                    onClick={() =>
                                        handleValidate(c.id_crm, "Disetujui")
                                    }
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
                                >
                                    <CheckCircle2 size={16} />
                                    Setujui
                                </button>

                                <button
                                    onClick={() =>
                                        handleValidate(c.id_crm, "Ditolak")
                                    }
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
                                >
                                    <XCircle size={16} />
                                    Tolak
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
