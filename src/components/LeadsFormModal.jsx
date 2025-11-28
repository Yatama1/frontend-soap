import { useState, useEffect } from "react";
import api from "../api/apiClient";
import NotificationModal from "./NotificationModal";

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
  const [formData, setFormData] = useState({
    nama_cabuy: cabuy?.nama_cabuy || "",
    kontak: cabuy?.kontak || "",
    tanggal_follow_up: cabuy?.tanggal_follow_up ? formatDateForInput(cabuy.tanggal_follow_up) : "",
    tanggal_masuk: cabuy?.tanggal_masuk ? formatDateForInput(cabuy.tanggal_masuk) : "",
    status: cabuy?.status || "Baru",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  // Ambil member dari localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const id_member = currentUser?.id_member || currentUser?.id || null;

  useEffect(() => {
    if (!id_member) {
      console.warn("⚠️ Tidak ada id_member di localStorage. Pastikan login menyimpan user!");
    }
  }, [id_member]);

  useEffect(() => {
    // saat cabuy berubah (ketika edit dibuka), sync form
    setFormData({
      nama_cabuy: cabuy?.nama_cabuy || "",
      kontak: cabuy?.kontak || "",
      tanggal_follow_up: cabuy?.tanggal_follow_up ? formatDateForInput(cabuy.tanggal_follow_up) : "",
      tanggal_masuk: cabuy?.tanggal_masuk ? formatDateForInput(cabuy.tanggal_masuk) : "",
      status: cabuy?.status || "Baru",
    });
  }, [cabuy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.nama_cabuy || !formData.kontak) {
      setErrorMsg("Nama dan Kontak wajib diisi.");
      return;
    }

    if (!id_member) {
      setErrorMsg("ID Member tidak ditemukan. Harap login ulang!");
      return;
    }

    const payload = {
      id_member,
      nama_cabuy: formData.nama_cabuy,
      kontak: formData.kontak,
      status: formData.status || "Baru",
      tanggal_follow_up: formData.tanggal_follow_up || null,
      tanggal_masuk: formData.tanggal_masuk || null,
    };

    setSubmitting(true);
    try {
      if (cabuy) {
        const id = cabuy.id_cabuy ?? cabuy.id;
        if (!id) throw new Error("ID leads tidak tersedia untuk operasi edit.");
        await api.put(`/cabuy/${id}`, payload);
        setNotif({ show: true, message: "✅ Leads berhasil diperbarui!", type: "success" });
      } else {
        await api.post("/cabuy", payload);
        setNotif({ show: true, message: "✅ Leads berhasil ditambahkan!", type: "success" });
      }

      // panggil callback dari parent untuk refresh
      onSaved?.();
      setTimeout(() => {
        setNotif({ show: false });
        onClose?.();
      }, 1100);
    } catch (err) {
      console.error("Gagal menyimpan data leads:", err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || null;
      setNotif({
        show: true,
        message: serverMsg || "❌ Terjadi kesalahan saat menyimpan!",
        type: "error",
      });
      setTimeout(() => setNotif({ show: false }), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Modal utama form */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-40">
        <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 text-gray-200">
          <h3 className="text-2xl font-bold mb-6 text-center text-red-500">
            {cabuy ? "Edit Leads" : "Tambah Leads"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Nama Leads</label>
              <input
                name="nama_cabuy"
                value={formData.nama_cabuy}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Kontak</label>
              <input
                name="kontak"
                value={formData.kontak}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Tanggal Follow Up</label>
                <input
                  type="date"
                  name="tanggal_follow_up"
                  value={formData.tanggal_follow_up || ""}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Tanggal Masuk</label>
                <input
                  type="date"
                  name="tanggal_masuk"
                  value={formData.tanggal_masuk || ""}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
              >
                <option value="Baru">Baru</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Survey">Survey</option>
                <option value="Closing">Closing</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {errorMsg && <div className="text-sm text-red-500 font-medium">{errorMsg}</div>}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-gray-800 border border-gray-700"
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Notifikasi */}
      <NotificationModal
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ show: false })}
      />
    </>
  );
}
