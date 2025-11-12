import { useEffect, useState } from "react";
import {getMovimientos} from "../../services/movimientosService";
import { getCategorias } from "../../services/itemsService";
import { Search, Filter, RefreshCcw, ScrollText, Calendar } from "lucide-react";
import { toast } from "react-toastify";

export default function TodosMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [movData, catData] = await Promise.all([
        getMovimientos(),
        getCategorias(),
      ]);
      setMovimientos(movData || []);
      setCategorias(catData || []);
    } catch (err) {
      toast.error("Error al cargar movimientos o categorías.");
    } finally {
      setLoading(false);
    }
  }

  // Filtro de búsqueda, categoría y fechas
  const movimientosFiltrados = movimientos.filter((m) => {
    const coincideCategoria =
      !filtroCategoria ||
      m.item?.categoria?.idCategoria === parseInt(filtroCategoria);
    const coincideBusqueda =
      m.item?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.item?.codigo?.toLowerCase().includes(busqueda.toLowerCase());

    const fechaMovimiento = new Date(m.fecha);
    const coincideFecha =
      (!fechaDesde || fechaMovimiento >= new Date(fechaDesde)) &&
      (!fechaHasta || fechaMovimiento <= new Date(fechaHasta));

    return coincideCategoria && coincideBusqueda && coincideFecha;
  });

  const tipoColor = {
    entrada: "text-emerald-700 bg-emerald-50",
    salida: "text-blue-700 bg-blue-50",
    devolucion: "text-purple-700 bg-purple-50",
    ajuste: "text-orange-700 bg-orange-50",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-semibold text-slate-800 flex items-center gap-2">
          <ScrollText className="text-blue-600" /> Todos los Movimientos
        </h1>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full md:w-auto">
          {/* Búsqueda */}
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-slate-200 pl-9 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          {/* Filtro categoría */}
          <div className="relative w-full sm:w-52">
            <Filter
              className="absolute left-2.5 top-2.5 text-slate-400"
              size={18}
            />
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full border border-slate-200 pl-8 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.idCategoria} value={cat.idCategoria}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro fecha desde */}
          <div className="relative w-full sm:w-48">
            <Calendar
              className="absolute left-2.5 top-2.5 text-slate-400"
              size={18}
            />
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full border border-slate-200 pl-8 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          {/* Filtro fecha hasta */}
          <div className="relative w-full sm:w-48">
            <Calendar
              className="absolute left-2.5 top-2.5 text-slate-400"
              size={18}
            />
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full border border-slate-200 pl-8 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          {/* Botón refrescar */}
          <button
            onClick={cargarDatos}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
          >
            <RefreshCcw size={16} /> Refrescar
          </button>
        </div>
      </div>

      {/* Tabla en escritorio */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">
                Tipo
              </th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">
                Fecha
              </th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">
                Ítem
              </th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">
                Categoría
              </th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">
                Cantidad
              </th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">
                Descripción
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-5 text-center text-gray-500">
                  Cargando movimientos...
                </td>
              </tr>
            ) : movimientosFiltrados.length > 0 ? (
              movimientosFiltrados.map((m) => (
                <tr
                  key={m.idMovimiento}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                        tipoColor[m.tipo]
                      }`}
                    >
                      {m.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {new Date(m.fecha).toLocaleString("es-CO")}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {m.item?.nombre} ({m.item?.codigo})
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {m.item?.categoria?.nombre || "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm font-medium">
                    {m.cantidad}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {m.descripcion || "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-5 text-center text-gray-500">
                  No hay movimientos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vista en móvil */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-500">Cargando movimientos...</p>
        ) : movimientosFiltrados.length > 0 ? (
          movimientosFiltrados.map((m) => (
            <div
              key={m.idMovimiento}
              className="bg-white rounded-2xl shadow-md p-4 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                    tipoColor[m.tipo]
                  }`}
                >
                  {m.tipo}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(m.fecha).toLocaleString("es-CO", {
                    timeZone: "America/Bogota",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Ítem:</strong> {m.item?.nombre} ({m.item?.codigo})
              </p>
              <p className="text-sm text-gray-600">
                <strong>Categoría:</strong> {m.item?.categoria?.nombre || "—"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Cantidad:</strong> {m.cantidad}
              </p>
              {m.descripcion && (
                <p className="text-sm text-gray-600">
                  <strong>Descripción:</strong> {m.descripcion}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No hay movimientos registrados.
          </p>
        )}
      </div>
    </div>
  );
}
