import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { getSalidaItemsBySalidaId } from "../../services/salidasService";
import { toast } from "react-toastify";
import { ArrowLeft, ClipboardList } from "lucide-react";

export default function DetalleSalida({ rol = "gestor" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salida, setSalida] = useState(null);
  const [salidaItems, setSalidaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firmaCargando, setFirmaCargando] = useState(true);

  useEffect(() => {
    fetchSalida();
  }, [id]);

  async function fetchSalida() {
    try {
      setLoading(true);

      // Cargar salida e ítems en paralelo
      const [salidaResp, itemsData] = await Promise.all([
        supabase
          .from("salida")
          .select(`
            *,
            usuarioSolicitante:idUsuarioSolicitante(nombre, apellidos, cedula),
            usuarioGestor:idUsuarioGestor(nombre, apellidos)
          `)
          .eq("idSalida", id)
          .single(),
        getSalidaItemsBySalidaId(id),
      ]);

      if (salidaResp.error) throw salidaResp.error;
      setSalida(salidaResp.data);
      setSalidaItems(itemsData);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar los datos de la salida");
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500 animate-pulse">
        Cargando salida...
      </p>
    );

  if (!salida)
    return (
      <p className="text-center mt-10 text-gray-500">
        No se encontró la salida.
      </p>
    );

  // Ruta de regreso según rol
  const rutaVolver = rol === "admin" ? "/admin/movimientos" : "/gestor/salidas";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md border border-slate-100 p-6 sm:p-8 relative">
        {/* Botón volver */}
        <button
          onClick={() => navigate(rutaVolver)}
          className="absolute top-4 left-4 text-slate-500 hover:text-blue-600 flex items-center gap-1 text-sm sm:text-base"
        >
          <ArrowLeft size={18} /> Volver
        </button>

        <br />

        <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <ClipboardList className="text-blue-600" /> Detalle de Salida
        </h2>

        {/* Información principal */}
        <div className="space-y-4 text-sm sm:text-base">
          <p>
            <strong>Actividad:</strong> {salida.actividad}
          </p>
          <p>
            <strong>Solicitante:</strong>{" "}
            {salida.usuarioSolicitante?.nombre}{" "}
            {salida.usuarioSolicitante?.apellidos} (
            {salida.usuarioSolicitante?.cedula})
          </p>
          <p>
            <strong>Gestor:</strong>{" "}
            {salida.usuarioGestor?.nombre} {salida.usuarioGestor?.apellidos}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {new Date(salida.fecha).toLocaleString("es-CO", {
              timeZone: "America/Bogota",
            })}
          </p>

          {/* Firma con skeleton */}
          {salida.firma && (
            <div>
              <strong>Firma del solicitante:</strong>
              <div className="mt-2 h-24 w-48 border rounded-lg shadow-sm bg-gray-100 flex items-center justify-center relative">
                {firmaCargando && (
                  <span className="animate-pulse text-gray-400 text-sm">
                    Cargando firma...
                  </span>
                )}
                <img
                  src={salida.firma}
                  alt="Firma"
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-contain rounded-lg ${
                    firmaCargando ? "opacity-0" : "opacity-100"
                  } transition-opacity duration-500`}
                  onLoad={() => setFirmaCargando(false)}
                  onError={() => {
                    setFirmaCargando(false);
                    toast.error("Error al cargar la firma");
                  }}
                />
              </div>
            </div>
          )}

          {/* Tabla responsive de items */}
          <div className="border rounded-lg p-3 bg-slate-50 mt-4 overflow-x-auto">
            {/* Encabezado desktop */}
            <div className="hidden sm:grid sm:grid-cols-4 font-semibold text-sm text-slate-600 pb-2 border-b">
              <span>Ítem</span>
              <span className="text-center">Cant. requerida</span>
              <span className="text-center">Cant. despachada</span>
              <span className="text-center">Código</span>
            </div>

            {/* Versión móvil */}
            <div className="sm:hidden space-y-3">
              {salidaItems.map((i) => (
                <div
                  key={i.idSalidaItem}
                  className="p-3 bg-white rounded-lg shadow-sm border border-slate-200"
                >
                  <p className="font-medium text-slate-800">{i.item?.nombre}</p>
                  <p className="text-sm text-slate-600">
                    <strong>Requerida:</strong> {i.cantidadRequerida}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Despachada:</strong> {i.cantidadDespachada}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Código:</strong> {i.item?.codigo}
                  </p>
                </div>
              ))}
            </div>

            {/* Versión escritorio */}
            <div className="hidden sm:block">
              {salidaItems.map((i) => (
                <div
                  key={i.idSalidaItem}
                  className="grid grid-cols-4 items-center py-2 border-b last:border-0 text-sm hover:bg-blue-50 transition"
                >
                  <span>{i.item?.nombre}</span>
                  <span className="text-center">{i.cantidadRequerida}</span>
                  <span className="text-center">{i.cantidadDespachada}</span>
                  <span className="text-center">{i.item?.codigo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
