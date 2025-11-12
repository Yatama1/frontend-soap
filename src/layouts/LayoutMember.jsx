import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard,
  Users,
  UserRoundPen,
  LogOut,
  Building2,
  UserCircle2,
  Home,
} from "lucide-react";

export default function LayoutMember() {
  const navigate = useNavigate();
  const [memberName, setMemberName] = useState("Member");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      navigate("/login-member", { replace: true });
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setMemberName(userData.nama_member || userData.nama || "Member");
    } catch (err) {
      console.error("Gagal parsing user data:", err);
      setMemberName("Member");
    }
  }, [navigate]);

  // Tutup dropdown jika klik di luar area menu
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
    navigate("/login-member", { replace: true });
  };

  const menuItems = [
    { name: "Home", path: "/member/dashboard", icon: LayoutDashboard },
    { name: "Leads", path: "/member/leads", icon: Users },
    { name: "Properti", path: "/member/properti-saya", icon: Building2 },
    { name: "Laporan", path: "/member/laporan", icon: Home },
  ];

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar (tetap di tempat) */}
      <aside className="fixed top-0 left-0 h-full w-72 bg-gray-900 shadow-sm border-r border-gray-900 flex flex-col">
        <div className="p-5 border-b-2 border-red-600">
          <div className="mb-auto flex gap-1 items-center">
            <span className="text-red-600">
              <UserRoundPen size={36} strokeWidth={3} />
            </span>
            <h3 className="font-bold text-red-600 text-2xl flex gap-1">
              GudangApp
            </h3>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Selamat datang,{" "}
            <span className="font-semibold text-red-600">{memberName}</span> 👋
          </p>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                    ? "bg-gray-950 border-l-4 border-red-600 text-red-700"
                    : "text-gray-400 hover:bg-gray-900"
                  }`
                }
              >
                <Icon size={18} />
                <span className="text-sm font-semibold">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t-2 border-red-600">
          <div className="text-xs text-gray-400 mb-1">Signed in as</div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-red-600 font-medium">{memberName}</div>
            <button
              onClick={logout}
              className="bg-gray-950 flex items-center gap-1 text-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-gray-950"
            >
              <LogOut size={20} strokeWidth={1.5} />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Konten utama */}
      <div className="flex-1 flex flex-col ml-72">
        {/* Header fixed */}
        <header className="fixed top-0 left-72 right-0 bg-gray-900 border-b border-gray-800 flex items-center justify-end px-6 py-3 z-50">
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-3 cursor-pointer select-none focus:outline-none"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <UserCircle2 className="text-red-600 hover:text-gray-900 hover:bg-red-600 hover:rounded-full" size={30} />
            </button>

            {/* Dropdown Profile */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 z-[9999]">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/member/profile");
                  }}
                  className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-red-500 transition"
                >
                  Profil Saya
                </button>
                <hr className="border-gray-700" />
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-gray-300 hover:bg-red-600 hover:text-gray-950 transition flex items-center gap-2"
                >
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Konten scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-6 mt-[64px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
