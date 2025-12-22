import { useState, useEffect } from "react";
import axios from "axios";

// --- KONFIGURASI AXIOS ---
const base = import.meta?.env?.VITE_API_URL || "http://localhost:5000";
const baseURL = base.endsWith("/api") ? base : `${base.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL,
  // PENTING: Gunakan multipart/form-data karena ada upload file (image)
  
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Modal untuk tambah / edit Rumah
 * props:
 * - editData : object data rumah (jika edit), atau null (jika tambah)
 * - onClose  : function()
 * - onSaved  : function()
 */
export default function RumahFormModal({ editData, onClose, onSaved }) {
  // Deteksi mode edit berdasarkan keberadaan ID (sesuaikan nama ID dari database, misal id_rumah atau id)
  const isEdit = !!(editData && (editData.id_rumah || editData.id));

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [propertiList, setPropertiList] = useState([]); // Data dropdown

  const [form, setForm] = useState({
    id_properti: "",
    tipe: "",
    lb: "",
    lt: "",
    jml_kamar: "",
    jml_lantai: "",
    harga: "",
    unit: "",
    image: null, // File baru (biarkan null jika tidak diubah saat edit)
  });

  // 1. Ambil data properti untuk dropdown saat komponen dimuat
  useEffect(() => {
    api.get("/properti")
      .then((res) => setPropertiList(res.data.data || []))
      .catch((err) => console.error("Gagal ambil properti:", err));
  }, []);

  // 2. Sync data ke Form saat masuk mode edit (Adaptasi dari SeniorFormModal)
  useEffect(() => {
    if (editData) {
      setForm({
        id_properti: editData.id_properti || "",
        tipe: editData.tipe || "",
        lb: editData.lb || "",
        lt: editData.lt || "",
        jml_kamar: editData.jml_kamar || "",
        jml_lantai: editData.jml_lantai || "",
        harga: editData.harga || "",
        unit: editData.unit || "",
        image: null, // Gambar tidak di-load ke input type="file"
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validasi sederhana
    if (!form.id_properti) return setErrorMsg("Pilih properti terlebih dahulu.");
    if (!form.tipe) return setErrorMsg("Tipe rumah wajib diisi.");
    if (!form.unit) return setErrorMsg("Jumlah unit wajib diisi.");

    setSaving(true);
    try {
      // Gunakan FormData untuk kirim file + text
      const fd = new FormData();
      
      // Masukkan semua data form ke FormData
      Object.keys(form).forEach((key) => {
        // Jangan kirim image jika null (user tidak upload foto baru saat edit)
        if (key === "image" && !form.image) return;
        // Jangan kirim nilai null/undefined
        if (form[key] !== null && form[key] !== undefined) {
          fd.append(key, form[key]);
        }
      });

      if (isEdit) {
        // Ambil ID yang benar (sesuaikan dengan database kamu: id_rumah atau id)
        const id = editData.id_rumah || editData.id; 
        await api.put(`/rumah/${id}`, fd);
      } else {
        await api.post("/rumah", fd);
      }

      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error("Gagal simpan rumah:", err);
      const msg = err?.response?.data?.message || err.message || "Gagal menyimpan data.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">
          {isEdit ? "Edit Rumah" : "Tambah Rumah"}
        </h3>

        {errorMsg && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Dropdown Properti */}
          <div>
            <label className="text-sm font-medium text-gray-700">Properti</label>
            <select
              name="id_properti"
              value={form.id_properti}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            >
              <option value="">-- Pilih Properti --</option>
              {propertiList.map((p) => (
                <option key={p.id_properti} value={p.id_properti}>
                  {p.nama_properti}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              name="tipe"
              value={form.tipe}
              onChange={handleChange}
              placeholder="Tipe (contoh: 36/60)"
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              name="lb"
              value={form.lb}
              onChange={handleChange}
              placeholder="Luas Bangunan (LB)"
              className="w-full border p-2 rounded"
            />
            <input
              name="lt"
              value={form.lt}
              onChange={handleChange}
              placeholder="Luas Tanah (LT)"
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              name="jml_kamar"
              value={form.jml_kamar}
              onChange={handleChange}
              placeholder="Jml Kamar"
              className="w-full border p-2 rounded"
            />
            <input
              name="jml_lantai"
              value={form.jml_lantai}
              onChange={handleChange}
              placeholder="Jml Lantai"
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <input
              name="harga"
              type="number"
              value={form.harga}
              onChange={handleChange}
              placeholder="Harga (Rp)"
              className="w-full border p-2 rounded"
            />
             <input
              name="unit"
              type="number"
              value={form.unit}
              onChange={handleChange}
              placeholder="Stok Unit"
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Upload File */}
          <div className="border p-3 rounded bg-gray-50">
            <span className="block text-sm text-gray-600 mb-1">Gambar Rumah {isEdit && "(Biarkan kosong jika tidak ganti)"}</span>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              className="w-full text-sm"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border p-2 rounded hover:bg-gray-50 text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}