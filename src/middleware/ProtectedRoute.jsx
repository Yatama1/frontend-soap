// src/middleware/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./AuthProvider";

function normalizeRole(r) {
  if (!r) return "";
  return r.toString().toLowerCase().replace(/[_\-\s]+/g, " ").trim();
}

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  let role = user?.role;
  if (!role) {
    try {
      const raw = JSON.parse(localStorage.getItem("user") || "{}");
      role = raw.role || raw.jabatan || "";
    } catch {
      role = "";
    }
  }

  const normalizedRole = normalizeRole(role);
  const allowed = (allowedRoles || []).map((r) => normalizeRole(r));

  if (allowed.length && !allowed.includes(normalizedRole)) {
    // redirect to login if role not allowed (you asked to not use Unauthorized page)
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
