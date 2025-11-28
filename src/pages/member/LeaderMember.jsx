// src/pages/member/LeaderMember.jsx
import { useEffect, useState } from "react";
import api from "../../api/apiClient";

export default function LeaderMember() {
  const [data, setData] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchForwarded();
    fetchLeaders();
  }, []);

  // Ambil leads yang dimiliki member ini
  async function fetchForwarded() {
    try {
      const res = await api.get(`/api/leads/forwarded?member_id=${user.id}`);
      console.log("DATA FORWARDED:", res.data);
      setData(res.data || []);
    } catch (err) {
      console.error(err);
      setData([]);
    }
  }

  // Ambil daftar leader untuk dipilih
  async function fetchLeaders() {
    try {
      const res = await api.get("/member?role=Leader");
      setLeaders(res.data || []);
    } catch (err) {
      console.error("Gagal ambil leader:", err);
      setLeaders([]);
    }
  }

  // Klik tombol teruskan → buka modal
  const openForwardModal = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  // Kirim ke backend
  async function handleForward() {
    if (!selectedLead || !selectedLead.id_cabuy) {
      alert("ID lead tidak ditemukan");
      return;
    }
    if (!selectedLead.forward_to) {
      alert("Pilih leader terlebih dahulu");
      return;
    }

    try {
      await api.post("/api/leads/forward", {
        id_cabuy: selectedLead.id_cabuy,
        forward_to: selectedLead.forward_to,
        from_member: user.id,
      });

      alert("Berhasil diteruskan ke Leader!");
      setShowModal(false);
      fetchForwarded();
    } catch (err) {
      console.error(err);
      alert("Gagal meneruskan lead");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leads yang Diteruskan</h1>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Properti</th>
              <th className="p-3 text-left">Leader</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  Belum ada leads
                </td>
              </tr>
            ) : (
              data.map((d) => (
                <tr key={d.id_cabuy}>
                  <td className="p-3">{d.nama}</td>
                  <td className="p-3">{d.property_name}</td>
                  <td className="p-3">{d.leader || "-"}</td>
                  <td className="p-3">{d.status}</td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => openForwardModal(d)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Teruskan
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL PILIH LEADER */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Teruskan Lead ke Leader</h2>

            <p className="mb-3 text-gray-700">
              Lead: <b>{selectedLead?.nama}</b>
            </p>

            <label className="block text-sm font-medium text-gray-600 mb-1">
              Pilih Leader
            </label>

            <select
              className="w-full border p-2 rounded-lg mb-4"
              value={selectedLead?.forward_to || ""}
              onChange={(e) =>
                setSelectedLead((prev) => ({
                  ...prev,
                  forward_to: e.target.value,
                }))
              }
            >
              <option value="">— Pilih Leader —</option>
              {leaders.map((l) => (
                <option key={l.id_member} value={l.id_member}>
                  {l.nama_member}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleForward}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
