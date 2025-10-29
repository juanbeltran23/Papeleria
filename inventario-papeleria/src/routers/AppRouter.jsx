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
import RegistrarEntrada from "../pages/gestor/RegistrarEntrada";
import Entradas from "../pages/gestor/Entradas";
import RegistrarSalida from "../pages/gestor/RegistrarSalida";
import Salidas from "../pages/gestor/Salidas";
import DetalleSalida from "../pages/gestor/DetalleSalida";
import RegistrarDevolucion from "../pages/gestor/RegistrarDevolucion";
import Devoluciones from "../pages/gestor/Devoluciones";
import DetalleDevolucion from "../pages/gestor/DetalleDevolucion";

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
          <Route path="/gestor/entradas" element={<Entradas />} />
          <Route path="/gestor/registrar-entrada" element={<RegistrarEntrada />} />
          <Route path="/gestor/salidas" element={<Salidas />} /> 
          <Route path="/gestor/registrar-salida" element={<RegistrarSalida />} />
          <Route path="/gestor/salida/:id" element={<DetalleSalida />} />
          <Route path="/gestor/devoluciones" element={<Devoluciones />} /> 
          <Route path="/gestor/registrar-devolucion" element={<RegistrarDevolucion />} />
          <Route path="/gestor/devolucion/:id" element={<DetalleDevolucion/>} />
          

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
