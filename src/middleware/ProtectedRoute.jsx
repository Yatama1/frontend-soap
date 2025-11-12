import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) return <Navigate to="/login-member" replace />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

    return <Outlet />;
}
