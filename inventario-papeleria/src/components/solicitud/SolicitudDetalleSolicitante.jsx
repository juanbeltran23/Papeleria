export default function SolicitudDetalleSolicitante({ solicitud }) {
  if (!solicitud) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Detalle de la Solicitud</h2>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <p className="text-sm text-gray-600">
          <strong>Actividad:</strong> {solicitud.actividad || "Sin actividad"}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Estado:</strong>{" "}
          <span
            className={`px-2 py-1 rounded text-xs ${
              solicitud.estado === "pendiente"
                ? "bg-yellow-100 text-yellow-800"
                : solicitud.estado === "aprobada"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {solicitud.estado}
          </span>
        </p>
      </div>

      {/* Lista de materiales solicitados */}
      {solicitud.solicitudItem?.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Materiales solicitados</h3>
          <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
            {solicitud.solicitudItem.map((si) => (
              <li key={si.idSolicitudItem}>
                {si.item?.nombre || "Material sin nombre"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Si es material nuevo */}
      {solicitud.descripcionMaterial && (
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Material nuevo</h3>
          <p className="text-sm text-gray-700">{solicitud.descripcionMaterial}</p>
        </div>
      )}
    </div>
  );
}
