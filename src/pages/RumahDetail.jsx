import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    HandCoins,
    MapPin,
    BedDouble,
    Layers,
    Ruler,
    Phone,
    CheckCircle2,
    XCircle,
    User
} from "lucide-react";

/* ================= MODAL BUYER ================= */
function BuyerModal({ open, onClose, onSuccess, idRumah }) {
    const [form, setForm] = useState({
        nama_cabuy: "",
        kontak: "",
        status: "Baru",
        tanggal_follow_up: "",
    });

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, id_rumah: idRumah };

            const res = await fetch("http://localhost:5000/api/cabuy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Gagal menyimpan");

            onSuccess();
            onClose();
            setForm({ nama_cabuy: "", kontak: "" });
        } catch (err) {
            alert("Gagal menyimpan data buyer");
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold mb-4">Isi Data Calon Buyer</h3>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-sm text-gray-600">Nama Buyer</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2"
                            value={form.nama_cabuy}
                            onChange={(e) =>
                                setForm({ ...form, nama_cabuy: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Kontak</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2"
                            value={form.kontak}
                            onChange={(e) =>
                                setForm({ ...form, kontak: e.target.value })
                            }
                        />
                    </div>

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

/* ================= PAGE ================= */
export default function RumahDetail() {
    const { id } = useParams();

    const [rumah, setRumah] = useState(null);
    const [properti, setProperti] = useState(null);
    const [agent, setAgent] = useState(null); // 🔥 AGENT
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [buyerOpen, setBuyerOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [resRumah, resProperti, resAgent] = await Promise.all([
                    fetch("http://localhost:5000/api/rumah"),
                    fetch("http://localhost:5000/api/properti"),
                    fetch("http://localhost:5000/api/agent"), // 🔥 ambil agent
                ]);

                const rumahJson = await resRumah.json();
                const propertiJson = await resProperti.json();
                const agentJson = await resAgent.json();

                const rumahArr = rumahJson?.data || [];
                const propertiArr = propertiJson?.data || [];
                const agentArr = agentJson?.data || [];

                const foundRumah = rumahArr.find(
                    (r) => Number(r.id_rumah) === Number(id)
                );
                if (!foundRumah) throw new Error("Rumah tidak ditemukan");

                const foundProperti = propertiArr.find(
                    (p) =>
                        Number(p.id_properti) === Number(foundRumah.id_properti)
                );

                const foundAgent = agentArr.find(
                    (a) => Number(a.id_rumah) === Number(foundRumah.id_rumah)
                );

                setRumah(foundRumah);
                setProperti(foundProperti || null);
                setAgent(foundAgent || null); // 🔥 simpan agent
            } catch (err) {
                console.error(err);
                setError("Gagal memuat detail rumah.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );

    if (!rumah) return null;

    const sold = Number(rumah.terjual) === 1 || rumah.terjual === true;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-800">

            {/* ================= HEADER ================= */}
            <div
                className="h-72 w-full bg-center bg-cover relative"
                style={{
                    backgroundImage: rumah.image
                        ? `url(${rumah.image})`
                        : "linear-gradient(to bottom, #1e293b, #0f172a)",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />

                <div className="relative max-w-6xl mx-auto px-6 py-6">
                    <Link
                        to={properti ? `/properti/${properti.id_properti}` : "/"}
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white"
                    >
                        <ArrowLeft size={18} /> Kembali
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-10 pb-10">

                {/* ================= CARD ================= */}
                <div className="bg-white rounded-3xl shadow-xl border p-8">

                    <div className="flex flex-col md:flex-row justify-between mb-8 gap-6">
                        <div>
                            <div className="relative overflow-hidden xl:w-[750px] h-64 object-cover rounded-3xl">
                                <img
                                    src={rumah.image}
                                    alt=""
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                />
                            </div>
                            <div className="absolute top-10 left-16 flex items-center gap-2 mb-3">
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                    Rumah Tipe {rumah.tipe}
                                </span>

                                {sold ? (
                                    <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-3 py-1 rounded-full">
                                        <XCircle size={12} /> Terjual
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-3 py-1 rounded-full">
                                        <CheckCircle2 size={12} /> Tersedia
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border min-w-[240px]">
                            <p className="text-xs text-slate-400 font-semibold uppercase mb-2">
                                Harga
                            </p>
                            <p className="text-2xl flex gap-2 items-center font-bold text-blue-600 mb-2">
                                <HandCoins />
                                {rumah.harga
                                    ? `Rp ${Number(rumah.harga).toLocaleString("id-ID")}`
                                    : "Hubungi Kami"}
                            </p>

                            {properti && (
                                <div>
                                    <p className="text-xs text-slate-400 font-semibold uppercase mb-2">
                                        Alamat
                                    </p>
                                    <div className="flex gap-2 items-center">
                                        <MapPin size={16} className="text-orange-500" />
                                        {properti.lokasi}
                                    </div>
                                </div>
                            )}

                            {/* 🔥 AGENT INFO */}
                            {agent?.member && (
                                <div className="mt-4">
                                    <p className="text-xs text-slate-400 font-semibold uppercase mb-2">
                                        Agent Penanggung Jawab
                                    </p>
                                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                                        <User size={16} className="text-blue-600" />
                                        {agent.member.nama}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <h1 className="text-3xl font-extrabold mb-2">
                            Rumah Tipe {rumah.tipe}
                        </h1>

                        <p>
                            <span className="font-bold">Deskripsi:</span>
                            <br />
                            {rumah.deskripsi || "-"}
                        </p>
                    </div>

                    {/* ================= SPECS ================= */}
                    <p className="font-bold mb-2">Spesifikasi:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <Spec icon={Ruler} label="Luas Tanah" value={`${rumah.lt || "-"} m²`} />
                        <Spec icon={Ruler} label="Luas Bangunan" value={`${rumah.lb || "-"} m²`} rotate />
                        <Spec icon={BedDouble} label="Kamar Tidur" value={rumah.jml_kamar || "-"} />
                        <Spec icon={Layers} label="Jumlah Lantai" value={rumah.jml_lantai || "-"} />
                    </div>

                    {/* ================= ACTION ================= */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {properti?.kontak_kontraktor && (
                            <a
                                href={`https://wa.me/${properti.kontak_kontraktor.replace(
                                    /[^0-9]/g,
                                    ""
                                )}?text=Halo, saya tertarik dengan rumah Tipe ${rumah.tipe} di properti ${properti.nama_properti}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition shadow-lg shadow-green-600/20"
                            >
                                <Phone size={18} /> Hubungi via WhatsApp
                            </a>
                        )}

                        <button
                            onClick={() => setBuyerOpen(true)}
                            className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-600/20"
                        >
                            ✍️ Isi Data Buyer
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= MODAL ================= */}
            <BuyerModal
                open={buyerOpen}
                idRumah={rumah.id_rumah}
                onClose={() => setBuyerOpen(false)}
                onSuccess={() => alert("Data buyer berhasil disimpan")}
            />
        </div>
    );
}

/* ================= SUB COMPONENT ================= */
function Spec({ icon: Icon, label, value, rotate }) {
    return (
        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-blue-500">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-500">
                <Icon
                    size={18}
                    className={`text-blue-600 ${rotate ? "rotate-90" : ""}`}
                />
            </div>
            <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}
