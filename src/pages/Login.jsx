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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white shadow rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        {errorMsg && (
          <div className="bg-red-100 text-red-600 p-2 mb-4 rounded-md text-center">
            {errorMsg}
          </div>
        )}

        <label className="block mb-2">Email</label>
        <input
          className="w-full border p-2 rounded mb-4"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Masukkan email"
        />

        <label className="block mb-2">Password</label>
        <input
          className="w-full border p-2 rounded mb-4"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
