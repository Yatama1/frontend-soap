import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useContext } from "react";
import { AuthContext } from "../middleware/AuthProvider";
import {
  LayoutDashboard,
  Users,
  User,
  BriefcaseBusiness,
  Building2,
  Home,
  LogOut,
  UserStar,
  FileText,
  UserRoundCheck,
  Settings,
  Gauge,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    // 1. Auth check
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // 2. Ambil dari AuthContext dulu
    if (user?.nama || user?.name) {
      setAdminName(user.nama || user.name);
      return;
    }

    // 3. Fallback ke localStorage
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setAdminName(parsed.nama || parsed.name || "Admin");
      }
    } catch {
      setAdminName("Admin");
    }
  }, [navigate, user]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  /* ================= MENU GROUP (SIDEBAR) ================= */
  const menuGroups = [
    {
      title: "Dashboard",
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Management Property",
      items: [
        { name: "Propertys", path: "/admin/PropertiAdmin", icon: Building2 },
        { name: "Houses", path: "/admin/rumah", icon: Home },
      ],
    },
    {
      title: "Management Member",
      items: [
        { name: "Senior Leaders", path: "/admin/senior", icon: UserStar },
        { name: "Leaders", path: "/admin/leader", icon: Users },
        { name: "Members", path: "/admin/members", icon: User },
        { name: "Kinerja Member", path: "/admin/kinerja-member", icon: Gauge },
      ],
    },
    {
      title: "Laporan",
      items: [
        { name: "Calon Buyer", path: "/admin/cabuy", icon: UserRoundCheck },
        { name: "Survey", path: "/admin/survey", icon: FileText },
        { name: "Crm", path: "/admin/crm", icon: BriefcaseBusiness },
      ],
    },
    {
      title: "System",
      items: [
        { name: "Settings", path: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200
          flex flex-col shadow-sm z-30
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 shadow shadow-gray-300 bg-blue-50/50">
          <div className="font-bold text-xl text-blue-700 flex items-center gap-2">
            <Building2 size={22} /> GudangApp
          </div>
        </div>

        {/* Menu */}
        <div className="px-4 py-6 flex-1 overflow-y-auto hide-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3 px-2">
                {group.title}
              </p>

              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                          ? "bg-blue-50 text-blue-700 shadow-sm border-l-4"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`
                      }
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>


        {/* Profile */}
        <div className="shadow shadow-gray-300 p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {adminName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold">{adminName}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-md"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      {/* ================= OVERLAY (MOBILE) ================= */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
        />
      )}

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">

        {/* ================= TOPBAR ================= */}
        <header className="h-16 bg-white shadow shadow-gray-300 flex items-center justify-between px-6 sticky top-0 z-10">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* HAMBURGER */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <h2 className="text-lg font-semibold">Dashboard Admin</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Dropdown Profile (Pojok Kanan Atas) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 focus:outline-none group p-1 pr-3 rounded-full hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors hidden md:block">
                  Hi, {adminName}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Login sebagai</p>
                    <p className="text-xs text-gray-500 truncate">{adminName}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/admin/profile");
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

        {/* ================= CONTENT ================= */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
