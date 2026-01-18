import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import {
    RefreshCw,
    CalendarDays,
    User,
    Home,
    CheckCircle2,
    Clock,
    X,
} from "lucide-react";

/* ================= MODAL FORM CRM ================= */
function CrmFormModal({ open, onClose, survey, onSuccess }) {
    const [form, setForm] = useState({
        hasil_survey: "tertarik",
        catatan: "",
        rencana_follow_up: "",
        gambar: null,
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setForm({
                hasil_survey: "tertarik",
                catatan: "",
                rencana_follow_up: "",
                gambar: null,
            });
        }
    }, [open]);

    if (!open || !survey) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const fd = new FormData();
            fd.append("hasil_survey", form.hasil_survey);
            fd.append("catatan", form.catatan);
            fd.append("rencana_follow_up", form.rencana_follow_up);
            if (form.gambar) fd.append("gambar", form.gambar);

            await api.post(`/crm/from-survey/${survey.id_survey}`, fd);

            onSuccess();   // refresh list survey
            onClose();     // tutup modal
        } catch (err) {
            console.error("CRM submit error:", err);
            alert("Gagal mengirim hasil survey ke CRM");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X />
                </button>

                <h3 className="text-xl font-bold mb-2">Hasil Survey</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Isi laporan hasil survey untuk buyer{" "}
                    <b>{survey.Cabuy?.nama_cabuy}</b>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* HASIL */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Hasil Survey
                        </label>
                        <select
                            className="w-full border rounded-xl p-2 mt-1"
                            value={form.hasil_survey}
                            onChange={(e) =>
                                setForm({ ...form, hasil_survey: e.target.value })
                            }
                            required
                        >
                            <option value="tertarik">Tertarik</option>
                            <option value="ragu">Ragu</option>
                            <option value="tidak tertarik">Tidak Tertarik</option>
                        </select>
                    </div>

                    {/* CATATAN */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Catatan
                        </label>
                        <textarea
                            rows="3"
                            className="w-full border rounded-xl p-2 mt-1"
                            value={form.catatan}
                            onChange={(e) =>
                                setForm({ ...form, catatan: e.target.value })
                            }
                            placeholder="Catatan hasil survey..."
                        />
                    </div>

                    {/* FOLLOW UP */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Rencana Follow Up
                        </label>
                        <textarea
                            rows="2"
                            className="w-full border rounded-xl p-2 mt-1"
                            value={form.rencana_follow_up}
                            onChange={(e) =>
                                setForm({ ...form, rencana_follow_up: e.target.value })
                            }
                            placeholder="Rencana tindak lanjut..."
                        />
                    </div>

                    {/* GAMBAR */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Bukti Foto Survey
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full border rounded-xl p-2 mt-1"
                            onChange={(e) =>
                                setForm({ ...form, gambar: e.target.files[0] })
                            }
                        />
                    </div>

                    {/* ACTION */}
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? "Menyimpan..." : "Kirim ke CRM"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ================= PAGE ================= */
export default function SurveyLeader() {
    const [survey, setSurvey] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    /* ================= GET LEADER ID ================= */
    const leaderId = (() => {
        try {
            const u = JSON.parse(localStorage.getItem("user"));
            return u?.id_member || u?.id || null;
        } catch {
            return null;
        }
    })();

    /* ================= FETCH SURVEY ================= */
    const fetchSurvey = async () => {
        if (!leaderId) return;

        setLoading(true);
        setError("");

        try {
            const res = await api.get(`/survey/leader/${leaderId}`);
            const list = Array.isArray(res.data.data) ? res.data.data : [];
            setSurvey(list);
        } catch (err) {
            console.error("Fetch survey error:", err);
            setError("Gagal memuat jadwal survey.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurvey();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                        Jadwal Survey Saya
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Daftar survey yang telah dijadwalkan untuk Anda
                    </p>
                </div>

                <button
                    onClick={fetchSurvey}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border shadow-sm hover:shadow-md transition"
                >
                    <RefreshCw size={18} />
                    <span className="text-sm font-medium">Refresh</span>
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200">
                    {error}
                </div>
            )}

            {/* CONTENT */}
            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-48 bg-white rounded-2xl animate-pulse shadow-sm"
                        />
                    ))}
                </div>
            ) : survey.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center shadow-sm">
                    <CalendarDays size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">
                        Belum ada jadwal survey untuk Anda.
                    </p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {survey.map((s) => {
                        const done = s.status_survey === "Sudah";
                        const validating = s.status_survey === "Proses Validasi";

                        return (
                            <div
                                key={s.id_survey}
                                className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 transition-all hover:-translate-y-1 overflow-hidden"
                            >
                                {/* HEADER */}
                                <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                                            <CalendarDays size={16} />
                                            Survey
                                        </div>

                                        {done ? (
                                            <span className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                                <CheckCircle2 size={12} /> Selesai
                                            </span>
                                        ) : validating ? (
                                            <span className="flex items-center gap-1 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                                Proses Validasi
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                                                <Clock size={12} /> Menunggu
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="mt-3 text-lg font-bold text-slate-800">
                                        {s.Cabuy?.nama_cabuy || "Buyer"}
                                    </h3>
                                </div>

                                {/* BODY */}
                                <div className="p-5 space-y-3 text-sm text-slate-600">
                                    {/* RUMAH */}
                                    <div className="flex gap-3">
                                        <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                            {s.Rumah?.image ? (
                                                <img
                                                    src={s.Rumah.image}
                                                    alt={`Rumah tipe ${s.Rumah.tipe}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Home size={28} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col justify-center text-sm">
                                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                                                <Home size={14} className="text-indigo-500" />
                                                Tipe {s.Rumah?.tipe || "-"}
                                            </span>

                                            <span className="text-slate-500 text-xs mt-0.5">
                                                {s.Rumah?.properti?.lokasi ||
                                                    "Alamat belum tersedia"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* TANGGAL */}
                                    <div className="flex items-center gap-2">
                                        <CalendarDays size={16} className="text-orange-500" />
                                        <span>
                                            {s.tanggal_survey
                                                ? new Date(s.tanggal_survey).toLocaleString("id-ID")
                                                : "-"}
                                        </span>
                                    </div>

                                    {/* AGENT */}
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-slate-500" />
                                        <span>
                                            Ditugaskan ke:{" "}
                                            <b className="text-slate-800">
                                                {s.Member?.nama || "Anda"}
                                            </b>
                                        </span>
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="px-5 pb-5 pt-2 space-y-2">
                                    <div
                                        className={`w-full text-center py-2 rounded-xl text-xs font-bold tracking-wide ${done
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : validating
                                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                            }`}
                                    >
                                        Status: {s.status_survey}
                                    </div>

                                    {!done && !validating && (
                                        <button
                                            onClick={() => {
                                                setSelectedSurvey(s);
                                                setModalOpen(true);
                                            }}
                                            className="w-full py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
                                        >
                                            Tandai Selesai & Isi Laporan
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL CRM */}
            <CrmFormModal
                open={modalOpen}
                survey={selectedSurvey}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchSurvey}
            />
        </div>
    );
}
