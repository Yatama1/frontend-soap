// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import { AuthContext } from "../middleware/AuthProvider";
import { Mail, Lock, Eye } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      const { token, role, nama, id, email: emailFromServer } = res.data || {};

      if (!token || !role) {
        setErrorMsg("Respons server tidak valid.");
        setLoading(false);
        return;
      }

      const normalizedUser = {
        id,
        nama: nama || "User",
        email: emailFromServer || email,
        role: role.toString(),
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      if (setUser) setUser(normalizedUser);

      const r = normalizedUser.role.toLowerCase();
      if (r === "admin") navigate("/admin/dashboard", { replace: true });
      else if (r === "senior_leader") navigate("/senior/dashboard", { replace: true });
      else if (r === "leader") navigate("/leader/dashboard", { replace: true });
      else navigate("/member/dashboard", { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(
        err?.response?.data?.message ||
        "Login gagal — periksa email/password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-200 overflow-hidden">

      {/* Decorative blur */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 blur-3xl rounded-full"></div>
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cyan-500/10 blur-3xl rounded-full"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Masuk untuk melanjutkan ke dashboard
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Email
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus-within:border-blue-500 transition">
                <Mail size={18} className="text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-transparent outline-none text-sm placeholder-slate-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Password
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus-within:border-blue-500 transition">
                <Lock size={18} className="text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent outline-none text-sm placeholder-slate-500"
                  required
                />
                <Eye size={18} className="text-slate-600" />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl font-semibold text-white 
              bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500
              shadow-lg shadow-blue-600/30
              hover:brightness-110 active:scale-[0.99] transition
              disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>

            {/* Footer link */}
            <div className="text-center pt-2">
              <a
                href="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition"
              >
                Lupa password?
              </a>
            </div>
          </form>
        </div>

        {/* Footer small */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © {new Date().getFullYear()} SOAP Platform
        </p>
      </div>
    </div>
  );
}
