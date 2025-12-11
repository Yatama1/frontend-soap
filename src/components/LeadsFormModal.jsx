// FILE: src/components/LeadsFormModal.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import NotificationModal from "./NotificationModal"; // Pastikan file ini ada satu folder dengan file ini

// --- 1. KONFIGURASI API MANDIRI (Supaya tidak error import) ---
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

// --- 2. FITUR BONGKAR TOKEN (Agar ID Member Otomatis Masuk) ---
function getIdFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    // Decode Token JWT
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    const decoded = JSON.parse(jsonPayload);
    // Ambil ID dari token (bisa id, id_member, atau userId)
    return decoded.id || decoded.id_member || decoded.userId || null;
  } catch (e) {
    console.error("Gagal baca token:", e);
    return null;
  }
}

// Helper Format Tanggal
function formatDateForInput(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function LeadsFormModal({ onClose, onSaved, cabuy }) {
  const isEdit = !!(cabuy && (cabuy.id_cabuy || cabuy.id));

  // --- 3. AMBIL ID USER ---
  const currentUserId = (() => {
    // Coba ambil dari localStorage dulu
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const p = JSON.parse(raw);
        const id = p.id_member || p.id || p.user?.id || p.user?.id_member;
        if (id) return id;
      }
    } catch {}
    // Kalau gagal, ambil paksa dari token
    return getIdFromToken();
  })();

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    nama_cabuy: cabuy?.nama_cabuy || "",
    kontak: cabuy?.kontak || "",
    status: cabuy?.status || "Baru",
    // Default tanggal masuk hari ini jika kosong
    tanggal_masuk: cabuy?.tanggal_masuk ? formatDateForInput(cabuy.tanggal_masuk) : new Date().toISOString().split('T')[0],
    tanggal_follow_up: cabuy?.tanggal_follow_up ? formatDateForInput(cabuy.tanggal_follow_up) : "",
  });

  useEffect(() => {
    if (cabuy) {
      setFormData({
        nama_cabuy: cabuy.nama_cabuy || "",
        kontak: cabuy.kontak || "",
        status: cabuy.status || "Baru",
        tanggal_masuk: cabuy.tanggal_masuk ? formatDateForInput(cabuy.tanggal_masuk) : new Date().toISOString().split('T')[0],
        tanggal_follow_up: cabuy.tanggal_follow_up ? formatDateForInput(cabuy.tanggal_follow_up) : "",
      });
    }
  }, [cabuy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.nama_cabuy?.trim()) return setErrorMsg("Nama wajib diisi.");
    if (!formData.kontak?.trim()) return setErrorMsg("Kontak wajib diisi.");

    setSaving(true);
    try {
      const payload = {
        nama_cabuy: formData.nama_cabuy,
        kontak: formData.kontak,
        status: formData.status,
        // Kirim null jika string kosong (PENTING AGAR TIDAK ERROR DATABASE)
        tanggal_masuk: formData.tanggal_masuk || null,
        tanggal_follow_up: formData.tanggal_follow_up || null,
      };

      // INJECT ID MEMBER
      if (currentUserId) {
        payload.id_member = Number(currentUserId);
      } else {
        console.warn("ID Member tidak ditemukan di Frontend, mengandalkan Backend...");
      }

      console.log("Mengirim Payload:", payload);

      if (isEdit) {
        const id = cabuy.id_cabuy ?? cabuy.id;
        await api.put(`/cabuy/${id}`, payload); // Pastikan endpoint backend plural/singular sesuai (/cabuy)
        setNotif({ show: true, message: "Berhasil diperbarui!", type: "success" });
      } else {
        await api.post("/cabuy", payload);
        setNotif({ show: true, message: "Berhasil ditambahkan!", type: "success" });
      }

      onSaved && onSaved();
      setTimeout(() => {
        setNotif({ show: false });
        onClose && onClose();
      }, 1000);

    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || "Gagal menyimpan data.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {isEdit ? "Edit Leads" : "Input Leads Baru"}
          </h3>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Nama Calon Pembeli</label>
              <input 
                name="nama_cabuy" 
                value={formData.nama_cabuy} 
                onChange={handleChange} 
                className="w-full border p-2 rounded mt-1"
                placeholder="Contoh: Bpk. Sinar"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">No. WhatsApp</label>
              <input 
                name="kontak" 
                value={formData.kontak} 
                onChange={handleChange} 
                className="w-full border p-2 rounded mt-1"
                placeholder="08xxxxxxxx"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Tgl Masuk</label>
                <input type="date" name="tanggal_masuk" value={formData.tanggal_masuk} onChange={handleChange} className="w-full border p-2 rounded mt-1"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Jadwal Follow Up</label>
                <input type="date" name="tanggal_follow_up" value={formData.tanggal_follow_up} onChange={handleChange} className="w-full border p-2 rounded mt-1"/>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border p-2 rounded mt-1 bg-white">
                <option value="Baru">Baru</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Siap Survey">Siap Survey</option>
                <option value="Booking">Booking</option>
                <option value="Closing">Closing</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                {saving ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <NotificationModal 
        show={notif.show} 
        message={notif.message} 
        type={notif.type} 
        onClose={() => setNotif({...notif, show: false})} 
      />
    </>
  );
}