import { useEffect, useState } from "react";
import { getCounts, getMovimientosByType, getLowStockItems } from "../../services/adminService";
import { BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 13);
    return d.toISOString().slice(0, 10);
  });
  const [rangeEnd, setRangeEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [movByType, setMovByType] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [c, low] = await Promise.all([
          getCounts(),
          getLowStockItems(6),
        ]);
        // fetch movimientos by type for default range
        const startIso = new Date(rangeStart).toISOString();
        // include full end day by adding 1 day and using < next day
        const endDate = new Date(rangeEnd);
        endDate.setDate(endDate.getDate() + 1);
        const endIso = endDate.toISOString();
        const mv = await getMovimientosByType(startIso, endIso);
        setMovByType(mv);
        setCounts(c);
        setMovimientos([]);
        setLowStock(low);
      } catch (err) {
        console.error("Error cargando estadísticas:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading || !counts) {
    return <div className="p-6 text-gray-600">Cargando estadísticas...</div>;
  }

  // Simple max for tipo chart scaling
  const maxTipo = Math.max(1, ...movByType.map((m) => m.count));
  const svgHeightTipo = 200;
  // increase spacing between bars so labels don't overlap
  const barSpacing = 100; // px per category (adjustable)
  const barWidth = 48;
  const svgWidthTipo = Math.max(300, movByType.length * barSpacing + 32);
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart className="w-6 h-6 text-slate-800" />
        <h1 className="text-2xl font-semibold text-slate-800">Panel de administración</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-sm text-gray-500">Items</div>
          <div className="text-2xl font-semibold">{counts.items}</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-sm text-gray-500">Usuarios</div>
          <div className="text-2xl font-semibold">{counts.usuarios}</div>
        </div>
        <div
          onClick={() => navigate('/admin/solicitudes')}
          className="bg-white rounded-2xl shadow p-4 cursor-pointer hover:shadow-lg transition"
        >
          <div className="text-sm text-gray-500">Solicitudes pendientes</div>
          <div className="text-2xl font-semibold">{counts.solicitudesPendientes}</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-sm text-gray-500">Entradas</div>
          <div className="text-2xl font-semibold">{counts.entradas}</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-sm text-gray-500">Salidas</div>
          <div className="text-2xl font-semibold">{counts.salidas}</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-sm text-gray-500">Ajustes</div>
          <div className="text-2xl font-semibold">{counts.ajustes}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Movimientos por tipo</h2>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-600">Desde</label>
            <input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="border px-2 py-1 rounded" />
            <label className="text-sm text-gray-600">Hasta</label>
            <input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="border px-2 py-1 rounded" />
            <button
              onClick={async () => {
                try {
                  setLoadingTipos(true);
                  const startIso = new Date(rangeStart).toISOString();
                  const endD = new Date(rangeEnd);
                  endD.setDate(endD.getDate() + 1);
                  const endIso = endD.toISOString();
                  const data = await getMovimientosByType(startIso, endIso);
                  setMovByType(data);
                } catch (err) {
                  console.error("Error cargando movimientos por tipo:", err.message);
                } finally {
                  setLoadingTipos(false);
                }
              }}
              className="ml-auto bg-blue-600 text-white px-3 py-1 rounded"
            >
              Filtrar
            </button>
          </div>
          {loadingTipos ? (
            <div className="text-gray-500">Cargando...</div>
          ) : (
            <div className="w-full h-52 overflow-x-auto">
              <svg width={svgWidthTipo} viewBox={`0 0 ${svgWidthTipo} ${svgHeightTipo}`} className="h-52">
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                  <line key={i} x1={0} x2={svgWidthTipo} y1={svgHeightTipo - t * svgHeightTipo} y2={svgHeightTipo - t * svgHeightTipo} stroke="#eee" strokeWidth={1} />
                ))}
                {movByType.map((m, idx) => {
                  const x = idx * barSpacing + 16;
                  const barW = barWidth;
                  const h = (m.count / maxTipo) * (svgHeightTipo - 40);
                  const y = svgHeightTipo - h - 20;
                  return (
                    <g key={m.tipo}>
                      <rect x={x} y={y} width={barW} height={h} rx={6} fill="#0ea5e9" />
                      <text x={x + barW / 2} y={svgHeightTipo - 6} fontSize={11} textAnchor="middle" fill="#374151">{m.tipo}</text>
                      <text x={x + barW / 2} y={y - 6} fontSize={11} textAnchor="middle" fill="#111827">{m.count}</text>
                      <title>{`${m.tipo}: ${m.count}`}</title>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Items con bajo stock</h3>
          {lowStock.length === 0 ? (
            <p className="text-gray-500">No hay items por debajo del stock mínimo.</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((it) => (
                <li key={it.idItem} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{it.nombre}</div>
                    <div className="text-xs text-gray-500">mín: {it.stockMinimo} • actual: {it.stockReal}</div>
                  </div>
                  <div className="text-sm text-red-600 font-semibold">{it.stockReal}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
