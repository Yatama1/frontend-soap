import React, { useEffect, useState } from "react";
import { 
  Users, Search, RefreshCw, ChevronDown, 
  ChevronUp, Mail, Phone, Shield, User,
  Briefcase
} from "lucide-react";
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

  // --- FETCH LEADERS ---
  async function fetchLeaders() {
    setLoadingLeaders(true);
    setError("");
    try {
      const res = await api.get("/members?role=leader");
      const raw = res.data?.members ?? res.data ?? [];
      const normalized = (raw || []).map(i => ({
        id_member: i.id_member ?? i.id ?? i._id,
        name: i.nama ?? i.name ?? i.fullname ?? "-",
        email: i.email ?? "-",
        raw: i
      }));
      setLeaders(normalized);
    } catch (err) {
      console.error("fetchLeaders:", err);
      setError("Gagal memuat daftar leader.");
      setLeaders([]);
    } finally {
      setLoadingLeaders(false);
    }
  }

  // --- FETCH MEMBERS PER LEADER ---
  async function fetchMembersForLeader(leader) {
    const lid = leader.id_member ?? leader.id ?? leader.raw?.id_member ?? leader.raw?.id;
    if (!lid) return;
    const key = String(lid);

    if (membersByLeader[key]) return; // Cache check

    setLoadingMembers(prev => ({ ...prev, [key]: true }));
    setError("");

    try {
      console.log("🔍 Sedang mencari member untuk Leader ID:", key);

      // TRIK: Kita ambil SEMUA member saja (aman untuk data < 1000)
      // Karena kita tidak yakin backend support filter ?leaderId=...
      const res = await api.get("/members"); 
      
      const rawAll = res.data?.members ?? res.data ?? [];
      console.log("📦 Total data member dari API:", rawAll.length);

      // FILTER MANUAL DI SINI (Jauh lebih akurat)
      const normalized = rawAll
        .filter(m => {
          // 1. Cek ID Leader dari berbagai kemungkinan nama field
          const memberLeaderId = m.id_leader ?? m.leader_id ?? m.leaderId;
          
          // 2. Bandingkan (Pastikan keduanya jadi String atau Number agar tidak error tipe data)
          const isMatch = Number(memberLeaderId) === Number(key);
          
          // Debugging: Muncul di Inspect Element jika kamu penasaran
          // if (isMatch) console.log("✅ Ketemu anak buah:", m.nama);
          
          return isMatch;
        })
        .map(m => ({
          id: m.id_member ?? m.id ?? m._id,
          name: m.nama ?? m.name ?? m.fullname ?? "-",
          email: m.email ?? "-",
          phone: m.kontak ?? m.phone ?? m.no_hp ?? "-",
          status: m.status ?? (m.is_active ? "active" : "inactive") ?? "active",
          raw: m
        }));

      console.log(`✨ Ditemukan ${normalized.length} member untuk Leader ${leader.name}`);
      setMembersByLeader(prev => ({ ...prev, [key]: normalized }));

    } catch (err) {
      console.error("fetchMembersForLeader Error:", err);
      // Tetap set empty array agar loading spinner berhenti
      setMembersByLeader(prev => ({ ...prev, [key]: [] }));
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
    } else {
      setExpandedLeaderId(key);
      fetchMembersForLeader(leader);
    }
  }

  const filteredLeaders = leaders.filter(l =>
    (l.name || "").toLowerCase().includes(query.toLowerCase()) ||
    (l.email || "").toLowerCase().includes(query.toLowerCase())
  );

  // --- SKELETON LOADING ---
  if (loadingLeaders) return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>)}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-indigo-600" /> Struktur Tim Leader
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Lihat hierarki leader dan daftar member di bawah naungan mereka.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari leader..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm shadow-sm"
            />
          </div>
          <button
            onClick={() => { fetchLeaders(); setMembersByLeader({}); setExpandedLeaderId(null); }}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
           <span>⚠️ {error}</span>
        </div>
      )}

      {/* LEADERS LIST */}
      <div className="space-y-4">
        {filteredLeaders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
             <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 font-medium">Tidak ada leader yang ditemukan.</p>
          </div>
        ) : (
          filteredLeaders.map(leader => {
            const lid = String(leader.id_member ?? leader.id ?? leader.raw?.id_member ?? leader.raw?.id);
            const isExpanded = expandedLeaderId === lid;
            const initial = (leader.name || "U").charAt(0).toUpperCase();

            return (
              <div 
                key={lid} 
                className={`bg-white border transition-all duration-300 rounded-xl overflow-hidden ${
                  isExpanded ? "border-indigo-200 shadow-md ring-1 ring-indigo-50" : "border-gray-200 hover:border-indigo-200"
                }`}
              >
                {/* CARD HEADER (LEADER INFO) */}
                <div 
                  onClick={() => toggleExpand(leader)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg shadow-sm">
                      {initial}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{leader.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="h-3 w-3" /> {leader.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                        Leader
                     </span>
                     <div className={`p-1 rounded-full transition-transform duration-300 ${isExpanded ? "rotate-180 bg-gray-100" : ""}`}>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                     </div>
                  </div>
                </div>

                {/* CARD BODY (MEMBER LIST) */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/30 p-4 sm:p-6 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                       <Briefcase className="h-4 w-4 text-indigo-500" /> 
                       Daftar Anggota Tim (Members)
                    </div>

                    {loadingMembers[lid] ? (
                       <div className="space-y-2">
                          {[1,2].map(i => <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>)}
                       </div>
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
    </div>
  );
}

// SUB-COMPONENT: MEMBER TABLE
function MembersTable({ members }) {
  if (!members || members.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-6 text-gray-400 bg-white rounded-xl border border-gray-100">
            <User className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Belum ada member di bawah leader ini.</p>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4">Nama Member</th>
              <th className="py-3 px-4">Kontak</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m, idx) => {
               const isActive = m.status === 'active';
               return (
                <tr key={m.id ?? idx} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-400 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4">
                     <div className="font-semibold text-gray-700">{m.name}</div>
                     <div className="text-xs text-gray-500">{m.email}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                     <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-400" /> {m.phone}
                     </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      isActive 
                        ? "bg-green-50 text-green-700 border-green-100" 
                        : "bg-red-50 text-red-600 border-red-100"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {isActive ? "Aktif" : "Non-Aktif"}
                    </span>
                  </td>
                </tr>
               );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}