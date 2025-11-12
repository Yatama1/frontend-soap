import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginAdmin from "./pages/LoginAdmin";
import LoginMember from "./pages/LoginMember";
import ProtectedRoute from "./middleware/ProtectedRoute";

// Admin
import AdminDashboard from "./pages/admin/DashboardAdmin";
import LayoutAdmin from "./layouts/AdminLayout";

// Leader
import LeaderDashboard from "./pages/leader/DashboardLeader";
import LayoutLeader from "./layouts/LayoutLeader";

// Senior Leader
import SeniorDashboard from "./pages/senior/DashboardSenior";
import LayoutSenior from "./layouts/LayoutSenior";

// Member
import MemberDashboard from "./pages/member/DashboardMember";
import MemberProfile from "./pages/member/MemberProfile";
import LayoutMember from "./layouts/LayoutMember";
import LeadsMember from "./pages/member/LeadsMember";
import PropertiSaya from "./pages/member/PropertiSaya";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/login-member" element={<LoginMember />} />

      {/* --- Admin --- */}
      <Route
        element={<ProtectedRoute allowedRoles={["admin"]} />}
      >
        <Route element={<LayoutAdmin />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* --- Leader --- */}
      <Route
        element={<ProtectedRoute allowedRoles={["leader"]} />}
      >
        <Route element={<LayoutLeader />}>
          <Route path="/leader/dashboard" element={<LeaderDashboard />} />
        </Route>
      </Route>

      {/* --- Senior Leader --- */}
      <Route
        element={<ProtectedRoute allowedRoles={["senior leader"]} />}
      >
        <Route element={<LayoutSenior />}>
          <Route path="/senior/dashboard" element={<SeniorDashboard />} />
        </Route>
      </Route>

      {/* --- Member --- */}
      <Route
        element={<ProtectedRoute allowedRoles={["member"]} />}
      >
        <Route element={<LayoutMember />}>
          <Route path="/member/dashboard" element={<MemberDashboard />} />
          <Route path="/member/profile" element={<MemberProfile />} />
          <Route path="/member/leads" element={<LeadsMember />} />
          <Route path="/member/properti-saya" element={<PropertiSaya />} />
        </Route>
      </Route>
    </Routes>
  );
}
