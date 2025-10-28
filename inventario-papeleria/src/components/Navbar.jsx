import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Bell, User, Menu, CheckCircle, AlertCircle } from "lucide-react";

export default function Navbar({ user, onToggleSidebar, onExpandSidebar, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nueva solicitud pendiente", type: "alert" },
    { id: 2, text: "Inventario actualizado", type: "info" },
  ]);

  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (menuRef.current && !menuRef.current.contains(e.target)) &&
        (notifRef.current && !notifRef.current.contains(e.target))
      ) {
        setMenuOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 
      backdrop-blur-xl bg-white/60 
      border-b border-white/30 
      shadow-md flex items-center justify-between px-4 sm:px-6 z-50 
      transition-all duration-300">
      
      {/* Menú móvil */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            onToggleSidebar();
            onExpandSidebar();
          }}
          className="sm:hidden text-gray-700 hover:text-blue-600"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Parte derecha */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-gray-600 hover:bg-gray-100/60 rounded-full transition"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 backdrop-blur-lg bg-white/80 border border-white/20 rounded-xl shadow-xl py-2">
              <div className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-gray-700">
                Notificaciones
              </div>
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Sin notificaciones
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100/60 cursor-pointer"
                  >
                    {n.type === "alert" ? (
                      <AlertCircle className="text-yellow-500 w-5 h-5" />
                    ) : (
                      <CheckCircle className="text-green-500 w-5 h-5" />
                    )}
                    <span className="text-gray-700 text-sm">
                      {n.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200/70 hover:ring-2 ring-blue-500 transition"
          >
            <User className="text-gray-600 w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 
              backdrop-blur-md bg-white/70 
              border border-white/20 
              rounded-xl shadow-lg py-1 transition-all duration-200">
              <button
                onClick={() => {
                  navigate("/perfil");
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/60"
              >
                Tu perfil
              </button>
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/60"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
