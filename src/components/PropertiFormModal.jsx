import { useState, useEffect } from "react";
import axios from "axios";

/* ================= AXIOS CONFIG ================= */
const base = import.meta?.env?.VITE_API_URL || "http://localhost:5000";
const baseURL = base.endsWith("/api")
  ? base
  : `${base.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ================= COMPONENT ================= */
export default function PropertiFormModal({
  initialData = null,
  onClose,
  onSaved,
}) {
  const isEdit = !!initialData;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ================= STATE ================= */
  const [form, setForm] = useState({
    nama_properti: "",
    deskripsi: "",
    lokasi: "",
    kontraktor: "",
    kontak_kontraktor: "",
    id_member: "",
  });

  const [image, setImage] = useState(null); // ✅ STATE GAMBAR
  const [seniorList, setSeniorList] = useState([]);

  /* ================= PREFILL EDIT ================= */
  useEffect(() => {
    if (isEdit) {
      setForm({
        nama_properti: initialData.nama_properti || "",
        deskripsi: initialData.deskripsi || "",
        lokasi: initialData.lokasi || "",
        kontraktor: initialData.kontraktor || "",
        kontak_kontraktor: initialData.kontak_kontraktor || "",
        id_member:
          initialData.id_member ||
          initialData.owner_senior?.id_member ||
          "",
      });
    }
  }, [initialData, isEdit]);

  /* ================= LOAD SENIOR ================= */
  useEffect(() => {
    const loadSeniors = async () => {
      try {
        const res = await api.get("/members");
        const arr = res?.data?.members ?? [];
        setSeniorList(
          arr.filter(
            (x) =>
              x.jabatan === "senior_leader" || x.role === "senior_leader"
          )
        );
      } catch (err) {
        console.warn("Gagal load senior list:", err);
      }
    };
    loadSeniors();
  }, []);

  /* ================= HANDLER ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImage(file); // ✅ SIMPAN FILE
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nama_properti.trim())
      return setError("Nama properti wajib diisi");

    if (!form.kontak_kontraktor.trim())
      return setError("Kontak kontraktor wajib diisi");

    setSaving(true);
    try {
      // ✅ PAKAI FormData
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      if (image) fd.append("image", image); // ⬅️ sesuai field DB: image

      if (isEdit) {
        await api.put(`/properti/${initialData.id_properti}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/properti", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSaved && onSaved();
    } catch (err) {
      console.error("Properti save error:", err);
      setError(err?.response?.data?.message || "Gagal menyimpan properti");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Edit Properti" : "Tambah Properti"}
        </h3>

        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="nama_properti"
            value={form.nama_properti}
            onChange={handleChange}
            placeholder="Nama Properti"
            className="w-full border p-2 rounded"
          />

          <textarea
            name="deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
            placeholder="Deskripsi Properti"
            className="w-full border p-2 rounded"
            rows={3}
          />

          <input
            name="lokasi"
            value={form.lokasi}
            onChange={handleChange}
            placeholder="Lokasi"
            className="w-full border p-2 rounded"
          />

          <input
            name="kontraktor"
            value={form.kontraktor}
            onChange={handleChange}
            placeholder="Nama Kontraktor"
            className="w-full border p-2 rounded"
          />

          <input
            name="kontak_kontraktor"
            value={form.kontak_kontraktor}
            onChange={handleChange}
            placeholder="Kontak Kontraktor (WA / HP)"
            className="w-full border p-2 rounded"
          />

          {/* ✅ INPUT GAMBAR (tanpa ubah style UI) */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border p-2 rounded"
          />
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border rounded"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
