import { useEffect, useState } from "react";
import { getSolicitudes, getSolicitudDetalle } from "../../services/solicitudesService";
import { RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

// Componente de detalle restringido para solicitante
function SolicitudDetalleSolicitante({ solicitud }) {
  if (!solicitud) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Detalle de la Solicitud</h2>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <p className="text-sm text-gray-600">
          <strong>Actividad:</strong> {solicitud.actividad || "Sin actividad"}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Estado:</strong>{" "}
          <span
            className={`px-2 py-1 rounded text-xs ${
              solicitud.estado === "pendiente"
                ? "bg-yellow-100 text-yellow-800"
                : solicitud.estado === "aprobada"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {solicitud.estado}
          </span>
        </p>
      </div>

      {/* Lista de materiales solicitados */}
      {solicitud.solicitudItem?.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Materiales solicitados</h3>
          <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
            {solicitud.solicitudItem.map((si) => (
              <li key={si.idSolicitudItem}>
                {si.item?.nombre || "Material sin nombre"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Si es material nuevo */}
      {solicitud.descripcionMaterial && (
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Material nuevo</h3>
          <p className="text-sm text-gray-700">{solicitud.descripcionMaterial}</p>
        </div>
      )}
    </div>
  );
}

export default function HistorialSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  async function cargar() {
    try {
      setLoading(true);
      const data = await getSolicitudes({
        forAdmin: false, // solicitante
        estado: filtro,
        searchText: search,
      });
      setSolicitudes(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando historial.");
    } finally {
      setLoading(false);
    }
  }

  const handleVer = async (idSolicitud) => {
    try {
      const detalle = await getSolicitudDetalle(idSolicitud);
      setSelected(detalle);
    } catch {
      toast.error("No se pudo cargar el detalle.");
    }
  };

  useEffect(() => {
    cargar();
    const interval = setInterval(() => {
      setRefreshing(true);
      cargar().finally(() => setRefreshing(false));
    }, 10000);
    return () => clearInterval(interval);
  }, [filtro]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Historial de Solicitudes</h2>
        <button
          onClick={cargar}
          disabled={refreshing}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          <RefreshCcw className={`${refreshing ? "animate-spin" : ""}`} size={18} />
          {refreshing ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobada">Aprobadas</option>
          <option value="rechazada">Rechazadas</option>
        </select>
        <input
          placeholder="Buscar por actividad o descripción"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          onClick={cargar}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      {/* Lista de solicitudes */}
      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500 flex items-center justify-center">
            <Loader2 className="animate-spin mr-2" /> Cargando...
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No hay solicitudes</div>
        ) : (
          <>
            {/* Tabla en escritorio */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">#</th>
                    <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Actividad</th>
                    <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Fecha</th>
                    <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Estado</th>
                    <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => (
                    <tr key={s.idSolicitud} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-4">{s.idSolicitud}</td>
                      <td className="py-3 px-4">{s.actividad || s.descripcionMaterial || "—"}</td>
                      <td className="py-3 px-4">
                        {s.fechaSolicitud
                          ? new Date(s.fechaSolicitud).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            s.estado === "pendiente"
                              ? "bg-yellow-100 text-yellow-800"
                              : s.estado === "aprobada"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {s.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleVer(s.idSolicitud)}
                          className="px-3 py-1 bg-blue-600 text-white rounded"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards en móvil */}
            <div className="md:hidden flex flex-col gap-4">
              {solicitudes.map((s) => (
                <div
                  key={s.idSolicitud}
                  className="p-4 rounded-xl shadow-md border bg-white hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800">
                      #{s.idSolicitud} — {s.actividad || "Sin actividad"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        s.estado === "pendiente"
                          ? "bg-yellow-100 text-yellow-800"
                          : s.estado === "aprobada"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                                            }`}
                    >
                      {s.estado}
                    </span>
                  </div>
                  {s.descripcionMaterial && (
                    <p className="text-sm text-gray-500 mt-1">
                      Material nuevo: {s.descripcionMaterial}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Fecha:{" "}
                    {s.fechaSolicitud
                      ? new Date(s.fechaSolicitud).toLocaleDateString()
                      : "—"}
                  </p>
                  <button
                    onClick={() => handleVer(s.idSolicitud)}
                    className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Ver detalle
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de detalle */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full rounded-lg shadow-lg p-6">
            <SolicitudDetalleSolicitante solicitud={selected} />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelected(null)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
