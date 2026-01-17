// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login"; // <-- halaman login tunggal
import ProtectedRoute from "./middleware/ProtectedRoute";
import PropertiDetail from "./pages/PropertiDetail";
import RumahDetail from "./pages/RumahDetail";

/* Admin */
import AdminDashboard from "./pages/admin/DashboardAdmin";
import LayoutAdmin from "./layouts/AdminLayout";
import Senior from "./pages/admin/Senior";
import MemberList from "./pages/admin/MemberList";
import LeaderAdmin from "./pages/admin/Leader";
import CabuyList from "./pages/admin/CabuyList";
import PropertiAdmin from "./pages/admin/PropertiAdmin";
import RumahAdmin from "./pages/admin/RumahAdmin";
import Survey from "./pages/admin/Survey";
import CrmAdmin from "./pages/admin/CrmAdmin";
import KinerjaMemberAdmin from "./pages/admin/KinerjaMemberAdmin";
import SettingsSystem from "./pages/admin/SettingsSystem";

/* Leader */
import LeaderDashboard from "./pages/leader/DashboardLeader";
import LayoutLeader from "./layouts/LayoutLeader";
import LeaderMembers from "./pages/leader/LeaderMembers";
import LeaderLeads from "./pages/leader/LeaderLeads";
import SurveyLeader from "./pages/leader/SurveyLeader";
import RumahList from "./pages/leader/RumahListLeader";
import AgentHouses from "./pages/leader/AgentCreate";


/* Senior Leader */
import SeniorDashboard from "./pages/senior/DashboardSenior";
import LayoutSenior from "./layouts/LayoutSenior";
import Leader from "./pages/senior/Leader";
import MemberLeader from "./pages/senior/MemberLeader";
import SurveySenior from "./pages/admin/Survey";
import LaporanSurveySenior from "./pages/senior/CrmValidation";
import CabuyFollowUp from "./pages/senior/CabuyFollowUp";

/* Member */
import MemberDashboard from "./pages/member/DashboardMember";
import MemberProfile from "./pages/member/MemberProfile";
import LayoutMember from "./layouts/LayoutMember";
import LeadsMember from "./pages/member/LeadsMember";
import PropertiSaya from "./pages/member/PropertiSaya";
import LeaderMember from "./pages/member/LeaderMember";

/* AuthProvider (AuthContext) */
import { AuthProvider } from "./middleware/AuthProvider";

export default function App() {
  return (
    // Bungkus seluruh Routes dengan AuthProvider agar context tersedia untuk ProtectedRoute & komponen lain
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* redirect old login paths to unified login */}
        <Route path="/login-admin" element={<Navigate to="/login" replace />} />
        <Route path="/login-member" element={<Navigate to="/login" replace />} />

        {/* Unauthorized (tetap ada sesuai struktur Anda) */}
        <Route
          path="/unauthorized"
          element={
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">403 — Akses ditolak</h2>
              <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            </div>
          }
        />

        {/* --- Admin --- */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<LayoutAdmin />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/senior" element={<Senior />} />
            <Route path="/admin/leader" element={<LeaderAdmin />} />
            <Route path="/admin/members" element={<MemberList />} />
            <Route path="/admin/cabuy" element={<CabuyList />} />
            <Route path="/admin/PropertiAdmin" element={<PropertiAdmin />} />
            <Route path="/admin/rumah" element={<RumahAdmin />} />
            <Route path="/admin/survey" element={<Survey />} />
            <Route path="/admin/crm" element={<CrmAdmin />} />
            <Route path="/admin/kinerja-member" element={<KinerjaMemberAdmin />} />
            <Route path="/admin/settings" element={<SettingsSystem />} />

          </Route>
        </Route>

        {/* --- Senior Leader --- */}
        <Route element={<ProtectedRoute allowedRoles={["senior leader"]} />}>
          <Route element={<LayoutSenior />}>
            <Route path="/senior/dashboard" element={<SeniorDashboard />} />
            <Route path="/senior/leader" element={<Leader />} />
            <Route path="/senior/survey-senior" element={<SurveySenior />} />
            <Route path="/senior/laporan-survey-senior" element={<LaporanSurveySenior />} />
            <Route path="/senior/member-leader" element={<MemberLeader />} />
            <Route path="/senior/cabuy-followup" element={<CabuyFollowUp />} />
          </Route>
        </Route>

        {/* --- Leader --- */}
        <Route element={<ProtectedRoute allowedRoles={["leader"]} />}>
          <Route element={<LayoutLeader />}>
            <Route path="/leader/dashboard" element={<LeaderDashboard />} />
            <Route path="/leader/members" element={<LeaderMembers />} />
            <Route path="/leader/leads" element={<LeaderLeads />} />
            <Route path="/leader/jadwal-survey" element={<SurveyLeader />} />
            <Route path="/leader/rumah-list" element={<RumahList />} />
            <Route path="/leader/agent-houses" element={<AgentHouses />} />
          </Route>
        </Route>

        {/* --- Member --- */}
        <Route element={<ProtectedRoute allowedRoles={["member"]} />}>
          <Route element={<LayoutMember />}>
            <Route path="/member/dashboard" element={<MemberDashboard />} />
            <Route path="/member/profile" element={<MemberProfile />} />
            <Route path="/member/leads" element={<LeadsMember />} />
            <Route path="/member/properti-saya" element={<PropertiSaya />} />
            <Route path="/member/leadermember" element={<LeaderMember />} />
          </Route>
        </Route>

        {/* Public property detail */}
        <Route path="/properti/:id" element={<PropertiDetail />} />

        <Route path="/rumah/:id" element={<RumahDetail />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
