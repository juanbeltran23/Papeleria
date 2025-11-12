import { useEffect, useState } from "react";
import { createEntrada } from "../../services/entradasService";
import { getItems } from "../../services/itemsService";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Package,
  ClipboardList,
  CheckCircle2,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RegistrarEntrada() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    idItem: "",
    cantidad: "",
    factura: "",
    observacion: "",
  });
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData?.user);

      const data = await getItems();
      setItems(data);
    } catch (err) {
      toast.error("Error al cargar los datos.");
    }
  }

  // 🔍 Búsqueda dinámica (nombre o código)
  function handleSearch(e) {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setFilteredItems([]);
      return;
    }

    const filtered = items.filter(
      (i) =>
        i.nombre.toLowerCase().includes(value.toLowerCase()) ||
        i.codigo?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredItems(filtered);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.idItem) {
      toast.warning("Selecciona un ítem válido antes de registrar.");
      return;
    }

    if (!form.cantidad || parseInt(form.cantidad) <= 0) {
      toast.warning("Ingresa una cantidad válida.");
      return;
    }

    try {
      setLoading(true);

      await createEntrada({
        idUsuarioGestor: user?.id,
        idItem: form.idItem,
        cantidad: parseInt(form.cantidad),
        factura: form.factura,
        observacion: form.observacion,
      });

      toast.success("✅ Entrada registrada correctamente.");
      navigate("/gestor/entradas")
    } catch (err) {
      console.error(err);
      toast.error("❌ Error al registrar la entrada.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md border border-slate-100 p-8 relative">
        {/* Botón volver */}
        <button
          onClick={() => navigate("/gestor/entradas")}
          className="absolute top-4 left-4 text-slate-500 hover:text-blue-600 flex items-center gap-1"
        >
          <ArrowLeft size={18} /> Volver
        </button>

        <br/>

        <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <ClipboardList className="text-blue-600" /> Registrar Entrada
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 🔍 Campo de búsqueda de ítem */}
          <div className="relative">
            <label className="text-sm font-medium text-slate-500">
              Buscar Ítem
            </label>
            <div className="flex items-center gap-2 mt-1">
              <Search size={18} className="text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder="Escribe nombre o código del ítem..."
                value={query}
                onChange={handleSearch}
                className="w-full border border-blue-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>

            {filteredItems.length > 0 && (
              <ul className="absolute z-10 bg-white border border-slate-200 rounded-lg mt-1 w-full max-h-48 overflow-auto shadow-md">
                {filteredItems.map((item) => (
                  <li
                    key={item.idItem}
                    onClick={() => {
                      setForm({ ...form, idItem: item.idItem });
                      setQuery(`${item.nombre} (${item.codigo || "sin código"})`);
                      setFilteredItems([]);
                    }}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                  >
                    <Package size={16} className="text-slate-400" />
                    <span className="flex flex-col text-sm">
                      <span className="font-medium text-slate-700">{item.nombre}</span>
                      <span className="text-xs text-slate-400">
                        Código: {item.codigo || "—"} | Categoría:{" "}
                        {item.categoria?.nombre || "Sin categoría"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="text-sm font-medium text-slate-500">Cantidad</label>
            <input
              type="number"
              min="1"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-300 outline-none"
              required
            />
          </div>

          {/* Factura */}
          <div>
            <label className="text-sm font-medium text-slate-500">Factura</label>
            <input
              type="text"
              value={form.factura}
              onChange={(e) => setForm({ ...form, factura: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-300 outline-none"
              placeholder="Ej: FAC-00123"
            />
          </div>

          {/* Observación */}
          <div>
            <label className="text-sm font-medium text-slate-500">Observación</label>
            <textarea
              rows="3"
              value={form.observacion}
              onChange={(e) => setForm({ ...form, observacion: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-300 outline-none resize-none"
              placeholder="Escribe una observación opcional..."
            ></textarea>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <CheckCircle2 size={20} />
            {loading ? "Registrando..." : "Registrar Entrada"}
          </button>
        </form>
      </div>
    </div>
  );
}
