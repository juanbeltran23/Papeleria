import { useState } from "react";
import { getSalidas, getEntradas, getMovimientos, getDevoluciones, getSolicitudes, getItemsReport } from "../../services/reportService";

function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) {
    alert("No hay datos para exportar");
    return;
  }
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

function printReport(html) {
  const w = window.open('', '_blank');
  w.document.write('<html><head><title>Reporte</title>');
  w.document.write('<style>body{font-family:Inter,Arial,Helvetica,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}</style>');
  w.document.write('</head><body>');
  w.document.write(html);
  w.document.write('</body></html>');
  w.document.close();
  w.print();
}

export default function Reports() {
  const [type, setType] = useState('salidas');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const startIso = start ? new Date(start).toISOString() : null;
      const endIso = end ? new Date(new Date(end).setDate(new Date(end).getDate()+1)).toISOString() : null;
      let data = [];
      if (type === 'salidas') {
        const raw = await getSalidas({ startIso, endIso });
        data = (raw || []).map(s => ({
          id: s.idSalida,
          fecha: s.fecha,
          actividad: s.actividad,
          items: (s.salidaItem || []).map(si => ({ idItem: si.idItem, cantidadDespachada: si.cantidadDespachada })),
        }));
      }

      if (type === 'entradas') {
        const raw = await getEntradas({ startIso, endIso });
        data = (raw || []).map(e => ({
          id: e.idEntrada,
          fecha: e.fecha,
          item: e.item ? { idItem: e.idItem, nombre: e.item.nombre, codigo: e.item.codigo, imagen: e.item.imagen } : null,
          cantidad: e.cantidad,
          factura: e.factura,
          observacion: e.observacion,
        }));
      }

      if (type === 'movimientos') {
        const raw = await getMovimientos({ startIso, endIso });
        data = (raw || []).map(m => ({
          id: m.idMovimiento,
          fecha: m.fecha,
          tipo: m.tipo,
          item: m.item ? { idItem: m.idItem, nombre: m.item.nombre, codigo: m.item.codigo } : null,
          cantidad: m.cantidad,
          descripcion: m.descripcion,
        }));
      }

      if (type === 'devoluciones') {
        const raw = await getDevoluciones({ startIso, endIso });
        data = (raw || []).map(d => ({
          id: d.idDevolucion,
          fecha: d.fecha,
          observacion: d.observacion,
          items: (d.devolucionItem || []).map(di => ({ idItem: di.idItem, cantidad: di.cantidad })),
        }));
      }

      if (type === 'solicitudes') {
        const raw = await getSolicitudes({ startIso, endIso });
        data = (raw || []).map(s => ({
          id: s.idSolicitud,
          fecha: s.fechaSolicitud,
          actividad: s.actividad,
          estado: s.estado,
        }));
      }

      if (type === 'items') {
        // For items we want aggregated counts: entradas, salidas, devoluciones per item
        const items = await getItemsReport({});
        const entradas = await getEntradas({ startIso, endIso });
        const salidas = await getSalidas({ startIso, endIso });
        const devoluciones = await getDevoluciones({ startIso, endIso });

        // Build maps
        const entradasMap = {};
        (entradas || []).forEach(e => {
          const id = e.idItem;
          entradasMap[id] = (entradasMap[id] || 0) + (e.cantidad || 0);
        });

        const salidasMap = {};
        (salidas || []).forEach(s => {
          (s.salidaItem || []).forEach(si => {
            const id = si.idItem;
            salidasMap[id] = (salidasMap[id] || 0) + (si.cantidadDespachada || 0);
          });
        });

        const devolMap = {};
        (devoluciones || []).forEach(d => {
          (d.devolucionItem || []).forEach(di => {
            const id = di.idItem;
            devolMap[id] = (devolMap[id] || 0) + (di.cantidad || 0);
          });
        });

        data = (items || []).map(it => ({
          idItem: it.idItem,
          imagen: it.imagen,
          codigo: it.codigo,
          nombre: it.nombre,
          stockReal: it.stockReal,
          stockMinimo: it.stockMinimo,
          entradas: entradasMap[it.idItem] || 0,
          salidas: salidasMap[it.idItem] || 0,
          devoluciones: devolMap[it.idItem] || 0,
        }));
      }

      setResults(data || []);
    } catch (err) {
      console.error(err);
      alert('Error al generar reporte: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Reportes</h1>
      <div className="bg-white rounded-2xl shadow p-4 mb-4">
        <div className="flex items-center gap-3">
          <select value={type} onChange={(e) => setType(e.target.value)} className="border px-2 py-1 rounded">
            <option value="salidas">Salidas</option>
            <option value="entradas">Entradas</option>
            <option value="movimientos">Movimientos</option>
            <option value="devoluciones">Devoluciones</option>
            <option value="solicitudes">Solicitudes</option>
            <option value="items">Items</option>
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
          <div className="flex items-center gap-2">
            <button onClick={() => downloadCSV(`${type}-report.csv`, results)} className="bg-green-600 text-white px-3 py-1 rounded">Exportar CSV</button>
            <button onClick={() => printReport(`<h1>Reporte: ${type}</h1>` + JSON.stringify(results, null, 2))} className="bg-gray-600 text-white px-3 py-1 rounded">Exportar/Imprimir</button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[60vh]">
          {type === 'items' ? (
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left text-sm text-gray-600">Imagen</th>
                  <th className="py-2 px-3 text-left text-sm text-gray-600">Código</th>
                  <th className="py-2 px-3 text-left text-sm text-gray-600">Nombre</th>
                  <th className="py-2 px-3 text-left text-sm text-gray-600">Stock</th>
                  <th className="py-2 px-3 text-left text-sm text-gray-600">Entradas</th>
                  <th className="py-2 px-3 text-left text-sm text-gray-600">Salidas</th>
                  <th className="py-2 px-3 text-left text-sm text-gray-600">Devoluciones</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td className="py-4 text-center text-gray-500" colSpan={7}>No hay resultados.</td></tr>
                ) : results.map((row) => (
                  <tr key={row.idItem} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm">
                      {row.imagen ? (
                        <img src={row.imagen} alt={row.nombre} className="h-12 w-12 object-cover rounded" />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 flex items-center justify-center text-gray-400 rounded">—</div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-sm">{row.codigo}</td>
                    <td className="py-2 px-3 text-sm">{row.nombre}</td>
                    <td className="py-2 px-3 text-sm">{row.stockReal ?? '-' } / {row.stockMinimo ?? '-'}</td>
                    <td className="py-2 px-3 text-sm">{row.entradas}</td>
                    <td className="py-2 px-3 text-sm">{row.salidas}</td>
                    <td className="py-2 px-3 text-sm">{row.devoluciones}</td>
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
                      <td key={k} className="py-2 px-3 text-sm">
                        {renderCell(row[k])}
                      </td>
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

function renderCell(value) {
  if (value == null) return '-';
  // detect ISO datetime strings and format to America/Bogota
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDateTime(value);
  if (typeof value === 'object') {
    // handle arrays of items
    if (Array.isArray(value)) return value.map(v => {
      if (v.nombre) return `${v.nombre} (${v.cantidad ?? v.cantidadDespachada ?? ''})`;
      if (v.idItem) return `Item ${v.idItem}: ${v.cantidad ?? v.cantidadDespachada ?? ''}`;
      return JSON.stringify(v);
    }).join(', ');
    return JSON.stringify(value);
  }
  return String(value);
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
