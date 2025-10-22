// src/routers/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/admin/AdminDashboard";
import GestorDashboard from "../pages/gestor/GestorDashboard";
import SolicitanteDashboard from "../pages/solicitante/SolicitanteDashboard";
import GestorPanel from "../pages/admin/GestorPanel";
import RegistrarItem from "../pages/gestor/RegistrarItem";  
import Perfil from "../components/Perfil";
import Layout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Agrupamos las rutas protegidas bajo el mismo Layout */}
        <Route
          element={
            <ProtectedRoute allowedRole={["1", "2", "3"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* ADMIN */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/gestores" element={<GestorPanel />} />

          {/* GESTOR */}
          <Route path="/gestor" element={<RegistrarItem />} />

          {/* SOLICITANTE */}
          <Route path="/solicitante" element={<SolicitanteDashboard />} />

          {/* PERFIL (común a todos) */}
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
