import React, { useEffect, useState } from "react";
import {
    Users, UserPlus, Search, RefreshCw,
    Edit, Trash2, Phone, Mail, Briefcase
} from "lucide-react";
import api from "../../api/apiClient";
import MemberFormModal from "../../components/MemberFormModal";

export default function MemberList() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    // ambil role user login
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user?.role;

    const canCRUD = role === "admin" || role === "leader";

    // ================= FETCH DATA =================
    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/members");
            // endpoint ini sudah kamu set: hanya return jabatan = member

            const data = res?.data?.members || [];

            const formatted = data.map((item) => ({
                ...item,
                id: item.id_member || item.id,
            }));

            setMembers(formatted);
        } catch (error) {
            console.error("Error:", error);
            alert("Gagal memuat data member.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // ================= HANDLERS =================
    const handleDelete = async (id, nama) => {
        if (!window.confirm(`Hapus member "${nama}" ?`)) return;
        try {
            await api.delete(`/members/${id}`);
            setMembers((prev) => prev.filter((m) => m.id !== id));
        } catch (error) {
            alert("Gagal menghapus.");
            console.log("Delete error:", error);
        }
    };

    const openAddModal = () => {
        setSelectedMember(null);
        setIsModalOpen(true);
    };

    const openEditModal = (member) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const filteredMembers = members.filter((m) =>
        (m.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ================= LOADING =================
    if (loading)
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-24 bg-gray-100 rounded-2xl animate-pulse"
                        ></div>
                    ))}
                </div>
            </div>
        );

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50 font-sans">

            {/* ================= HEADER ================= */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Briefcase className="text-blue-600" size={24} />
                        </div>
                        Team Members
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 ml-12">
                        Data member (agent) di dalam sistem.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={fetchMembers}
                        className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} />
                    </button>

                    {canCRUD && (
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        >
                            <UserPlus size={18} />
                            <span className="font-medium">Tambah Member</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ================= SEARCH ================= */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-2">
                <div className="p-2 text-gray-400">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Cari nama member..."
                    className="w-full py-2 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* ================= TABLE ================= */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredMembers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-gray-900 font-medium">Data tidak ditemukan</h3>
                        <p className="text-gray-500 text-sm mt-1">
                            Belum ada member atau tidak sesuai pencarian.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4 font-semibold">Profil Member</th>
                                    <th className="px-6 py-4 font-semibold">Kontak</th>
                                    <th className="px-6 py-4 font-semibold text-center">
                                        Leads
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredMembers.map((member) => {
                                    const initial = (member.nama || "U")
                                        .charAt(0)
                                        .toUpperCase();

                                    return (
                                        <tr
                                            key={member.id}
                                            className="group hover:bg-blue-50/30 transition-colors duration-200"
                                        >
                                            {/* PROFIL */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-100 to-indigo-100 text-green-600 font-bold text-lg flex items-center justify-center shadow-sm border border-white">
                                                        {initial}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">
                                                            {member.nama}
                                                        </p>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-600 border border-green-100 mt-1">
                                                            Member
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* KONTAK */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail size={14} className="text-gray-400" />
                                                        <span className="truncate max-w-[150px]">
                                                            {member.email}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone size={14} className="text-gray-400" />
                                                        <span>{member.kontak || "-"}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* STATISTIK */}
                                            <td className="px-6 py-4 text-center">
                                                <div
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${member.total_leads > 0
                                                        ? "bg-green-50 text-green-700 border-green-100"
                                                        : "bg-gray-50 text-gray-500 border-gray-100"
                                                        }`}
                                                >
                                                    <Users size={12} className="mr-1.5" />
                                                    {member.total_leads || 0} Leads
                                                </div>
                                            </td>

                                            {/* AKSI */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    {canCRUD && (
                                                        <>
                                                            <button
                                                                onClick={() => openEditModal(member)}
                                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(member.id, member.nama)
                                                                }
                                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ================= MODAL ================= */}
            {isModalOpen && (
                <MemberFormModal
                    memberData={selectedMember}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={() => {
                        fetchMembers();
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
