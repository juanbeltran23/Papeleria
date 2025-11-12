export default function SolicitudDetalle({ solicitud }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Solicitud #{solicitud.idSolicitud}</h3>
          <div className="text-sm text-slate-500">{solicitud.actividad}</div>
        </div>
        <div className="text-sm text-slate-400">Estado: <span className={`px-2 py-1 rounded ${solicitud.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" : solicitud.estado === "aprobada" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{solicitud.estado}</span></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Solicitante</h4>
          <div className="text-sm">{solicitud.usuarioSolicitante?.nombre || solicitud.usuarioSolicitante?.correo}</div>
          <div className="text-xs text-slate-400">Fecha solicitud: {new Date(solicitud.fechaSolicitud).toLocaleString()}</div>
        </div>
        <div>
          <h4 className="font-medium">Fecha actividad</h4>
          <div className="text-sm">{solicitud.fechaActividad ? new Date(solicitud.fechaActividad).toLocaleDateString() : "-"}</div>
        </div>
      </div>

      {solicitud.descripcionMaterial && (
        <div>
          <h4 className="font-medium">Descripción (material nuevo)</h4>
          <div className="bg-slate-50 p-3 rounded text-sm text-slate-700">{solicitud.descripcionMaterial}</div>
        </div>
      )}

      <div>
        <h4 className="font-medium">Ítems solicitados</h4>
        {(!solicitud.solicitudItem || solicitud.solicitudItem.length === 0) ? (
          <div className="text-sm text-slate-500">No hay ítems asociados.</div>
        ) : (
          <ul className="space-y-2 mt-2">
            {solicitud.solicitudItem.map(si => (
              <li key={si.idSolicitudItem} className="p-3 bg-white border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">{si.item?.nombre || "Ítem"}</div>
                  <div className="text-xs text-slate-400">Código: {si.item?.codigo || "—"} • Stock: {si.item?.stockReal ?? "—"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Cantidad: <span className="font-semibold">{si.cantidad}</span></div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
