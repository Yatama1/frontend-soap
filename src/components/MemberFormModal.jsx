// src/components/member/MemberFormModal.jsx
import { useState, useEffect } from "react";
import axios from "axios";

// --- 1. KONFIGURASI AXIOS MANDIRI (Anti Error Import) ---
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

// --- 2. HELPER: BONGKAR TOKEN (Untuk Cek Role) ---
function getRoleFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    const decoded = JSON.parse(jsonPayload);
    // Sesuaikan dengan isi token Anda: role atau jabatan
    return (decoded.role || decoded.jabatan || "").toString().toLowerCase();
  } catch (e) {
    return null;
  }
}

export default function MemberFormModal({ onClose, onSaved, member }) {
  const isEdit = !!(member && (member.id_member || member.id));
  const currentRole = getRoleFromToken();

  const [leaders, setLeaders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    nama: member?.nama_member || member?.nama || "",
    email: member?.email || "",
    kontak: member?.kontak || "",
    jabatan: member?.jabatan || member?.role || "member",
    leader_id: member?.id_leader ?? member?.leader_id ?? "",
    password: "",
  });

  // --- AMBIL DAFTAR LEADER (Jika User Admin/Senior) ---
  useEffect(() => {
    if (currentRole === "leader" || currentRole === "member") return;

    // Fetch daftar member yang jabatannya 'leader'
    // Endpoint ini mungkin perlu disesuaikan dengan backend Anda (misal: /members?jabatan=leader)
    // Atau jika backend getMembers sudah otomatis filter, biarkan.
    api.get("/members") 
      .then((res) => {
        const data = res?.data?.members || res?.data || [];
        // Filter hanya yang jabatannya leader
        const leaderList = data.filter(m => m.jabatan === "leader");
        setLeaders(leaderList);
      })
      .catch((err) => console.warn("Gagal load leader list:", err));
  }, [currentRole]);

  // Sync Data Edit
  useEffect(() => {
    if (member) {
      setFormData({
        nama: member.nama_member || member.nama || "",
        email: member.email || "",
        kontak: member.kontak || "",
        jabatan: member.jabatan || "member",
        leader_id: member.id_leader || "",
        password: "",
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.nama?.trim()) return setErrorMsg("Nama wajib diisi.");
    if (!formData.email?.trim()) return setErrorMsg("Email wajib diisi.");
    if (!isEdit && !formData.password) return setErrorMsg("Password wajib untuk user baru.");

    setSaving(true);
    try {
      // Build Payload (Sesuai Controller createMember)
      const payload = {
        nama: formData.nama,
        email: formData.email,
        kontak: formData.kontak,
        jabatan: formData.jabatan,
        // Password hanya dikirim jika diisi (untuk edit)
        ...(formData.password && { password: formData.password })
      };

      // ID Leader hanya dikirim jika dipilih manual (untuk Admin/Senior)
      // Jika yang login Leader, backend otomatis mengabaikan ini dan pakai token
      if (formData.leader_id) {
        // Backend kita tadi tidak secara eksplisit membaca 'leader_id' dari body untuk role selain leader
        // Tapi jika Anda mau support admin assign leader manual, backend createMember perlu sedikit disesuaikan.
        // TAPI: Untuk amannya, biarkan logika backend yang mengatur hierarki.
      }

      if (isEdit) {
        const id = member.id_member || member.id;
        await api.put(`/members/${id}`, payload); // Pastikan endpoint plural 'members'
      } else {
        await api.post("/members", payload);
      }

      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error("Gagal simpan member:", err);
      const msg = err?.response?.data?.message || err.message || "Gagal menyimpan.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h3 className="text-xl font-semibold mb-4">{isEdit ? "Edit Member" : "Tambah Member"}</h3>

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

          {/* JABATAN */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Jabatan</label>
           <input type="text" name="jabatan" value={formData.jabatan} readOnly
              className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          {/* PILIH LEADER (Hanya muncul jika yang buat BUKAN Leader & BUKAN Member) */}
          {/* Karena Leader otomatis jadi atasan, dan Member tidak bisa buat user */}
          {/* Logic ini disederhanakan: Jika Admin/Senior mau assign manual (Opsional) */}
          {/* Saat ini Backend createMember otomatis handle ID parent, jadi field ini bisa di-hide */}

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