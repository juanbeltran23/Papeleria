import { useEffect, useState } from "react";
import {
  getSolicitudes,
  getSolicitudDetalle,
  procesarSolicitud
} from "../../services/solicitudesService";
import { toast } from "react-toastify";
import SolicitudDetalle from "../../components/solicitud/SolicitudDetalle";
import { getGestores } from "../../services/usuarioService";
import { RefreshCcw, Loader2 } from "lucide-react";

export default function SolicitudesPanel() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtro, setFiltro] = useState("pendiente");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [gestores, setGestores] = useState([]);
  const [selectedGestor, setSelectedGestor] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  async function cargar() {
    try {
      setLoading(true);
      const data = await getSolicitudes({
        forAdmin: true,
        estado: filtro,
        searchText: search,
      });
      setSolicitudes(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando solicitudes.");
    } finally {
      setLoading(false);
    }
  }

  async function cargarGestores() {
    try {
      const data = await getGestores();
      setGestores(data || []);
    } catch {
      console.warn("No se pudieron cargar los gestores.");
    }
  }

  useEffect(() => {
    cargar();
    cargarGestores();

    // refresco automático cada minuto
    const interval = setInterval(() => {
      setRefreshing(true);
      cargar().finally(() => setRefreshing(false));
    }, 60000);
    return () => clearInterval(interval);
  }, [filtro]);

  const handleVer = async (idSolicitud) => {
    try {
      const detalle = await getSolicitudDetalle(idSolicitud);
      setSelected(detalle);
      setSelectedGestor(null);
    } catch {
      toast.error("No se pudo cargar el detalle.");
    }
  };

  const handleAprobar = async (idSolicitud) => {
    if (!confirm("¿Aprobar esta solicitud?")) return;

    try {
      let idGestor = null;
      const itemsInventario = selected?.solicitudItem?.filter(si => si.idItem);

      if (itemsInventario?.length > 0) {
        if (!selectedGestor) {
          toast.error("Debes seleccionar un gestor antes de aprobar.");
          return;
        }
        idGestor = selectedGestor;
      }

      await procesarSolicitud({ idSolicitud, estado: "aprobada", idGestor });
      toast.success("Solicitud aprobada correctamente.");
      setSelected(null);
      cargar();
    } catch (err) {
      console.error(err);
      toast.error("Error aprobando solicitud.");
    }
  };

  const handleRechazar = async (idSolicitud) => {
    const motivo = prompt("Motivo del rechazo (opcional):", "No disponible / rechazado");
    if (motivo === null) return;

    try {
      await procesarSolicitud({ idSolicitud, estado: "rechazada", motivo });
      toast.info("Solicitud rechazada.");
      setSelected(null);
      cargar();
    } catch (err) {
      console.error(err);
      toast.error("Error rechazando solicitud.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Gestión de Solicitudes</h2>
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
                    <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Solicitante</th>
                    <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Fecha</th>
                    <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Estado</th>
                    <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => (
                    <tr key={s.idSolicitud} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-4">{s.idSolicitud}</td>
                      <td className="py-3 px-4">{s.actividad || "—"}</td>
                      <td className="py-3 px-4">
                        {s.usuarioSolicitante?.nombre
                          ? `${s.usuarioSolicitante.nombre} ${s.usuarioSolicitante.apellidos}`
                          : s.usuarioSolicitante?.correo || "—"}
                      </td>
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
                  onClick={() => handleVer(s.idSolicitud)}
                  className="p-4 rounded-xl shadow-md border cursor-pointer transition-all bg-white hover:shadow-lg"
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
                  <p className="text-sm text-gray-600">
                    Solicitante:{" "}
                    {s.usuarioSolicitante?.nombre
                      ? `${s.usuarioSolicitante.nombre} ${s.usuarioSolicitante.apellidos}`
                      : s.usuarioSolicitante?.correo || "—"}
                  </p>
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
          <div className="bg-white max-w-3xl w-full rounded-lg shadow-lg p-6">
            <SolicitudDetalle solicitud={selected} />

            {/* Select de gestor solo si está pendiente y tiene items de inventario */}
            {selected.estado === "pendiente" &&
              selected.solicitudItem?.some((si) => si.item?.idItem) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seleccionar gestor responsable
                  </label>
                  <select
                    value={selectedGestor || ""}
                    onChange={(e) => setSelectedGestor(parseInt(e.target.value))}
                    className="w-full sm:w-1/2 border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300 outline-none"
                  >
                    <option value="">-- Selecciona un gestor --</option>
                    {gestores.map((g) => (
                      <option key={g.idUsuario} value={g.idUsuario}>
                        {g.nombre} {g.apellidos}
                      </option>
                    ))}
                  </select>
                  {!selectedGestor && (
                    <p className="text-red-500 text-xs mt-1">
                      Debes seleccionar un gestor antes de aprobar.
                    </p>
                  )}
                </div>
              )}

            <div className="flex gap-3 justify-end mt-6">
              {selected.estado === "pendiente" && (
                <>
                  <button
                    onClick={() => handleAprobar(selected.idSolicitud)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleRechazar(selected.idSolicitud)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    Rechazar
                  </button>
                </>
              )}
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
