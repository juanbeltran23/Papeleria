// src/components/trazabilidad/TodosMovimientos.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";

export default function TodosMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [idItem, setIdItem] = useState("");
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    cargarMovimientos();
  }, [fechaDesde, fechaHasta, idItem, categoria]);

  async function cargarMovimientos() {
    try {
      setLoading(true);
      let query = supabase
        .from("movimiento")
        .select(`
          idMovimiento,
          tipo,
          referenciaTipo,
          idReferencia,
          idItem,
          cantidad,
          fecha,
          descripcion,
          item: idItem (
            nombre,
            codigo,
            categoria ( nombre )
          )
        `)
        .order("fecha", { ascending: false });

      if (fechaDesde) query = query.gte("fecha", fechaDesde);
      if (fechaHasta) query = query.lte("fecha", fechaHasta);
      if (idItem) query = query.eq("idItem", idItem);
      if (categoria) query = query.eq("item.categoria.nombre", categoria);

      const { data, error } = await query;
      if (error) throw error;
      setMovimientos(data);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar movimientos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Todos los Movimientos</h3>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300" />
        <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300" />
        <input type="number" placeholder="ID Ítem" value={idItem} onChange={(e) => setIdItem(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300" />
        <input type="text" placeholder="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300" />
      </div>

      {/* Tabla desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="py-2 px-3">Tipo</th>
              <th className="py-2 px-3">Fecha</th>
              <th className="py-2 px-3">Ítem</th>
              <th className="py-2 px-3">Categoría</th>
              <th className="py-2 px-3">Cantidad</th>
              <th className="py-2 px-3">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="py-4 text-center text-gray-500">Cargando...</td></tr>
            )}
            {!loading && movimientos.length === 0 && (
              <tr><td colSpan={6} className="py-4 text-center text-gray-500">Sin resultados</td></tr>
            )}
            {!loading && movimientos.map((m) => (
              <tr key={m.idMovimiento} className="border-b hover:bg-blue-50 transition">
                <td className="py-2 px-3 capitalize">{m.tipo}</td>
                <td className="py-2 px-3">{new Date(m.fecha).toLocaleString("es-CO")}</td>
                <td className="py-2 px-3">{m.item?.nombre} ({m.item?.codigo})</td>
                <td className="py-2 px-3">{m.item?.categoria?.nombre || "—"}</td>
                <td className="py-2 px-3">{m.cantidad}</td>
                <td className="py-2 px-3">{m.descripcion || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas móvil */}
      <div className="sm:hidden space-y-3">
        {loading && <p className="text-center text-gray-500">Cargando...</p>}
        {!loading && movimientos.length === 0 && <p className="text-center text-gray-500">Sin resultados</p>}
        {!loading && movimientos.map((m) => (
          <div key={m.idMovimiento} className="bg-white rounded-lg shadow p-3 border border-slate-200">
            <p className="font-semibold text-slate-800 capitalize">{m.tipo}</p>
            <p className="text-sm text-slate-600">{new Date(m.fecha).toLocaleString("es-CO")}</p>
            <p className="text-sm text-slate-600"><strong>Ítem:</strong> {m.item?.nombre} ({m.item?.codigo})</p>
            <p className="text-sm text-slate-600"><strong>Categoría:</strong> {m.item?.categoria?.nombre || "—"}</p>
            <p className="text-sm text-slate-600"><strong>Cantidad:</strong> {m.cantidad}</p>
            <p className="text-sm text-slate-600"><strong>Descripción:</strong> {m.descripcion || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
