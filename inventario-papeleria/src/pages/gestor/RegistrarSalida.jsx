import { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { createSalida } from "../../services/salidasService";
import { getItems } from "../../services/itemsService";
import { supabase } from "../../supabase/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  FileSignature,
  Search,
  CheckCircle2,
  Trash2,
  RotateCcw,
  User2,
  Package,
} from "lucide-react";

export default function RegistrarSalida() {
  const navigate = useNavigate();
  const sigCanvas = useRef(null);

  const [form, setForm] = useState({
    solicitante: "",
    actividad: "",
    firma: null,
    items: [],
  });

  const [solicitantes, setSolicitantes] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredSolicitantes, setFilteredSolicitantes] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [querySolicitante, setQuerySolicitante] = useState("");
  const [queryItem, setQueryItem] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const { data: solicitantes } = await supabase
        .from("usuario")
        .select("idUsuario, nombre, apellidos, cedula")
        .eq("idRol", 3);
      setSolicitantes(solicitantes || []);

      const data = await getItems();
      setItems(data);
    } catch (err) {
      toast.error("Error al cargar los datos.");
    }
  }

  function buscarSolicitante(e) {
    const value = e.target.value;
    setQuerySolicitante(value);
    if (!value.trim()) return setFilteredSolicitantes([]);
    const filtered = solicitantes.filter(
      (s) =>
        s.nombre.toLowerCase().includes(value.toLowerCase()) ||
        s.apellidos.toLowerCase().includes(value.toLowerCase()) ||
        s.cedula.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSolicitantes(filtered);
  }

  function buscarItem(e) {
    const value = e.target.value;
    setQueryItem(value);
    if (!value.trim()) return setFilteredItems([]);
    const filtered = items.filter(
      (i) =>
        i.nombre.toLowerCase().includes(value.toLowerCase()) ||
        i.codigo?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredItems(filtered);
  }

  function agregarItem(item) {
    if (form.items.find((i) => i.idItem === item.idItem)) {
      toast.warning("Este ítem ya está agregado.");
      return;
    }
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          idItem: item.idItem,
          nombre: item.nombre,
          cantidad:0,
        },
      ],
    });
    setQueryItem("");
    setFilteredItems([]);
  }

  function actualizarCampo(idItem, campo, valor) {
    const num = parseInt(valor);
    if (isNaN(num) || num < 0) return;
    setForm({
      ...form,
      items: form.items.map((i) =>
        i.idItem === idItem ? { ...i, [campo]: num } : i
      ),
    });
  }

  function eliminarItem(idItem) {
    setForm({
      ...form,
      items: form.items.filter((i) => i.idItem !== idItem),
    });
  }

  function limpiarFirma() {
    sigCanvas.current.clear();
    setForm({ ...form, firma: null });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.solicitante)
      return toast.warning("Selecciona un solicitante válido.");
    if (form.items.length === 0)
      return toast.warning("Agrega al menos un ítem.");
    if (sigCanvas.current.isEmpty())
      return toast.warning("La firma digital es obligatoria.");

    try {
      setLoading(true);

      const canvas = sigCanvas.current.getCanvas();
      const firmaDataUrl = canvas.toDataURL("image/png");
      const response = await fetch(firmaDataUrl);
      const blob = await response.blob();
      const file = new File([blob], "firma.png", { type: "image/png" });

      await createSalida({ ...form, firma: file });

      toast.success("✅ Salida registrada correctamente.");
      navigate("/gestor/salidas");
    } catch (err) {
      console.error("❌ Error en handleSubmit:", err);
      toast.error(err.message || "Error al registrar la salida.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md border border-slate-100 p-8 relative">
        {/* 🔙 Volver */}
        <button
          onClick={() => navigate("/gestor/salidas")}
          className="absolute top-4 left-4 text-slate-500 hover:text-blue-600 flex items-center gap-1"
        >
          <ArrowLeft size={18} /> Volver
        </button>

        <br />
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <ClipboardList className="text-blue-600" /> Registrar Salida
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 🔍 Buscar solicitante */}
          <div className="relative">
            <label className="text-sm font-medium text-slate-500">
              Buscar Solicitante
            </label>
            <div className="flex items-center mt-1 relative">
              <Search size={18} className="absolute left-3 text-slate-400" />
              <input
                type="text"
                value={querySolicitante}
                onChange={buscarSolicitante}
                placeholder="Escribe nombre o cédula..."
                className="w-full border border-blue-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>

            {filteredSolicitantes.length > 0 && (
              <ul className="absolute z-10 bg-white border border-slate-200 rounded-lg mt-1 w-full max-h-56 overflow-auto shadow-md">
                {filteredSolicitantes.map((s) => (
                  <li
                    key={s.idUsuario}
                    onClick={() => {
                      setForm({ ...form, solicitante: s });
                      setQuerySolicitante(`${s.nombre} ${s.apellidos} (${s.cedula})`);
                      setFilteredSolicitantes([]);
                    }}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                  >
                    <User2 size={18} className="text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-700">
                        {s.nombre} {s.apellidos}
                      </p>
                      <p className="text-xs text-slate-500">Cédula: {s.cedula}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actividad */}
          <div>
            <label className="text-sm font-medium text-slate-500">Actividad</label>
            <input
              type="text"
              value={form.actividad}
              onChange={(e) => setForm({ ...form, actividad: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-300 outline-none"
              placeholder="Ej: mantenimiento, instalación, préstamo..."
            />
          </div>

          {/* Ítems */}
          <div className="relative">
            <label className="text-sm font-medium text-slate-500">Agregar Ítem</label>
            <input
              type="text"
              value={queryItem}
              onChange={buscarItem}
              placeholder="Buscar por nombre o código..."
              className="w-full border border-blue-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-300 outline-none"
            />
            {filteredItems.length > 0 && (
              <ul className="absolute z-10 bg-white border border-slate-200 rounded-lg mt-1 w-full max-h-56 overflow-auto shadow-md">
                {filteredItems.map((item) => (
                  <li
                    key={item.idItem}
                    onClick={() => agregarItem(item)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                  >
                    <Package size={18} className="text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-700">{item.nombre}</p>
                      <p className="text-xs text-slate-500">
                        Código: {item.codigo || "—"} | {item.categoria?.nombre || "Sin categoría"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tabla de ítems responsiva */}
          {form.items.length > 0 && (
            <div className="border rounded-lg p-3 bg-slate-50">
              <div className="hidden sm:grid sm:grid-cols-4 font-semibold text-sm text-slate-600 pb-2 border-b">
                <span>Ítem</span>
                <span className="text-center">Cant. requerida</span>
                <span className="text-center">Cant. despachada</span>
                <span className="text-center">Acciones</span>
              </div>
              {form.items.map((i) => (
                <div
                  key={i.idItem}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center py-2 border-b last:border-0"
                >
                  <span className="font-medium text-slate-800">{i.nombre}</span>

                  <div className="sm:text-center">
                    <label className="sm:hidden text-xs text-slate-500">Requerida</label>
                    <input
                      type="number"
                      min="0"
                      value={i.cantidadRequerida}
                      onChange={(e) =>
                        actualizarCampo(i.idItem, "cantidadRequerida", e.target.value)
                      }
                      className="w-full sm:w-20 border border-blue-300 rounded-lg px-2 py-1 text-center"
                    />
                  </div>

                  <div className="sm:text-center">
                    <label className="sm:hidden text-xs text-slate-500">Despachada</label>
                    <input
                      type="number"
                      min="0"
                      value={i.cantidadDespachada}
                      onChange={(e) =>
                        actualizarCampo(i.idItem, "cantidadDespachada", e.target.value)
                      }
                      className="w-full sm:w-20 border border-blue-300 rounded-lg px-2 py-1 text-center"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => eliminarItem(i.idItem)}
                    className="mx-auto text-red-500 hover:text-red-700 flex justify-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Firma digital */}
          <div>
            <label className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-2">
              <FileSignature className="text-blue-600" /> Firma del solicitante
            </label>

            <div className="border border-blue-300 rounded-lg bg-slate-50 relative">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ className: "w-full h-48 rounded-lg bg-white" }}
              />
              <button
                type="button"
                onClick={limpiarFirma}
                className="absolute top-2 right-2 bg-white border border-slate-300 rounded-md p-1 text-slate-600 hover:bg-slate-100"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Firma directamente con el dedo o mouse.
            </p>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <CheckCircle2 size={20} />
            {loading ? "Registrando..." : "Registrar Salida"}
          </button>
        </form>
      </div>
    </div>
  );
}
