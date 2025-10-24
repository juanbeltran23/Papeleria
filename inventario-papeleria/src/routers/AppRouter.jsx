// src/routers/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/admin/AdminDashboard";
import GestorPanel from "../pages/admin/GestorPanel";
import Items from "../pages/gestor/Items";
import RegistrarItem from "../pages/gestor/RegistrarItem";
import DetalleItem from "../pages/gestor/DetalleItem"; // Asegúrate de importar esto si lo usas
import SolicitanteDashboard from "../pages/solicitante/SolicitanteDashboard";
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

        {/* ADMIN */}
        <Route
          element={
            <ProtectedRoute allowedRole={["1"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/gestores" element={<GestorPanel />} />
        </Route>

        {/* GESTOR */}
        <Route
          element={
            <ProtectedRoute allowedRole={["2"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/gestor" element={<Items />} />
          <Route path="/items/:id" element={<DetalleItem />} />
          <Route path="/items/registrar" element={<RegistrarItem />} />
        </Route>

        {/* SOLICITANTE */}
        <Route
          element={
            <ProtectedRoute allowedRole={["3"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/solicitante" element={<SolicitanteDashboard />} />
        </Route>

        {/* PERFIL (común a todos) */}
        <Route
          element={
            <ProtectedRoute allowedRole={["1", "2", "3"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
