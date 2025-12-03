// src/pages/senior/MemberLeader.jsx
// Menampilkan daftar leader (yang senior lihat) dan menampilkan member setiap leader
// Menggunakan endpoint backend: GET /members?role=leader  (untuk daftar leader)
// dan GET /members?leaderId=<id>  (untuk ambil member bawahan)

import React, { useEffect, useState } from "react";
import { Users, Search, RefreshCw } from "lucide-react";
import api from "../../api/apiClient";

export default function MemberLeader() {
  const [leaders, setLeaders] = useState([]);
  const [expandedLeaderId, setExpandedLeaderId] = useState(null);
  const [membersByLeader, setMembersByLeader] = useState({});
  const [loadingLeaders, setLoadingLeaders] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ambil daftar leader (server di projectmu mengembalikan leader lewat /members?role=leader)
  async function fetchLeaders() {
    setLoadingLeaders(true);
    setError("");
    try {
      const res = await api.get("/members?role=leader");
      // response bisa { members: [...] } atau langsung array
      const raw = res.data?.members ?? res.data ?? [];
      const normalized = (raw || []).map(i => ({
        id_member: i.id_member ?? i.id ?? i._id,
        name: i.nama ?? i.name ?? i.fullname ?? "-",
        email: i.email ?? "-",
        raw: i
      }));
      setLeaders(normalized);
    } catch (err) {
      console.error("fetchLeaders:", err?.response?.data ?? err);
      setError("Gagal memuat daftar leader. Cek backend atau token.");
      setLeaders([]);
    } finally {
      setLoadingLeaders(false);
    }
  }

  // Tampilkan members khusus untuk leader tertentu menggunakan query param leaderId
  async function fetchMembersForLeader(leader) {
    const lid = leader.id_member ?? leader.id ?? leader.raw?.id_member ?? leader.raw?.id;
    if (!lid) return;
    const key = String(lid);

    // jika sudah ada cache, pakai itu
    if (membersByLeader[key]) return;

    setLoadingMembers(prev => ({ ...prev, [key]: true }));
    setError("");

    try {
      // PANGGIL endpoint yang sekarang didukung backend
      const res = await api.get(`/members?leaderId=${key}`);
      // server expected: { members: [...] } atau [...]
      const raw = res.data?.members ?? res.data ?? [];
      // Normalisasi members
      const normalized = (raw || [])
        .filter(m => {
          // pastikan bukan leader record by accident (cek jabatan)
          const jab = (m.jabatan ?? m.role ?? "").toString().toLowerCase();
          if (jab.includes("leader")) return false;
          // best-effort: if item has id_leader or leaderId, ensure it matches; otherwise include (server should filter)
          if (m.id_leader !== undefined || m.leaderId !== undefined || m.leader_id !== undefined) {
            return (
              Number(m.id_leader ?? m.leaderId ?? m.leader_id ?? -1) === Number(key)
            );
          }
          return true;
        })
        .map(m => ({
          id: m.id_member ?? m.id ?? m._id,
          name: m.nama ?? m.name ?? m.fullname ?? "-",
          email: m.email ?? "-",
          phone: m.kontak ?? m.phone ?? m.no_hp ?? "-",
          status: m.status ?? (m.is_active ? "active" : "inactive") ?? "active",
          raw: m
        }));

      setMembersByLeader(prev => ({ ...prev, [key]: normalized }));
    } catch (err) {
      console.error("fetchMembersForLeader:", err?.response?.data ?? err);
      // fallback: coba ambil semua members lalu filter client-side (safety)
      try {
        const resAll = await api.get("/members");
        const all = resAll.data?.members ?? resAll.data ?? [];
        const filtered = (all || [])
          .filter(m => Number(m.id_leader ?? m.leaderId ?? m.leader_id ?? -1) === Number(key))
          .map(m => ({
            id: m.id_member ?? m.id ?? m._id,
            name: m.nama ?? m.name ?? m.fullname ?? "-",
            email: m.email ?? "-",
            phone: m.kontak ?? m.phone ?? m.no_hp ?? "-",
            status: m.status ?? (m.is_active ? "active" : "inactive") ?? "active",
            raw: m
          }));
        setMembersByLeader(prev => ({ ...prev, [key]: filtered }));
      } catch (err2) {
        console.error("fallback fetch all members failed:", err2?.response?.data ?? err2);
        setMembersByLeader(prev => ({ ...prev, [key]: [] }));
        setError("Gagal memuat member untuk leader ini.");
      }
    } finally {
      setLoadingMembers(prev => ({ ...prev, [key]: false }));
    }
  }

  function toggleExpand(leader) {
    const lid = leader.id_member ?? leader.id ?? leader.raw?.id_member ?? leader.raw?.id;
    if (!lid) return;
    const key = String(lid);
    if (expandedLeaderId === key) {
      setExpandedLeaderId(null);
      return;
    }
    setExpandedLeaderId(key);
    fetchMembersForLeader(leader);
  }

  const filteredLeaders = leaders.filter(l =>
    (l.name || "").toLowerCase().includes(query.toLowerCase()) ||
    (l.email || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Member per Leader</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded px-2 py-1">
            <Search className="h-4 w-4 mr-2" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari leader atau email..."
              className="outline-none bg-transparent text-sm"
            />
          </div>

          <button
            onClick={() => { fetchLeaders(); setMembersByLeader({}); setExpandedLeaderId(null); }}
            className="flex items-center gap-2 border px-3 py-1 rounded hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {loadingLeaders ? (
        <div>Loading leaders...</div>
      ) : (
        <div className="space-y-4">
          {filteredLeaders.length === 0 ? (
            <div className="text-sm text-gray-500">Tidak ada leader ditemukan.</div>
          ) : (
            filteredLeaders.map(leader => {
              const lid = String(leader.id_member ?? leader.id ?? leader.raw?.id_member ?? leader.raw?.id);
              return (
                <div className="border rounded-lg p-4" key={lid}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-medium">{leader.name}</div>
                      {leader.email && <div className="text-sm text-gray-500">{leader.email}</div>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(leader)}
                        className="px-3 py-1 border rounded text-sm"
                      >
                        {expandedLeaderId === lid ? "Sembunyikan" : "Tampilkan Member"}
                      </button>
                    </div>
                  </div>

                  {expandedLeaderId === lid && (
                    <div className="mt-4">
                      {loadingMembers[lid] ? (
                        <div>Loading members...</div>
                      ) : (
                        <MembersTable members={membersByLeader[lid] || []} />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function MembersTable({ members }) {
  if (!members || members.length === 0) {
    return <div className="text-sm text-gray-500">Belum ada member.</div>;
  }

  return (
    <div className="overflow-x-auto mt-2">
      <table className="min-w-full text-sm table-auto">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 px-3">#</th>
            <th className="py-2 px-3">Nama</th>
            <th className="py-2 px-3">Email</th>
            <th className="py-2 px-3">Phone</th>
            <th className="py-2 px-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, idx) => (
            <tr key={m.id ?? idx} className="border-b hover:bg-gray-50">
              <td className="py-2 px-3">{idx + 1}</td>
              <td className="py-2 px-3 font-medium">{m.name}</td>
              <td className="py-2 px-3">{m.email}</td>
              <td className="py-2 px-3">{m.phone}</td>
              <td className="py-2 px-3">{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
