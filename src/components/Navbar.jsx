// src/components/Navbar.jsx Updated
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const goHomeAndScroll = (section) => {
    navigate("/");
    setTimeout(() => {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  return (
    <nav className="w-full shadow-md sticky top-0 z-50">
      {/* GANTI FLEX → GRID */}
      <div className="max-w-7xl mx-auto px-6 py-3 grid grid-cols-3 items-center">

        {/* LEFT: LOGO */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="https://www.xaviermarks.com/assets/images/logo-xm.png"
            alt="Logo"
            className="h-10"
          />
        </div>

        {/* CENTER: MENU */}
        <ul className="hidden md:flex justify-center space-x-8 font-semibold text-white">
          <li>
            <button onClick={() => goHomeAndScroll("properti")} className="hover:text-gray-100">
              Properti
            </button>
          </li>
          <li>
            <button onClick={() => goHomeAndScroll("tentang")} className="hover:text-gray-100">
              Tentang
            </button>
          </li>
          <li>
            <button onClick={() => goHomeAndScroll("kontak")} className="hover:text-gray-100">
              Kontak
            </button>
          </li>
        </ul>

        {/* RIGHT: HAMBURGER */}
        <div className="flex justify-end">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white text-3xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-cyan-500 text-white px-6 pb-4 space-y-2">
          <button onClick={() => goHomeAndScroll("properti")} className="block w-full text-left">Properti</button>
          <button onClick={() => goHomeAndScroll("tentang")} className="block w-full text-left">Tentang</button>
          <button onClick={() => goHomeAndScroll("kontak")} className="block w-full text-left">Kontak</button>
        </div>
      )}
    </nav>
  );
}
