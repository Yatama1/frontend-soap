// src/components/member/MemberFormModal.jsx
import { useState, useEffect } from "react";
import axios from "axios";

// baseURL fleksibel, pastikan selalu berujung /api
const base = import.meta?.env?.VITE_API_URL || (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) || "http://localhost:5000";
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

export default function MemberFormModal({ onClose, onSaved, member }) {
  // jika prop member berisi id_member atau id -> edit mode
  const isEdit = !!(member && (member.id_member || member.id));

  // current user (pembuat)
  const currentUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const currentRole = (currentUser?.role || currentUser?.jabatan || "").toString().toLowerCase();
  const leaderId = currentUser?.id_member || currentUser?.id || null;

  const [leaders, setLeaders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    nama: member?.nama_member || member?.nama || "",
    email: member?.email || "",
    kontak: member?.kontak || "",
    jabatan: member?.jabatan || member?.role || "member",
    id_leader: member?.id_leader ?? member?.leader_id ?? "",
    password: "",
  });

  useEffect(() => {
    // sync when member prop changes (useful for edit)
    setFormData({
      nama: member?.nama_member || member?.nama || "",
      email: member?.email || "",
      kontak: member?.kontak || "",
      jabatan: member?.jabatan || member?.role || "member",
      id_leader: member?.id_leader ?? member?.leader_id ?? "",
      password: "",
    });
  }, [member]);

  useEffect(() => {
    // jika pembuat bukan leader, ambil daftar leader untuk select
    if (currentRole === "leader") return;

    let mounted = true;
    api.get("/member", { params: { jabatan: "leader" } })
      .then(res => {
        if (!mounted) return;
        // backend shape bisa bervariasi
        const d = res?.data;
        const list = Array.isArray(d) ? d : (Array.isArray(d?.members) ? d.members : (Array.isArray(d?.data) ? d.data : []));
        setLeaders(list);
      })
      .catch(err => {
        // fallback: coba plural /members
        api.get("/members", { params: { jabatan: "leader" } })
          .then(res2 => {
            if (!mounted) return;
            const d2 = res2?.data;
            const list2 = Array.isArray(d2) ? d2 : (Array.isArray(d2?.members) ? d2.members : (Array.isArray(d2?.data) ? d2.data : []));
            setLeaders(list2);
          })
          .catch(() => {
            console.warn("Gagal memuat leader (ignored):", err?.response?.data || err?.message);
          });
      });

    return () => { mounted = false; };
  }, [currentRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    if (!formData.nama?.trim()) return "Nama wajib diisi.";
    if (!formData.email?.trim()) return "Email wajib diisi.";
    if (!validateEmail(formData.email)) return "Format email tidak valid.";
    if (!isEdit && (!formData.password || formData.password.length < 6)) return "Password wajib (minimal 6 karakter).";
    if (isEdit && formData.password && formData.password.length < 6) return "Password minimal 6 karakter.";
    return null;
  };

  const tryPostWithPluralFallback = async (payload) => {
    try {
      return await api.post("/member", payload);
    } catch (err) {
      // jika 404 -> coba /members
      const status = err?.response?.status;
      if (status === 404) {
        return await api.post("/members", payload);
      }
      throw err;
    }
  };

  const tryPutWithPluralFallback = async (id, payload) => {
    try {
      return await api.put(`/member/${id}`, payload);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        return await api.put(`/members/${id}`, payload);
      }
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const v = validate();
    if (v) return setErrorMsg(v);

    setSaving(true);
    try {
      // build payload sesuai backend (nama, email, kontak, jabatan, id_leader, password)
      const payload = {
        nama: formData.nama,
        email: formData.email,
        kontak: formData.kontak || undefined,
        jabatan: formData.jabatan,
      };

      // password only when creating or when provided in edit
      if (!isEdit || (isEdit && formData.password && formData.password.trim())) {
        payload.password = formData.password;
      }

      // bila pembuat adalah leader, kita bantu set id_leader = leaderId (server juga seharusnya enforce)
      if (currentRole === "leader") {
        if (leaderId) payload.id_leader = leaderId;
      } else {
        // pembuat bukan leader: kirim id_leader jika dipilih (nullable)
        if (formData.id_leader) payload.id_leader = Number(formData.id_leader);
      }

      if (isEdit) {
        const id = member.id_member ?? member.id;
        await tryPutWithPluralFallback(id, payload);
      } else {
        await tryPostWithPluralFallback(payload);
      }

      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error("Gagal simpan member:", err);
      // tampilkan pesan server bila ada, kalau HTML tampilkan ringkas
      const data = err?.response?.data;
      let msg = "Terjadi kesalahan saat menyimpan.";
      if (data) {
        if (typeof data === "string") {
          // kadang server kirim HTML; ambil baris pertama
          msg = data.replace(/\s+/g, " ").slice(0, 300);
        } else if (data?.message) msg = data.message;
        else msg = JSON.stringify(data).slice(0, 300);
      } else if (err?.message) msg = err.message;
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h3 className="text-xl font-semibold mb-4">{isEdit ? "Edit Member" : "Tambah Leader"}</h3>

        {errorMsg && <div className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded break-words">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Nama</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Kontak</label>
            <input
              name="kontak"
              value={formData.kontak}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Jabatan</label>
            <select
              name="jabatan"
              value={formData.jabatan}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="member">Member</option>
              <option value="leader">Leader</option>
              <option value="senior_leader">Senior Leader</option>
            </select>
          </div>

          {/* pilih leader hanya kalau creator bukan leader dan jabatan = member */}
          {currentRole !== "leader" && formData.jabatan === "member" && (
            <div>
              <label className="block text-sm font-medium text-gray-600">Leader</label>
              <select
                name="id_leader"
                value={formData.id_leader ?? ""}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Tidak ada</option>
                {leaders.map((l) => (
                  <option key={l.id_member ?? l.id} value={l.id_member ?? l.id}>
                    {(l.nama || l.nama_member || l.name) + " — " + (l.jabatan || l.role)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password {isEdit ? "(kosongkan jika tidak ingin ubah)" : ""}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEdit ? "Kosongkan jika tidak ingin ganti" : ""}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 bg-gray-300 rounded-lg">
              Batal
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
