import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDevoluciones } from "../../services/devolucionesService";
import { toast } from "react-toastify";
import { ClipboardList, Search, RefreshCcw, Plus } from "lucide-react";

export default function ListaDevoluciones({rol = "gestor", showGestor = true}) {
  const [devoluciones, setDevoluciones] = useState([]);
  const [filteredDevoluciones, setFilteredDevoluciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevoluciones();
  }, []);

  const fetchDevoluciones = async () => {
    setLoading(true);
    try {
      const data = await getDevoluciones();
      setDevoluciones(data);
      setFilteredDevoluciones(data);
    } catch (error) {
      toast.error("Error al cargar las devoluciones");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const lower = term.toLowerCase();
    const filtered = devoluciones.filter(
      (s) =>
        s.observacion?.toLowerCase().includes(lower) ||
        s.usuarioSolicitante?.nombre?.toLowerCase().includes(lower) ||
        s.usuarioSolicitante?.apellidos?.toLowerCase().includes(lower)
    );
    setFilteredDevoluciones(filtered);
  };

  // Ruta de detalle según rol
  const getDetalleUrl = (idDevolucion) =>
    rol === "admin" ? `/admin/devolucion/${idDevolucion}` : `/gestor/devolucion/${idDevolucion}`;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-3">
        <h1 className="text-3xl font-semibold text-slate-800 flex items-center gap-2">
          <ClipboardList className="text-blue-600" /> Registro de Devoluciones
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por observacion o solicitante..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-slate-200 pl-9 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDevoluciones}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
            >
              <RefreshCcw size={18} />
              Refrescar
            </button>

            {/* Solo se muestra si showGestor es true */}
            {showGestor && (
              <button
                onClick={() => navigate("/gestor/registrar-devolucion")}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition"
              >
                <Plus size={18} />
                Nueva devolución
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla escritorio */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">
                #
              </th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">
                Observación
              </th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">
                Solicitante
              </th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">
                Gestor
              </th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-5 text-center text-gray-500">
                  Cargando devoluciones...
                </td>
              </tr>
            ) : filteredDevoluciones.length > 0 ? (
              filteredDevoluciones.map((devolucion, index) => (
                <tr
                  key={devolucion.idDevolucion}
                  onClick={() =>
                    navigate(getDetalleUrl(devolucion.idDevolucion))
                  }
                  className="border-b hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {devolucion.observacion}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {devolucion.usuarioSolicitante?.nombre}{" "}
                    {devolucion.usuarioSolicitante?.apellidos}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {devolucion.usuarioGestor?.nombre}{" "}
                    {devolucion.usuarioGestor?.apellidos}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {new Date(devolucion.fecha).toLocaleString("es-CO")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-5 text-center text-gray-500">
                  No hay devoluciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📱 Móvil */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-500">Cargando devoliciones...</p>
        ) : filteredDevoluciones.length > 0 ? (
          filteredDevoluciones.map((devolucion) => (
            <div
              key={devolucion.idDevolucion}
              onClick={() =>
                navigate(getDetalleUrl(devolucion.idDevolucion))
              }
              className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">
                  {devolucion.idDevolucion}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(devolucion.fecha).toLocaleDateString("es-CO")}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Solicitante:</strong>{" "}
                {devolucion.usuarioSolicitante?.nombre}{" "}
                {devolucion.usuarioSolicitante?.apellidos}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Gestor:</strong> {devolucion.usuarioGestor?.nombre}{" "}
                {devolucion.usuarioGestor?.apellidos}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No hay devoluciones registradas.
          </p>
        )}
      </div>
    </div>
  );
}
