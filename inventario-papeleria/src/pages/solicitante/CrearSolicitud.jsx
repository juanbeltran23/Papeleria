import { useEffect, useState } from "react";
import { getItems } from "../../services/itemsService";
import { getCurrentUser } from "../../services/auth.js";
import { toast } from "react-toastify";
import { createSolicitud } from "../../services/solicitudesService";
import {
  Plus,
  Trash2,
  ClipboardList,
  Search,
  Send,
} from "lucide-react";

export default function CrearSolicitud() {
  const [usuario, setUsuario] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [descripcionMaterial, setDescripcionMaterial] = useState("");
  const [actividad, setActividad] = useState("");
  const [fechaActividad, setFechaActividad] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [modo, setModo] = useState("inventario"); // ✅ nuevo estado: inventario | nuevo

  // ✅ Cargar usuario e ítems
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const user = await getCurrentUser();
        setUsuario(user);
        const data = await getItems();
        setItems(data);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar los datos iniciales");
      }
    };
    cargarDatos();
  }, []);

  // 🔍 Filtrar ítems por nombre o categoría
  const filteredItems = items.filter(
    (i) =>
      i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.categoria?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ➕ Agregar ítem (sin duplicar)
  const agregarItem = (itemSeleccionado) => {
    const existe = selectedItems.some(
      (i) => i.idItem === itemSeleccionado.idItem
    );
    if (existe) {
      toast.warning("Este material ya fue agregado a la solicitud");
      return;
    }
    setSelectedItems([...selectedItems, { ...itemSeleccionado, cantidad: 1 }]);
  };

  // 🗑️ Eliminar ítem
  const eliminarItem = (idItem) => {
    setSelectedItems(selectedItems.filter((i) => i.idItem !== idItem));
  };

  // ✏️ Cambiar cantidad
  const cambiarCantidad = (index, cantidad) => {
    setSelectedItems((prev) =>
      prev.map((i, idx) => (idx === index ? { ...i, cantidad } : i))
    );
  };

  // 🚀 Crear solicitud
  const handleSubmit = async () => {
    if (!actividad.trim()) return toast.warning("Debe ingresar una actividad");
    if (!fechaActividad) return toast.warning("Debe seleccionar una fecha");

    if (modo === "inventario" && selectedItems.length === 0) {
      return toast.warning("Debe seleccionar al menos un ítem del inventario");
    }
    if (modo === "nuevo" && !descripcionMaterial.trim()) {
      return toast.warning("Debe describir el material nuevo");
    }

    try {
      setLoading(true);
      await createSolicitud({
        idUsuarioSolicitante: usuario.idUsuario,
        actividad,
        descripcionMaterial: modo === "nuevo" ? descripcionMaterial : null,
        fechaActividad,
        items:
          modo === "inventario"
            ? selectedItems.map((i) => ({
                idItem: i.idItem,
                cantidad: i.cantidad,
              }))
            : [],
      });

      toast.success("Solicitud creada exitosamente");
      setSelectedItems([]);
      setDescripcionMaterial("");
      setActividad("");
      setFechaActividad("");
      setModo("inventario");
    } catch (error) {
      console.error(error);
      toast.error("Error al crear la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <ClipboardList className="w-6 h-6 text-green-600" />
        Crear Solicitud de Materiales
      </h2>

      {/* Selección de modo */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tipo de solicitud
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setModo("inventario")}
            className={`flex-1 px-4 py-2 rounded-lg border ${
              modo === "inventario"
                ? "bg-green-600 text-white border-green-600"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Material existente en inventario
          </button>
          <button
            type="button"
            onClick={() => setModo("nuevo")}
            className={`flex-1 px-4 py-2 rounded-lg border ${
              modo === "nuevo"
                ? "bg-green-600 text-white border-green-600"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Material nuevo
          </button>
        </div>
      </div>

      {/* Información general */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Actividad
            </label>
            <input
              type="text"
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
              placeholder="Ej: Mantenimiento de equipos"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Fecha de la actividad
            </label>
            <input
              type="date"
              value={fechaActividad}
              onChange={(e) => setFechaActividad(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>
      </div>

      {/* Material nuevo */}
      {modo === "nuevo" && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Descripción del material nuevo
          </label>
          <textarea
            value={descripcionMaterial}
            onChange={(e) => setDescripcionMaterial(e.target.value)}
            placeholder="Describa el material si no existe en inventario..."
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
            rows="3"
          />
        </div>
      )}

      {/* Lista de ítems disponibles */}
      {modo === "inventario" && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-green-600" /> Buscar materiales
          </h3>

          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-green-400"
          />

          <div className="max-h-56 overflow-y-auto">
            {filteredItems.map((item) => (
              <div
                key={`item-${item.idItem}`}
                className="flex items-center justify-between border-b py-2 px-2 hover:bg-green-50 rounded transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">{item.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {item.categoria?.nombre || "Sin categoría"}
                  </p>
                </div>
                <button
                  onClick={() => agregarItem(item)}
                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ítems seleccionados */}
      {modo === "inventario" && selectedItems.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Materiales seleccionados</h3>

          <div className="space-y-2">
            {selectedItems.map((item, index) => (
              <div
                key={`${item.idItem}-${index}`}
                className="flex items-center justify-between border rounded-lg px-3 py-2 bg-gray-50"
              >
                <div>
                  <p className="font-semibold">{item.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {item.categoria?.nombre || "Sin categoría"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => cambiarCantidad(index, e.target.value)}
                    className="w-20 border rounded-lg px-2 py-1 text-center"
                  />
                  <button
                    onClick={() => eliminarItem(item.idItem)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de envío */}
      <div className="text-right">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 justify-center w-full sm:w-auto ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          <Send className="w-5 h-5" />
          {loading ? "Enviando solicitud..." : "Enviar solicitud"}
        </button>
      </div>
    </div>
  );
}
