import { useEffect, useState } from "react";
import { getAlertasPorUsuario } from "../../services/alertaService";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

export default function AlertHistory() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    setLoading(true);
    try {
      const data = await getAlertasPorUsuario();
      setAlertas(data);
    } catch (err) {
      console.error("Error cargando alertas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="text-yellow-500" />
        <h1 className="text-2xl font-semibold text-slate-800">Historial de Alertas</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">#</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Tipo</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Mensaje</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Fecha</th>
              <th className="py-3 px-4 text-left text-gray-600 text-sm font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-5 text-center text-gray-500">Cargando alertas...</td>
              </tr>
            ) : alertas.length > 0 ? (
              alertas.map((a, i) => (
                <tr
                  key={a.idAlerta}
                  onClick={() => navigate(`/alertas/${a.idAlerta}`)}
                  className="border-b hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="py-3 px-4 text-gray-700 text-sm">{i + 1}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{a.tipo}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{a.mensaje}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{a.fecha ? new Date(a.fecha).toLocaleString("es-CO") : "-"}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{a.estado}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-5 text-center text-gray-500">No hay alertas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
