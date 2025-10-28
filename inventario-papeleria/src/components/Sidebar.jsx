import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  BarChart3,
  Clock,
  Package,
  Upload,
  Download,
  RefreshCcw,
  ClipboardList,
  AlertTriangle,
  FileText,
  FileSignature,
  History,
} from "lucide-react";

export default function Sidebar({
  items,
  isOpen,
  onClose,
  isCollapsed,
  setCollapsed,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const iconMap = {
    Dashboard: <LayoutDashboard className="w-5 h-5" />,
    Gestores: <Users className="w-5 h-5" />,
    "Aprobar Solicitudes": <CheckCircle className="w-5 h-5" />,
    Reportes: <BarChart3 className="w-5 h-5" />,
    Trazabilidad: <Clock className="w-5 h-5" />,
    Materiales: <Package className="w-5 h-5" />,
    Entradas: <Upload className="w-5 h-5" />,
    Salidas: <Download className="w-5 h-5" />,
    Devoluciones: <RefreshCcw className="w-5 h-5" />,
    "Inventario Físico": <ClipboardList className="w-5 h-5" />,
    Alertas: <AlertTriangle className="w-5 h-5" />,
    "Solicitar Material": <FileSignature className="w-5 h-5" />,
    "Historial de Solicitudes": <History className="w-5 h-5" />,
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-blur-sm shadow-inner z-50 sm:hidden animate-fadeIn"
          onClick={onClose}
        />

      )}

      <aside
        className={`fixed top-0 left-0 z-60 h-screen pt-16
        backdrop-blur-xl bg-white/60 border-r border-white/30
        shadow-xl transition-all duration-500 ease-in-out transform
        ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 sm:opacity-100 sm:translate-x-0"}
        ${isCollapsed ? "w-20" : "w-64"}
        animate-slideIn`}
      >
        <div className="hidden sm:flex justify-end px-2 mt-2">
          <button
            onClick={() => setCollapsed(!isCollapsed)}
            className="text-gray-600 hover:text-gray-900 text-lg transition"
          >
            {isCollapsed ? "»" : "«"}
          </button>
        </div>

        <div className="sm:hidden flex justify-end px-2 mt-2">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="px-2 py-4 space-y-2">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              className={`flex items-center w-full px-3 py-2 text-left rounded-xl transition-all 
              ${location.pathname === item.path
                  ? "bg-blue-100/60 text-blue-700 shadow-sm"
                  : "text-gray-800 hover:bg-gray-100/60"
                }`}
            >
              <span className="text-lg flex items-center justify-center">
                {iconMap[item.name] || <FileText className="w-5 h-5" />}
              </span>
              {!isCollapsed && (
                <span className="ml-3 truncate text-sm font-medium">
                  {item.name}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
