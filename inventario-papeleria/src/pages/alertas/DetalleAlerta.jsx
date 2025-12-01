import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAlertaById, markAlertaInactiva } from "../../services/alertaService";
import { ArrowLeft } from "lucide-react";

export default function AlertDetail() {
  const { id } = useParams();
  const [alerta, setAlerta] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerta();
  }, [id]);

  const fetchAlerta = async () => {
    setLoading(true);
    try {
      const data = await getAlertaById(id);
      setAlerta(data);
    } catch (err) {
      console.error("Error cargando alerta:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkInactive = async () => {
    try {
      await markAlertaInactiva(id);
      // Refetch to update UI
      await fetchAlerta();
    } catch (err) {
      console.error("Error marcando inactiva:", err.message);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="bg-white rounded-2xl shadow-md p-6">
        {loading || !alerta ? (
          <p className="text-gray-500">Cargando alerta...</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-800">{alerta.tipo}</h2>
              <span className="text-sm text-gray-500">{alerta.estado}</span>
            </div>

            <p className="text-gray-700">{alerta.mensaje}</p>

            <p className="text-sm text-gray-500">{alerta.fecha ? new Date(alerta.fecha).toLocaleString("es-CO") : "-"}</p>

            {alerta.estado === "activa" && (
              <div className="pt-4">
                <button
                  onClick={handleMarkInactive}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
                >
                  Marcar como inactiva
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
