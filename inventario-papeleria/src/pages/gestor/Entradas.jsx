import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEntradas } from "../../supabase/entradasService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Upload, Search, RefreshCcw, Plus } from "lucide-react";

export default function Entradas() {
  const [entradas, setEntradas] = useState([]);
  const [filteredEntradas, setFilteredEntradas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntradas();
  }, []);

  const fetchEntradas = async () => {
    setLoading(true);
    try {
      const data = await getEntradas();
      setEntradas(data);
      setFilteredEntradas(data);
    } catch (error) {
      toast.error("Error al cargar las entradas");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const lower = term.toLowerCase();
    const filtered = entradas.filter(
      (e) =>
        e.item?.nombre?.toLowerCase().includes(lower) ||
        e.item?.codigo?.toLowerCase().includes(lower) ||
        e.factura?.toLowerCase().includes(lower)
    );
    setFilteredEntradas(filtered);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-3xl font-semibold text-slate-800 flex items-center gap-2">
          <Upload className="text-blue-600" /> Registro de Entradas
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, código o factura..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-slate-200 pl-9 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>
          <button
            onClick={fetchEntradas}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
          >
            <RefreshCcw size={18} />
            Refrescar
          </button>

          <button
            onClick={() => navigate("/gestor/registrar-entrada")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition"
          >
            <Plus size={18} />
            Nueva entrada
          </button>
        </div>
      </div>

      {/* 🧱 Tabla en escritorio */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">#</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Código</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Nombre</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Cantidad</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Factura</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Observación</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Registrado por</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="py-5 text-center text-gray-500">
                  Cargando entradas...
                </td>
              </tr>
            ) : filteredEntradas.length > 0 ? (
              filteredEntradas.map((entrada, index) => (
                <tr
                  key={entrada.idEntrada}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 text-gray-700 text-sm">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{entrada.item?.codigo}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{entrada.item?.nombre}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm font-medium">{entrada.cantidad}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{entrada.factura || "-"}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{entrada.observacion || "-"}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {entrada.usuario?.nombre || "Desconocido"}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {new Date(entrada.fecha).toLocaleString("es-CO")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-5 text-center text-gray-500">
                  No hay entradas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📱 Vista en móvil */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-500">Cargando entradas...</p>
        ) : filteredEntradas.length > 0 ? (
          filteredEntradas.map((entrada) => (
            <div
              key={entrada.idEntrada}
              className="bg-white rounded-2xl shadow-md p-4 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">
                  {entrada.item?.nombre}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(entrada.fecha).toLocaleString("es-CO", {
                    timeZone: "America/Bogota",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Código:</strong> {entrada.item?.codigo}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Cantidad:</strong> {entrada.cantidad}
              </p>
              {entrada.factura && (
                <p className="text-sm text-gray-600">
                  <strong>Factura:</strong> {entrada.factura}
                </p>
              )}
              {entrada.observacion && (
                <p className="text-sm text-gray-600">
                  <strong>Obs:</strong> {entrada.observacion}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                <strong>Gestor:</strong> {entrada.usuario?.nombre || "Desconocido"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No hay entradas registradas.</p>
        )}
      </div>
    </div>
  );
}
