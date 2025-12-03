// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import { AuthContext } from "../middleware/AuthProvider";

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

      // Support both response shapes:
      // 1) { token, role, nama }  (your current backend)
      // 2) { token, user: { ... } }
      const { token, role, nama, user } = res.data;

      let normalizedUser;
      if (user) {
        normalizedUser = {
          ...user,
          role: (user.role || user.jabatan || role || "member").toString(),
        };
      } else {
        normalizedUser = {
          name: nama || "",
          role: (role || "member").toString(),
        };
      }

      if (!token) {
        setErrorMsg("Respons server tidak valid (token tidak ada).");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      if (setUser) setUser(normalizedUser);

      const r = (normalizedUser.role || "member").toString().toLowerCase();
      if (r === "admin") navigate("/admin/dashboard", { replace: true });
      else if (r.includes("leader") && r.includes("senior")) navigate("/senior/dashboard", { replace: true });
      else if (r.includes("leader")) navigate("/leader/dashboard", { replace: true });
      else navigate("/member/dashboard", { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      const msg = err?.response?.data?.message || "Login gagal — periksa email/password.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

    return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-indigo-400 to-sky-300">
    {/* background subtle overlay for depth */}
    <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: "multiply", opacity: 0.06 }} />

    <div className="relative z-10 w-full max-w-sm px-6">
      {/* Card */}
      <div className="bg-white rounded-2xl p-8 pt-6 shadow-[0_30px_60px_rgba(2,6,23,0.25)]">
        {/* Header */}
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-extrabold text-white/0 invisible">hidden</h2>
          <div className="text-left">
            <h3 className="text-2xl font-bold text-slate-800">Login</h3>
            <p className="text-sm text-gray-400">Hello! let's get started</p>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-2 rounded-md mb-3 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Username</label>
            <div className="flex items-center rounded-full border border-gray-200 px-3 py-2 bg-white shadow-sm">
              {/* icon */}
              <svg className="w-4 h-4 text-gray-300 mr-3" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 21c0-3.866 3.582-7 9-7s9 3.134 9 7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username"
                className="w-full outline-none text-sm placeholder-gray-300"
                aria-label="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Password</label>
            <div className="flex items-center rounded-full border border-gray-200 px-3 py-2 bg-white shadow-sm">
              {/* icon lock */}
              <svg className="w-4 h-4 text-gray-300 mr-3" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full outline-none text-sm placeholder-gray-300"
                aria-label="password"
              />
              {/* optional eye icon (non-functional) */}
              <svg className="w-4 h-4 text-gray-300 ml-3" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.1" />
              </svg>
            </div>
          </div>

          {/* button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 shadow-lg hover:scale-[0.995] active:scale-[0.99] transition-transform disabled:opacity-60 flex items-center justify-center gap-3"
            >
              {/* small circle icon */}
            <span className="inline-block w-5 h-5 bg-white/20 rounded-full" />
            {loading ? "Memproses..." : "Login"}
            </button>
          </div>

          <div className="text-center mt-3">
            <a href="/forgot-password" className="text-sm text-indigo-500 hover:underline">Forgot password?</a>
          </div>
        </form>
      </div>
    </div>
  </div>
);



}
