import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { logout, getCurrentUser } from "../services/auth.js";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

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

  const role = user.idRol;
  const menuItems = {
    1: [
      { name: "Dashboard", path: "/admin" },
      { name: "Gestores", path: "/admin/gestores" },
      { name: "Aprobar Solicitudes", path: "/admin/solicitudes" },
      { name: "Reportes", path: "/admin/reportes" },
      { name: "Trazabilidad", path: "/admin/movimientos" },
      { name: "Alertas", path: "/alertas" },
    ],
    2: [
      { name: "Materiales", path: "/gestor" },
      { name: "Entradas", path: "/gestor/entradas" },
      { name: "Salidas", path: "/gestor/salidas" },
      { name: "Devoluciones", path: "/gestor/devoluciones" },
      { name: "Inventario Físico", path: "/gestor/inventario" },
      { name: "Alertas", path: "/alertas" },
      { name: "Reportes", path: "/gestor/reportes" },
    ],
    3: [
      { name: "Solicitar Material", path: "/solicitante/registrar-solicitud" },
      { name: "Historial de Solicitudes", path: "/solicitante/historial-solicitudes" },
    ],
  };

  const items = menuItems[role] || [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        items={items}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setCollapsed={setCollapsed}
      />

      {/* Contenido principal */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isCollapsed ? "sm:ml-20" : "sm:ml-64"
        }`}
      >
        {/* Navbar */}
        <Navbar
          user={user}
          onToggleSidebar={() => setSidebarOpen(true)}
          onExpandSidebar={() => setCollapsed(false)}
          onLogout={handleLogout}
        />

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto pt-16 px-4 sm:px-6 pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
