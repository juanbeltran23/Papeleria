import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSalidas } from "../../supabase/salidasService";
import { toast } from "react-toastify";
import { ClipboardList, Search, RefreshCcw, Plus } from "lucide-react";

export default function Salidas() {
  const [salidas, setSalidas] = useState([]);
  const [filteredSalidas, setFilteredSalidas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalidas();
  }, []);

  const fetchSalidas = async () => {
    setLoading(true);
    try {
      const data = await getSalidas();
      setSalidas(data);
      setFilteredSalidas(data);
    } catch (error) {
      toast.error("Error al cargar las salidas");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const lower = term.toLowerCase();
    const filtered = salidas.filter(
      (s) =>
        s.actividad?.toLowerCase().includes(lower) ||
        s.usuarioSolicitante?.nombre?.toLowerCase().includes(lower) ||
        s.usuarioSolicitante?.apellidos?.toLowerCase().includes(lower)
    );
    setFilteredSalidas(filtered);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-3xl font-semibold text-slate-800 flex items-center gap-2">
          <ClipboardList className="text-blue-600" /> Registro de Salidas
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por actividad o solicitante..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-slate-200 pl-9 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          <button
            onClick={fetchSalidas}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
          >
            <RefreshCcw size={18} />
            Refrescar
          </button>

          <button
            onClick={() => navigate("/gestor/registrar-salida")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition"
          >
            <Plus size={18} />
            Nueva salida
          </button>
        </div>
      </div>

      {/* 🧱 Tabla escritorio */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">#</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Actividad</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Solicitante</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Gestor</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-5 text-center text-gray-500">
                  Cargando salidas...
                </td>
              </tr>
            ) : filteredSalidas.length > 0 ? (
              filteredSalidas.map((salida, index) => (
                <tr
                  key={salida.idSalida}
                  onClick={() => navigate(`/gestor/salida/${salida.idSalida}`)}
                  className="border-b hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="py-3 px-4 text-gray-700 text-sm">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{salida.actividad}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {salida.usuarioSolicitante?.nombre} {salida.usuarioSolicitante?.apellidos}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {salida.usuarioGestor?.nombre} {salida.usuarioGestor?.apellidos}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {new Date(salida.fecha).toLocaleString("es-CO")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-5 text-center text-gray-500">
                  No hay salidas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📱 Móvil */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-500">Cargando salidas...</p>
        ) : filteredSalidas.length > 0 ? (
          filteredSalidas.map((salida) => (
            <div
              key={salida.idSalida}
              onClick={() => navigate(`/gestor/salida/${salida.idSalida}`)}
              className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">{salida.actividad}</span>
                <span className="text-xs text-gray-500">
                  {new Date(salida.fecha).toLocaleDateString("es-CO")}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Solicitante:</strong>{" "}
                {salida.usuarioSolicitante?.nombre} {salida.usuarioSolicitante?.apellidos}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Gestor:</strong>{" "}
                {salida.usuarioGestor?.nombre} {salida.usuarioGestor?.apellidos}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No hay salidas registradas.</p>
        )}
      </div>
    </div>
  );
}
