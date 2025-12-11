// src/components/SeniorFormModal.jsx
import { useState, useEffect } from "react";
import axios from "axios";

// --- KONFIGURASI AXIOS (sama pola dengan modal lain) ---
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

/**
 * Modal untuk tambah / edit Senior Leader
 * props:
 *  - seniorData  : object member (jika edit), atau null (jika tambah)
 *  - onClose     : function()
 *  - onSaved     : function() -> dipanggil setelah save sukses
 */
export default function SeniorFormModal({ seniorData, onClose, onSaved }) {
  const isEdit = !!(seniorData && (seniorData.id_member || seniorData.id));

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    nama: seniorData?.nama || seniorData?.nama_member || "",
    email: seniorData?.email || "",
    kontak: seniorData?.kontak || "",
    password: "",
  });

  // Sync ketika masuk mode edit
  useEffect(() => {
    if (seniorData) {
      setForm({
        nama: seniorData.nama || seniorData.nama_member || "",
        email: seniorData.email || "",
        kontak: seniorData.kontak || "",
        password: "",
      });
    }
  }, [seniorData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.nama.trim()) return setErrorMsg("Nama wajib diisi.");
    if (!form.email.trim()) return setErrorMsg("Email wajib diisi.");
    if (!isEdit && !form.password) return setErrorMsg("Password wajib untuk senior baru.");

    setSaving(true);
    try {
      const payload = {
        nama: form.nama,
        email: form.email,
        kontak: form.kontak,
        jabatan: "senior_leader", // 🔒 dikunci
        ...(form.password && { password: form.password }),
      };

      if (isEdit) {
        const id = seniorData.id_member || seniorData.id;
        await api.put(`/members/${id}`, payload);
      } else {
        await api.post("/members", payload);
      }

      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error("Gagal simpan senior:", err);
      const msg = err?.response?.data?.message || err.message || "Gagal menyimpan data.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-4">
          {isEdit ? "Edit Senior Leader" : "Tambah Senior Leader"}
        </h3>

        {errorMsg && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              required
              placeholder="Nama"
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <input
              name="kontak"
              value={form.kontak}
              onChange={handleChange}
              placeholder="Kontak"
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={isEdit ? "Password (Opsional)" : "Password (Wajib)"}
              className="w-full border p-2 rounded"
              required={!isEdit}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border p-2 rounded hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
