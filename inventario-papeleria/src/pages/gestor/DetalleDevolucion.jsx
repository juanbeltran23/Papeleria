import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import { ArrowLeft, CornerUpLeft } from "lucide-react";

export default function DetalleDevoluciones({ rol = "gestor" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devolucion, setDevolucion] = useState(null);
  const [devolucionItems, setDevolucionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firmaCargando, setFirmaCargando] = useState(true);

  useEffect(() => {
    fetchDevolucion();
  }, [id]);

  async function fetchDevolucion() {
    try {
      setLoading(true);

      const [devolucionResp, itemsResp] = await Promise.all([
        supabase
          .from("devolucion")
          .select(`
            *,
            usuarioSolicitante:idUsuarioSolicitante(nombre, apellidos, cedula),
            usuarioGestor:idUsuarioGestor(nombre, apellidos)
          `)
          .eq("idDevolucion", id)
          .single(),
        supabase
          .from("devolucionItem")
          .select(`
            idDevolucionItem,
            cantidad,
            item: idItem (nombre, codigo)
          `)
          .eq("idDevolucion", id),
      ]);

      if (devolucionResp.error) throw devolucionResp.error;
      if (itemsResp.error) throw itemsResp.error;

      setDevolucion(devolucionResp.data);
      setDevolucionItems(itemsResp.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar la devolución");
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500 animate-pulse">
        Cargando devolución...
      </p>
    );

  if (!devolucion)
    return (
      <p className="text-center mt-10 text-gray-500">
        No se encontró la devolución.
      </p>
    );

  // Ruta de regreso según rol
  const rutaVolver = rol === "admin" ? "/admin/movimientos" : "/gestor/devoluciones";

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
          <CornerUpLeft className="text-blue-600" /> Detalle de Devolución
        </h2>

        {/* Información principal */}
        <div className="space-y-4 text-sm sm:text-base">
          <p><strong>Observación:</strong> {devolucion.observacion || "—"}</p>
          <p>
            <strong>Solicitante:</strong>{" "}
            {devolucion.usuarioSolicitante?.nombre}{" "}
            {devolucion.usuarioSolicitante?.apellidos} (
            {devolucion.usuarioSolicitante?.cedula})
          </p>
          <p>
            <strong>Gestor:</strong>{" "}
            {devolucion.usuarioGestor?.nombre} {devolucion.usuarioGestor?.apellidos}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {new Date(devolucion.fecha).toLocaleString("es-CO", {
              timeZone: "America/Bogota",
            })}
          </p>

          {/* Firma con skeleton */}
          {devolucion.firma && (
            <div>
              <strong>Firma del solicitante:</strong>
              <div className="mt-2 h-24 w-48 border rounded-lg shadow-sm bg-gray-100 flex items-center justify-center relative">
                {firmaCargando && (
                  <span className="animate-pulse text-gray-400 text-sm">
                    Cargando firma...
                  </span>
                )}
                <img
                  src={devolucion.firma}
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
            <div className="hidden sm:grid sm:grid-cols-3 font-semibold text-sm text-slate-600 pb-2 border-b">
              <span>Ítem</span>
              <span className="text-center">Cantidad</span>
              <span className="text-center">Código</span>
            </div>

            {/* Versión móvil */}
            <div className="sm:hidden space-y-3">
              {devolucionItems.map((i) => (
                <div
                  key={i.idDevolucionItem}
                  className="p-3 bg-white rounded-lg shadow-sm border border-slate-200"
                >
                  <p className="font-medium text-slate-800">{i.item?.nombre}</p>
                  <p className="text-sm text-slate-600">
                    <strong>Cantidad:</strong> {i.cantidad}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Código:</strong> {i.item?.codigo}
                  </p>
                </div>
              ))}
            </div>

            {/* Versión escritorio */}
            <div className="hidden sm:block">
              {devolucionItems.map((i) => (
                <div
                  key={i.idDevolucionItem}
                  className="grid grid-cols-3 items-center py-2 border-b last:border-0 text-sm hover:bg-purple-50 transition"
                >
                  <span>{i.item?.nombre}</span>
                  <span className="text-center">{i.cantidad}</span>
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
