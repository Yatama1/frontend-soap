import { useEffect, useState } from "react";
import { UserCircle2, Mail, Shield, FolderPen, X, Phone, Key, Hash } from "lucide-react";

export default function MemberProfile() {
    const [memberData, setMemberData] = useState({
        nama_member: "",
        kontak: "",
        id_admin: "",
        jabatan: "",
        leader_id: "",
        email: "",
        password: "",
    });

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState({ ...memberData });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                const newData = {
                    nama_member: userData.nama_member || userData.nama || "Member",
                    kontak: userData.kontak || "-",
                    id_admin: userData.id_admin || "-",
                    jabatan: userData.jabatan || "Member",
                    leader_id: userData.leader_id || "-",
                    email: userData.email || "-",
                    password: userData.password || "********",
                };
                setMemberData(newData);
                setEditData(newData);
            } catch (err) {
                console.error("Gagal parsing user:", err);
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setMemberData(editData);
        localStorage.setItem("user", JSON.stringify(editData)); // Simpan ke localStorage
        setShowModal(false);
    };

    return (
        <div className="mx-auto bg-gray-900 rounded-2xl shadow-lg p-8 text-gray-200 border border-gray-800 relative">
            {/* Header */}
            <div className="flex flex-col items-center border-b border-gray-700 pb-6 mb-6">
                <UserCircle2 className="text-red-600" size={80} />
                <h2 className="text-2xl font-bold text-red-600 mt-3">{memberData.nama_member}</h2>
                <p className="text-sm text-gray-400 capitalize">{memberData.jabatan}</p>
            </div>

            {/* Detail Info */}
            <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3">
                <InfoCard icon={<FolderPen className="text-red-600" />} label="Nama" value={memberData.nama_member} />
                <InfoCard icon={<Phone className="text-red-600" />} label="Kontak" value={memberData.kontak} />
                <InfoCard icon={<Shield className="text-red-600" />} label="Jabatan" value={memberData.jabatan} />
                <InfoCard icon={<Hash className="text-red-600" />} label="Leader ID" value={memberData.leader_id} />
                <InfoCard icon={<Mail className="text-red-600" />} label="Email" value={memberData.email} />
                <InfoCard icon={<Key className="text-red-600" />} label="Password" value={memberData.password} />
            </div>

            {/* Tombol edit profil */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                >
                    Edit Profil
                </button>
            </div>

            {/* 🔹 Modal Edit Profil */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md border border-gray-800 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
                            onClick={() => setShowModal(false)}
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-red-600 mb-4 border-b border-gray-700 pb-2">
                            Edit Profil Member
                        </h3>

                        <div className="space-y-4">
                            {Object.keys(editData).map((key) => (
                                <div key={key}>
                                    <label className="block text-sm text-gray-400 mb-1 capitalize">
                                        {key.replace("_", " ")}
                                    </label>
                                    <input
                                        type={key === "password" ? "password" : "text"}
                                        name={key}
                                        value={editData[key]}
                                        onChange={handleChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-red-600"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-gray-200 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// 🔹 Komponen kecil untuk tampilan field info
function InfoCard({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
            {icon}
            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-semibold break-all">{value}</p>
            </div>
        </div>
    );
}
