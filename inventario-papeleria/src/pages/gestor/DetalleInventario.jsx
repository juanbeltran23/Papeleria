import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInventarioDetalles, saveDetalle, finalizarInventario } from "../../services/inventarioService";
import { getItems } from "../../services/itemsService";
import { toast } from "react-toastify";

export default function InventarioDetalle() {
  const { id } = useParams(); // idInventario
  const navigate = useNavigate();
  const [detalles, setDetalles] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargar();
    cargarItems();
  }, [id]);

  async function cargar() {
    try {
      const d = await getInventarioDetalles(id);
      setDetalles(d || []);
    } catch {
      toast.error("Error al cargar detalles.");
    }
  }

  async function cargarItems() {
    try {
      const all = await getItems();
      setAvailableItems(all || []);
    } catch {
      // no fatal
    }
  }

  async function handleAgregarItem(item) {
    // agregar con stockContado = stockSistema por defecto para editar
    try {
      await saveDetalle({ idInventario: parseInt(id), idItem: item.idItem, stockContado: item.stockReal });
      toast.success("Ítem agregado al inventario.");
      cargar();
      setQuery("");
    } catch {
      toast.error("Error al agregar ítem.");
    }
  }

  async function handleGuardarContado(det, valor) {
    try {
      await saveDetalle({ idInventario: parseInt(id), idItem: det.idItem, stockContado: parseInt(valor) || 0 });
      toast.success("Conteo guardado.");
      cargar();
    } catch {
      toast.error("Error al guardar conteo.");
    }
  }

  async function handleFinalizar() {
    if (!confirm("¿Finalizar inventario? Esto generará ajustes y actualizará stock.")) return;
    try {
      setLoading(true);
      const res = await finalizarInventario({ idInventario: parseInt(id) });
      toast.success(`Inventario finalizado. Ajustes: ${res.totalAjustes}`);
      navigate("/inventario");
    } catch (err) {
      console.error(err);
      toast.error("Error al finalizar inventario.");
    } finally {
      setLoading(false);
    }
  }

  // búsqueda rápida por nombre / código para agregar ítems (parcial)
  const filtered = query.trim()
    ? availableItems.filter(i =>
        i.nombre.toLowerCase().includes(query.toLowerCase()) ||
        (i.codigo || "").toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/inventario")} className="text-slate-600">Volver</button>
          <h2 className="text-lg font-semibold">Inventario #{id}</h2>
        </div>

        <div className="mb-4">
          <label className="text-sm text-slate-600">Agregar ítem (nombre o código)</label>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full border rounded p-2 mt-1" placeholder="Buscar item..." />
          {filtered.length > 0 && (
            <ul className="bg-white border rounded mt-1 max-h-40 overflow-auto">
              {filtered.map(item => (
                <li key={item.idItem} onClick={() => handleAgregarItem(item)} className="p-2 hover:bg-slate-50 cursor-pointer">
                  {item.nombre} — {item.codigo || "—"} <span className="text-xs text-slate-400">stock: {item.stockReal ?? 0}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Detalles del conteo</h3>

          {detalles.length === 0 && <div className="text-slate-500">No hay ítems agregados aún.</div>}

          <div className="space-y-2">
            {detalles.map(det => (
              <div key={det.idDetalleInventario} className="flex items-center justify-between bg-slate-50 p-3 rounded">
                <div>
                  <div className="font-medium">{det.item?.nombre}</div>
                  <div className="text-xs text-slate-400">Sistema: {det.stockSistema ?? det.item?.stockReal ?? 0}</div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    defaultValue={det.stockContado ?? ""}
                    onBlur={(e) => handleGuardarContado(det, e.target.value)}
                    className="w-28 border rounded p-1 text-center"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleFinalizar} disabled={loading} className="flex-1 bg-red-600 text-white py-2 rounded">
            {loading ? "Finalizando..." : "Finalizar inventario y aplicar ajustes"}
          </button>
          <button onClick={() => navigate("/inventario")} className="flex-1 bg-gray-100 py-2 rounded">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
