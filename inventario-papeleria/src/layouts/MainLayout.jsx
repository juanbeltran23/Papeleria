// src/layouts/MainLayout.jsx
import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { logout, getCurrentUser } from "../supabase/auth";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { ToastContainer } from "react-toastify";

export default function Layout() {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Cargando usuario...
      </div>
    );

  // Menú según el rol
  const role = user.idrol;
  const menuItems = {
    1: [
      { name: "Dashboard", path: "/admin" },
      { name: "Gestores", path: "/admin/gestores" },
      { name: "Aprobar Solicitudes", path: "/admin/solicitudes" },
      { name: "Reportes", path: "/admin/reportes" },
      { name: "Trazabilidad", path: "/admin/bitacora" },
    ],
    2: [
      { name: "Materiales", path: "/gestor" },
      { name: "Entradas", path: "/gestor/entradas" },
      { name: "Salidas", path: "/gestor/salidas" },
      { name: "Devoluciones", path: "/gestor/devoluciones" },
      { name: "Inventario Físico", path: "/gestor/inventario" },
      { name: "Alertas", path: "/gestor/alertas" },
      { name: "Reportes", path: "/gestor/reportes" },
    ],
    3: [
      { name: "Solicitar Material", path: "/solicitante/solicitud" },
      { name: "Historial de Solicitudes", path: "/solicitante/historial" },
    ],
  };

  const items = menuItems[role] || [];

  return (
    <div
      className="min-h-screen w-screen overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900"
      style={{ maxWidth: "100vw" }}
    >
      <Sidebar
        items={items}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setCollapsed={setCollapsed}
      />

      <Navbar
        user={user}
        onToggleSidebar={() => setSidebarOpen(true)}
        onExpandSidebar={() => setCollapsed(false)}
        onLogout={handleLogout}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 overflow-y-auto 
        ${isCollapsed ? "sm:ml-20" : "sm:ml-64"} sm:pt-14 pt-16`}
        style={{ width: "100%", maxWidth: "100vw", overflowX: "hidden" }}
      >
        {/* Renderiza la ruta activa */}
        <main className="flex-1 px-4 sm:px-6 py-6">
          <Outlet />
        </main>
        {/* Contenedor global para notificaciones */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      </div>
    </div>
  );
}
