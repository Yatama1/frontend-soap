import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Building2, Home, LogOut } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setAdminName(JSON.parse(raw).nama || JSON.parse(raw).name || "Admin");
    } catch { setAdminName("Admin"); }
    // simple auth check (keep your existing logic)
    const token = localStorage.getItem("token");
    if (!token) navigate("/login", { replace: true });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { name: "Home", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Senior", path: "/admin/senior", icon: Users },
    { name: "Properti", path: "/admin/PropertiAdmin", icon: Building2 },
    { name: "Laporan", path: "/admin/laporan", icon: Home },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-72 bg-white shadow-sm border-r">
        <div className="p-5 flex items-center gap-3">
          
          <div>
            <div className="font-semibold text-gray-800">AdminAPP</div>
            <div className="text-xs text-gray-400">
                <p className="text-sm text-gray-800 mt-2">
                        Selamat datang, <span className="font-semibold">{adminName}</span> 👋
                    </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-blue-50 border-l-4 border-blue-400 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Icon size={18} />
                <span className="text-sm">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto p-4">
          <div className="text-xs text-gray-500 mb-2">Signed in as</div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">{adminName}</div>
            <button onClick={logout} className="bg-red-50 text-red-600 px-3 py-1 rounded">Keluar</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[80vh]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
