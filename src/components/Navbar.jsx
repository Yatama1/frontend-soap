// src/components/Navbar.jsx Updated
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const goHomeAndScroll = (section) => {
    navigate("/");
    setTimeout(() => {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  return (
    <nav className="w-full bg-gradient-to-r from-cyan-400 to-orange-400 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>          <img src="https://www.xaviermarks.com/assets/images/logo-xm.png" alt="Logo" className="h-10" />
        </div>

        <ul className="hidden md:flex space-x-6 font-semibold text-white">
          <li>
            <button onClick={() => goHomeAndScroll("properti")} className="hover:text-gray-100">Properti</button>
          </li>
          <li>
            <button onClick={() => goHomeAndScroll("tentang")} className="hover:text-gray-100">Tentang</button>
          </li>
          <li>
            <button onClick={() => goHomeAndScroll("kontak")} className="hover:text-gray-100">Kontak</button>
          </li>
        </ul>

        <div className="hidden md:flex gap-3 items-center">
          {token ? (
            <>
              <div className="text-white mr-2">Hi, {user.nama || user.name || "User"}</div>
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
            </>
          ) : (
            <button onClick={() => navigate("/login-member")} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Login</button>
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-3xl">☰</button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-cyan-500 text-white px-6 pb-4 space-y-2">
          <button onClick={() => goHomeAndScroll("properti")} className="block w-full text-left">Properti</button>
          <button onClick={() => goHomeAndScroll("tentang")} className="block w-full text-left">Tentang</button>
          <button onClick={() => goHomeAndScroll("kontak")} className="block w-full text-left">Kontak</button>

          {token ? (
            <button onClick={handleLogout} className="w-full bg-red-500 py-2 rounded mt-2">Logout</button>
          ) : (
            <button onClick={() => navigate("/login-member")} className="w-full bg-blue-600 py-2 rounded mt-2">Login</button>
          )}
        </div>
      )}
    </nav>
  );
}