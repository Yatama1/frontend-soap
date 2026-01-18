import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
    LayoutDashboard,
    Users,
    LogOut,
    Building2,
    UserStar,
    UserRoundCheck,
    FileText,
    Settings,
} from "lucide-react";
import api from "../api/apiClient"; // ⬅️ pastikan path sesuai

export default function LayoutMember() {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [followUpCount, setFollowUpCount] = useState(0);

    /* ================= MEMBER NAME ================= */
    const [memberName] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const u = JSON.parse(storedUser);
                return u.nama_member || u.nama || u.name || "User";
            }
        } catch { }
        return "User";
    });

    /* ================= SECURITY ================= */
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) navigate("/login", { replace: true });
    }, [navigate]);

    /* ================= FETCH FOLLOW UP COUNT ================= */
    useEffect(() => {
        const fetchFollowUpCount = async () => {
            try {
                const res = await api.get("/cabuy/senior");
                const list = res?.data?.data || [];
                setFollowUpCount(list.length);
            } catch (err) {
                console.error("Gagal ambil follow up count:", err);
            }
        };

        fetchFollowUpCount();
    }, []);

    /* ================= CLOSE DROPDOWN ================= */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    /* ================= MENU DATA ================= */
    const menuGroups = [
        {
            title: "DASHBOARD",
            items: [
                { name: "Dashboard", path: "/senior/dashboard", icon: LayoutDashboard },
            ],
        },
        {
            title: "MANAGEMENT LEADER",
            items: [
                { name: "My Leaders", path: "/senior/leader", icon: Users },
                { name: "Leader Members", path: "/senior/member-leader", icon: UserStar },
                {
                    name: "Data Cabuy",
                    path: "/senior/cabuy-followup",
                    icon: UserRoundCheck,
                    badge: followUpCount,
                },
                { name: "Jadwalkan Survey", path: "/senior/survey-senior", icon: FileText },
                { name: "Laporan Survey", path: "/senior/laporan-survey-senior", icon: FileText },
            ],
        },
        {
            title: "SYSTEM",
            items: [
                { name: "Settings", path: "/admin/leads", icon: Settings },
            ],
        },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">

            {/* ================= SIDEBAR ================= */}
            <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-20">

                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="font-bold text-lg tracking-tight text-blue-700 flex items-center gap-2">
                        <Building2 size={22} /> GudangApp
                    </div>
                </div>

                {/* Menu */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                    {menuGroups.map((group, idx) => (
                        <div key={idx}>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                {group.title}
                            </p>

                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${isActive
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                                }`
                                            }
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={18} />
                                                <span>{item.name}</span>
                                            </div>

                                            {/* 🔔 BADGE */}
                                            {item.badge > 0 && (
                                                <span className="min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-orange-500 rounded-full flex items-center justify-center">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ================= USER CARD ================= */}
                <div className="border-t border-gray-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            {(memberName?.charAt(0) || "U").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {memberName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                Senior Leader Account
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                        <LogOut size={14} /> Keluar
                    </button>
                </div>
            </aside>

            {/* ================= MAIN AREA ================= */}
            <div className="flex-1 flex flex-col ml-64 min-w-0 bg-gray-50">

                {/* TOPBAR */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Dashboard Senior Leader
                    </h2>

                    {/* PROFILE DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 focus:outline-none group p-1 pr-3 rounded-full hover:bg-gray-100 transition"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                {(memberName?.charAt(0) || "U").toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden md:block">
                                Hi, {memberName}
                            </span>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">
                                        Login sebagai
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {memberName}
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        navigate("/member/profile");
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Profil Saya
                                </button>

                                <div className="border-t border-gray-100 my-1"></div>

                                <button
                                    onClick={logout}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
