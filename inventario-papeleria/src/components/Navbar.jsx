import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Bell, User, Menu, CheckCircle, AlertCircle } from "lucide-react";
import { getUltimasAlertas, markAlertaInactiva } from "../services/alertaService";
import { supabase } from "../supabase/client"; // importa tu cliente
import { toast } from "react-toastify";

export default function Navbar({ user, onToggleSidebar, onExpandSidebar, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Cargar últimas alertas al montar o cuando cambie el usuario
  useEffect(() => {
    if (!user) return;
    async function fetchAlerts() {
      try {
        const data = await getUltimasAlertas(3);
        const mapped = data.map((a) => ({
          id: a.idAlerta,
          text: a.mensaje,
          type: a.tipo === "stock_minimo" ? "alert" : "info",
        }));
        setNotifications(mapped);
      } catch (err) {
        console.error("Error cargando alertas:", err.message);
      }
    }
    fetchAlerts();
  }, [user]);

  // DEBUG: Suscripción adicional sin filtro para verificar si llegan INSERT/UPDATE desde Supabase
  // Quitar o comentar esta sección cuando se confirme el comportamiento
  useEffect(() => {
    if (!user) return;
    const debugChan = supabase.channel('alertas-debug-channel');

    debugChan.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'alerta' },
      (payload) => {
        console.log('[debug realtime] INSERT sin filtro:', payload);
      }
    );

    debugChan.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'alerta' },
      (payload) => {
        console.log('[debug realtime] UPDATE sin filtro:', payload);
      }
    );

    debugChan.subscribe((status) => console.log('[debug realtime] channel status', status));

    return () => supabase.removeChannel(debugChan);
  }, [user]);

  // Suscripción en tiempo real a la tabla alerta
  useEffect(() => {
    if (!user) return;

    // crear un canal por usuario para filtrar en el servidor y evitar sobrecarga
    const chanName = `alertas-channel-${user.idUsuario}`;
    const channel = supabase.channel(chanName, { config: {} });

    // Nuevo insert: agregar notificación y mostrar toast
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "alerta", filter: `idUsuario=eq.${user.idUsuario}` },
      (payload) => {
        console.log("[realtime] INSERT payload:", payload);
        const nueva = payload.new;
        // la alerta insertada ya corresponde al usuario por el filtro
        if (nueva.estado === "activa") {
          // If this is a stock_minimo alert and the client temporarily suppressed such alerts, ignore it
          if (nueva.tipo === 'stock_minimo' && typeof window !== 'undefined' && window.__suppressStockAlert) {
            console.log('[realtime] stock_minimo alert suppressed by client flag');
            return;
          }
          const alerta = {
            id: nueva.idAlerta,
            text: nueva.mensaje,
            type: nueva.tipo === "stock_minimo" ? "alert" : "info",
          };
          setNotifications((prev) => [alerta, ...prev].slice(0, 3));
          toast.info(nueva.mensaje || "Nueva alerta", { autoClose: 5000 });
        }
      }
    );

    // Update: si cambia estado, remover o actualizar la notificación
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "alerta", filter: `idUsuario=eq.${user.idUsuario}` },
      (payload) => {
        console.log("[realtime] UPDATE payload:", payload);
        const nuevo = payload.new;
        if (nuevo.estado && nuevo.estado !== "activa") {
          setNotifications((prev) => prev.filter((n) => n.id !== nuevo.idAlerta));
        } else if (nuevo.estado === "activa") {
          if (nuevo.tipo === 'stock_minimo' && typeof window !== 'undefined' && window.__suppressStockAlert) {
            console.log('[realtime] UPDATE stock_minimo alert suppressed by client flag');
            return;
          }
          const alerta = {
            id: nuevo.idAlerta,
            text: nuevo.mensaje,
            type: nuevo.tipo === "stock_minimo" ? "alert" : "info",
          };
          setNotifications((prev) => [alerta, ...prev].slice(0, 3));
          toast.info(nuevo.mensaje || "Nueva alerta", { autoClose: 5000 });
        }
      }
    );

    channel.subscribe((status) => {
      console.log("[realtime] channel status:", status);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Escuchar evento local cuando createAlerta se ejecuta en este cliente
  useEffect(() => {
    const handler = (e) => {
      const nueva = e.detail;
      console.log("[local event] alerta:created", nueva);
      if (!nueva) return;
      if (nueva.idUsuario === user?.idUsuario && nueva.estado === "activa") {
        const alerta = {
          id: nueva.idAlerta,
          text: nueva.mensaje,
          type: nueva.tipo === "stock_minimo" ? "alert" : "info",
        };
        setNotifications((prev) => [alerta, ...prev].slice(0, 3));
        toast.info(nueva.mensaje || "Nueva alerta", { autoClose: 5000 });
      }
    };

    window.addEventListener("alerta:created", handler);
    return () => window.removeEventListener("alerta:created", handler);
  }, [user]);

  // Cerrar menús al hacer click fuera
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
                          onClick={async () => {
                            try {
                              await markAlertaInactiva(n.id);
                              // actualizar UI localmente para remover la notificación
                              setNotifications((prev) => prev.filter((x) => x.id !== n.id));
                              setNotifOpen(false);
                              navigate(`/alertas/${n.id}`);
                            } catch (err) {
                              console.error("Error marcando alerta inactiva:", err.message);
                            }
                          }}
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
