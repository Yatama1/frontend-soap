import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Building2,
  UserCircle2,
  Home,
} from "lucide-react";

export default function LayoutMember() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 1. PERBAIKAN UTAMA: Ambil nama LANGSUNG saat inisialisasi state
  // Ini mencegah nama "Member" muncul duluan sebelum nama asli
  const [memberName, setMemberName] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // Cek semua kemungkinan variasi nama properti dari backend
        return userData.nama_member || userData.nama || userData.name || "Member";
      }
    } catch (error) {
      console.error("Gagal membaca data user:", error);
    }
    return "Member"; // Default jika gagal
  });

  // 2. Cek Token (Security)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // 3. Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { name: "Dashboard", path: "/member/dashboard", icon: LayoutDashboard },
    { name: "Leads Saya", path: "/member/leads", icon: Users },
    { name: "Properti Saya", path: "/member/properti-saya", icon: Building2 },
    { name: "Laporan Tim", path: "/member/leadermember", icon: Home },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">

      {/* --- SIDEBAR --- */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">

        {/* Logo Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-blue-50/50">
          <div className="font-bold text-xl tracking-tight text-blue-700 flex items-center gap-2">
            <Building2 size={24} /> GudangApp
          </div>
        </div>

        {/* Menu Navigasi */}
        <div className="px-4 py-6 flex-1 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu Utama</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm border-l-4"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile (Bawah Sidebar) */}
        <div className="mt-auto border-t border-gray-100 p-4 bg-gray-50/30">
          <div className="flex items-center gap-3">
            {/* Avatar Inisial Otomatis */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              {memberName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {memberName}
              </p>
              <p className="text-xs text-gray-500 truncate">Member Account</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      {/* --- KONTEN UTAMA --- */}
      <div className="flex-1 flex flex-col ml-64 min-w-0 bg-gray-50">

        {/* Header Atas (Topbar) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">
            Dashboard Member
          </h2>

          <div className="flex items-center gap-4">
            {/* Dropdown Profile (Pojok Kanan Atas) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 focus:outline-none group p-1 pr-3 rounded-full hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {memberName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors hidden md:block">
                  Hi, {memberName}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Login sebagai</p>
                    <p className="text-xs text-gray-500 truncate">{memberName}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/member/profile");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
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
          </div>
        </header>

        {/* Area Konten Halaman */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}