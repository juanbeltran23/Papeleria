import { useState } from "react";
import { getItemsReport, getMovimientos } from "../../services/reportService";

function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) return alert('No hay datos');
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String(r[k] ?? '')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function ReportsGestor() {
  const [type, setType] = useState('inventario');
  const [results, setResults] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const run = async () => {
    try {
      if (type === 'inventario') {
        const data = await getItemsReport({});
        // map to simpler rows with image
        const rows = (data || []).map(it => ({
          idItem: it.idItem,
          imagen: it.imagen,
          codigo: it.codigo,
          nombre: it.nombre,
          stockReal: it.stockReal,
          stockMinimo: it.stockMinimo,
        }));
        setResults(rows || []);
      } else if (type === 'movimientos') {
        const startIso = start ? new Date(start).toISOString() : null;
        const endIso = end ? new Date(new Date(end).setDate(new Date(end).getDate()+1)).toISOString() : null;
        const data = await getMovimientos({ startIso, endIso });
        const rows = (data || []).map(m => ({
          id: m.idMovimiento,
          fecha: formatDateTime(m.fecha),
          tipo: m.tipo,
          item: m.item ? m.item.nombre : (m.idItem || '-'),
          cantidad: m.cantidad,
          descripcion: m.descripcion,
        }));
        setResults(rows || []);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Reportes Gestor</h1>
      <div className="bg-white rounded-2xl shadow p-4 mb-4">
        <div className="flex items-center gap-3">
          <select value={type} onChange={(e) => setType(e.target.value)} className="border px-2 py-1 rounded">
            <option value="inventario">Inventario</option>
            <option value="movimientos">Movimientos</option>
          </select>

          <label className="text-sm text-gray-600">Desde</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border px-2 py-1 rounded" />
          <label className="text-sm text-gray-600">Hasta</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border px-2 py-1 rounded" />

          <button onClick={run} className="ml-auto bg-blue-600 text-white px-4 py-1 rounded">Generar</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Resultados ({results.length})</h2>
          <button onClick={() => downloadCSV('gestor-report.csv', results)} className="bg-green-600 text-white px-3 py-1 rounded">Exportar CSV</button>
        </div>

        <div className="overflow-x-auto max-h-[60vh]">
          {type === 'inventario' ? (
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left text-sm text-gray-600">Imagen</th>
                  <th className="py-2 px-3 text-left text-sm text-gray-600">Código</th>
                  <th className="py-2 px-3 text-left text-sm text-gray-600">Nombre</th>
                  <th className="py-2 px-3 text-left text-sm text-gray-600">Stock</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td className="py-4 text-center text-gray-500" colSpan={4}>No hay resultados.</td></tr>
                ) : results.map(row => (
                  <tr key={row.idItem} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm">{row.imagen ? <img src={row.imagen} alt={row.nombre} className="h-10 w-10 object-cover rounded" /> : <div className="h-10 w-10 bg-gray-100 rounded" />}</td>
                    <td className="py-2 px-3 text-sm">{row.codigo}</td>
                    <td className="py-2 px-3 text-sm">{row.nombre}</td>
                    <td className="py-2 px-3 text-sm">{row.stockReal ?? '-'} / {row.stockMinimo ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  {results.length > 0 ? Object.keys(results[0]).map((k) => (
                    <th key={k} className="py-2 px-3 text-left text-sm text-gray-600">{k}</th>
                  )) : (<th className="py-2 px-3 text-left text-sm text-gray-600">-</th>)}
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td className="py-4 text-center text-gray-500">No hay resultados.</td></tr>
                ) : results.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    {Object.keys(results[0]).map((k) => (
                      <td key={k} className="py-2 px-3 text-sm">{String(row[k] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDateTime(iso) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(d);
  } catch (e) {
    return iso;
  }
}
