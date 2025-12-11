// src/components/leader/LeaderFormModal.jsx
import { useState, useEffect } from "react";
import axios from "axios";

// --- 1. KONFIGURASI AXIOS MANDIRI ---
const base = import.meta?.env?.VITE_API_URL || "http://localhost:5000";
const baseURL = base.endsWith("/api") ? base : `${base.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function LeaderFormModal({ onClose, onSaved, leaderData }) {
  // Cek apakah mode Edit (jika ada data leader yang dikirim)
  const isEdit = !!(leaderData && (leaderData.id_member || leaderData.id));

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    nama: leaderData?.nama_member || leaderData?.nama || "",
    email: leaderData?.email || "",
    kontak: leaderData?.kontak || "",
    password: "",
  });

  // Sync Data saat mode Edit
  useEffect(() => {
    if (leaderData) {
      setFormData({
        nama: leaderData.nama_member || leaderData.nama || "",
        email: leaderData.email || "",
        kontak: leaderData.kontak || "",
        password: "", // Password kosong saat edit
      });
    }
  }, [leaderData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.nama?.trim()) return setErrorMsg("Nama wajib diisi.");
    if (!formData.email?.trim()) return setErrorMsg("Email wajib diisi.");
    if (!isEdit && !formData.password) return setErrorMsg("Password wajib untuk Leader baru.");

    setSaving(true);
    try {
      // Build Payload
      const payload = {
        nama: formData.nama,
        email: formData.email,
        kontak: formData.kontak,
        jabatan: "leader", // 🔒 DIKUNCI: Pasti jadi LEADER
        ...(formData.password && { password: formData.password })
      };

      // Backend (createMember) otomatis mendeteksi Senior Leader yg login
      // dan menjadikan dia sebagai atasan (id_senior) dari Leader baru ini.

      if (isEdit) {
        const id = leaderData.id_member || leaderData.id;
        await api.put(`/members/${id}`, payload);
      } else {
        await api.post("/members", payload);
      }

      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error("Gagal simpan leader:", err);
      const msg = err?.response?.data?.message || err.message || "Gagal menyimpan.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Data Leader" : "Tambah Leader Baru"}
        </h3>

        {errorMsg && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAMA */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Nama Lengkap</label>
            <input type="text" name="nama" value={formData.nama} onChange={handleChange} required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          {/* KONTAK */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Kontak (WA)</label>
            <input type="text" name="kontak" value={formData.kontak} onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password {isEdit && <span className="text-gray-400 font-normal">(Kosongkan jika tetap)</span>}
            </label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder={isEdit ? "..." : "Minimal 6 karakter"}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              required={!isEdit} 
            />
          </div>

          {/* TOMBOL */}
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} disabled={saving}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">Batal</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {saving ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}