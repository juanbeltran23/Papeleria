import { useEffect, useState } from "react";
import { getInventarioDetalle } from "../../services/inventarioService";
import { toast } from "react-toastify";
import { ClipboardList, ArrowLeft } from "lucide-react";

export default function ReporteInventario({ idInventario, onVolver }) {
  const [detalles, setDetalles] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getInventarioDetalle(idInventario);
        setDetalles(data);
      } catch (err) {
        console.error("Error al cargar el reporte:", err);
        toast.error("Error al cargar el reporte");
      }
    };
    cargar();
  }, [idInventario]);

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Encabezado */}
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-blue-600" />
        Reporte de Inventario
      </h2>

      {/* Tabla desktop */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow border border-slate-200 hidden sm:block">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4 text-center">Stock Sistema</th>
              <th className="py-3 px-4 text-center">Stock Contado</th>
              <th className="py-3 px-4 text-center">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {detalles.length === 0 && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-500">
                  No hay registros
                </td>
              </tr>
            )}
            {detalles.map((d) => {
              const diferencia = d.stockContado - d.stockSistema;
              return (
                <tr
                  key={d.idDetalleInventario}
                  className="border-b hover:bg-blue-50 transition"
                >
                  <td className="py-3 px-4">{d.item?.nombre || "—"}</td>
                  <td className="py-3 px-4">{d.item?.codigo || "—"}</td>
                  <td className="py-3 px-4">{d.item?.categoria?.nombre || "—"}</td>
                  <td className="py-3 px-4 text-center">{d.stockSistema}</td>
                  <td className="py-3 px-4 text-center">{d.stockContado}</td>
                  <td
                    className={`py-3 px-4 text-center font-semibold ${
                      diferencia === 0
                        ? "text-green-600"
                        : diferencia > 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {diferencia}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista móvil: tarjetas */}
      <div className="sm:hidden space-y-4">
        {detalles.length === 0 && (
          <p className="text-center text-gray-500">No hay registros</p>
        )}
        {detalles.map((d) => {
          const diferencia = d.stockContado - d.stockSistema;
          return (
            <div
              key={d.idDetalleInventario}
              className="bg-white rounded-xl shadow border border-slate-200 p-4"
            >
              <p className="font-semibold text-slate-800">{d.item?.nombre || "—"}</p>
              <p className="text-sm text-slate-600">Código: {d.item?.codigo || "—"}</p>
              <p className="text-sm text-slate-600">
                Categoría: {d.item?.categoria?.nombre || "—"}
              </p>
              <p className="text-sm text-slate-600">Stock sistema: {d.stockSistema}</p>
              <p className="text-sm text-slate-600">Stock contado: {d.stockContado}</p>
              <p
                className={`text-sm font-semibold mt-1 ${
                  diferencia === 0
                    ? "text-green-600"
                    : diferencia > 0
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                Diferencia: {diferencia}
              </p>
            </div>
          );
        })}
      </div>

      {/* Botón volver */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onVolver}
          className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>
    </div>
  );
}
