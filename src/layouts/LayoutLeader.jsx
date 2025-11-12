import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Building2, Home } from "lucide-react";

export default function LayoutMember() {
    const navigate = useNavigate();
    const [memberName, setMemberName] = useState("Member");

    useEffect(() => {
        // Ambil data user dari localStorage
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!token || !storedUser) {
            navigate("/login-member", { replace: true });
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            // Pastikan sesuai dengan struktur backend kamu
            setMemberName(userData.nama_member || userData.nama || "Member");
        } catch (err) {
            console.error("Gagal parsing user data:", err);
            setMemberName("Member");
        }
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login-member", { replace: true });
    };

    const menuItems = [
        { name: "Home", path: "/member/dashboard", icon: LayoutDashboard },
        { name: "Leads", path: "/member/leads", icon: Users },
        { name: "Properti", path: "/member/properti-saya", icon: Building2 },
        { name: "Laporan", path: "/member/laporan", icon: Home },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-72 bg-white shadow-sm border-r flex flex-col">
                <div className="p-5">
                    <div className="font-semibold text-gray-800 text-lg">GudangApp</div>
                    <p className="text-sm text-gray-600 mt-2">
                        Selamat datang, <span className="font-semibold text-blue-600">{memberName}</span> 👋
                    </p>
                </div>

                <nav className="p-4 space-y-1 flex-1">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                        ? "bg-blue-50 border-l-4 border-blue-400 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`
                                }
                            >
                                <Icon size={18} />
                                <span className="text-sm">{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="mt-auto p-4 border-t">
                    <div className="text-xs text-gray-500 mb-1">Signed in as</div>
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{memberName}</div>
                        <button
                            onClick={logout}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100"
                        >
                            Keluar
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[80vh]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
