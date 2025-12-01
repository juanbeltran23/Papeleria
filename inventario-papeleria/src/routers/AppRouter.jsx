import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/admin/AdminDashboard";
import GestorPanel from "../pages/admin/GestorPanel";
import Items from "../pages/gestor/Items";
import RegistrarItem from "../pages/gestor/RegistrarItem";
import DetalleItem from "../pages/gestor/DetalleItem";
import SolicitanteDashboard from "../pages/solicitante/SolicitanteDashboard";
import Perfil from "../pages/Perfil";
import HistorialAlerta from "../pages/alertas/HistorialAlerta";
import DetalleAlerta from "../pages/alertas/DetalleAlerta";
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
import Inventario from "../pages/gestor/Inventario";
import Trazabilidad from "../pages/admin/Trazabilidad";
import Reports from "../pages/admin/Reports";
import CrearSolicitud from "../pages/solicitante/CrearSolicitud";
import SolicitudesPanel from "../pages/admin/SolicitudesPanel";
import HistorialSolicitudes from "../pages/solicitante/HistorialSolicitudes";
import ReportsGestor from "../pages/gestor/ReportsGestor";

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
          <Route path="/admin/movimientos" element={<Trazabilidad />} />
          <Route path="/admin/reportes" element={<Reports />} />
          {/* Detalles admin */}
          <Route path="/admin/salida/:id" element={<DetalleSalida rol="admin" />} />
          <Route path="/admin/devolucion/:id" element={<DetalleDevolucion rol="admin" />} />
          <Route path="/admin/solicitudes" element={<SolicitudesPanel tab="solicitudes" />} />
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
          <Route path="/gestor/salida/:id" element={<DetalleSalida rol="gestor" />} />
          <Route path="/gestor/devoluciones" element={<Devoluciones />} /> 
          <Route path="/gestor/registrar-devolucion" element={<RegistrarDevolucion />} />
          <Route path="/gestor/devolucion/:id" element={<DetalleDevolucion rol="gestor" />} />
          <Route path="/gestor/inventario" element={<Inventario />} />
          <Route path="/gestor/reportes" element={<ReportsGestor />} />
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
          <Route path="/solicitante/registrar-solicitud" element={<CrearSolicitud />} />
          <Route path="/solicitante/historial-solicitudes" element={<HistorialSolicitudes />} />
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
          <Route path="/alertas" element={<HistorialAlerta />} />
          <Route path="/alertas/:id" element={<DetalleAlerta />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
