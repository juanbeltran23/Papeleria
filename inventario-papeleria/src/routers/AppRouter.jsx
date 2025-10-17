import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register"
import AdminDashboard from "../pages/admin/AdminDashboard";
import GestorDashboard from "../pages/gestor/GestorDashboard";
import SolicitanteDashboard from "../pages/solicitante/SolicitanteDashboard";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        
        {/* Rutas protegidas */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="1">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestor"
          element={
            <ProtectedRoute allowedRole="2">
              <GestorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/solicitante"
          element={
            <ProtectedRoute allowedRole="3">
              <SolicitanteDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
