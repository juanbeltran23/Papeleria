import { useState, useEffect } from "react";
import { getItems } from "../../services/itemsService";
import { addInventarioDetalle } from "../../services/inventarioService";
import { toast } from "react-toastify";
import {
  Search,
  Package,
  Save,
  CheckCircle,
  Tag,
  Hash,
  Database,
  Check,
} from "lucide-react";

export default function InventarioParcial({ idInventario, onFinalizar }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getItems();
        setItems(data);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar ítems");
      }
    };
    cargar();
  }, []);

  // 🔍 Búsqueda dinámica
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
        i.codigo?.toLowerCase().includes(value.toLowerCase()) ||
        (i.categoria?.nombre || "").toLowerCase().includes(value.toLowerCase())
    );

    setFilteredItems(filtered);
  }

  // ➕ Seleccionar ítem
  const seleccionarItem = (item) => {
    if (seleccionados.find((s) => s.idItem === item.idItem)) {
      return toast.info("Este ítem ya está en la lista");
    }
    setSeleccionados((prev) => [
      ...prev,
      { ...item, stockContado: "", guardado: false },
    ]);
    setQuery("");
    setFilteredItems([]);
  };

  // 💾 Guardar conteo
  const guardarConteo = async (item) => {
    if (item.stockContado === "")
      return toast.warning("Ingrese un conteo válido");

    try {
      await addInventarioDetalle({
        idInventario,
        idItem: item.idItem,
        stockContado: parseInt(item.stockContado),
      });

      setSeleccionados((prev) =>
        prev.map((i) =>
          i.idItem === item.idItem ? { ...i, guardado: true } : i
        )
      );

      toast.success(`Conteo registrado para ${item.nombre}`);
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar conteo");
    }
  };

  const handleChange = (idItem, value) => {
    setSeleccionados((prev) =>
      prev.map((i) =>
        i.idItem === idItem ? { ...i, stockContado: value } : i
      )
    );
  };

  // 📊 Progreso
  const totalGuardados = seleccionados.filter((i) => i.guardado).length;
  const progreso =
    seleccionados.length > 0 ? (totalGuardados / seleccionados.length) * 100 : 0;

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white rounded-xl shadow-md mt-4">
      <h3 className="text-2xl font-bold mb-4 text-center text-gray-700 flex items-center justify-center gap-2">
        <Search className="w-6 h-6 text-blue-600" /> Inventario Parcial
      </h3>

      {/* 🔍 Campo de búsqueda */}
      <div className="relative mb-6">
        <label className="text-sm font-medium text-slate-500">
          Buscar Ítem
        </label>
        <div className="flex items-center gap-2 mt-1 relative">
          <Search size={18} className="text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Escribe nombre, código o categoría..."
            value={query}
            onChange={handleSearch}
            className="w-full border border-blue-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none text-left"
          />
        </div>

        {filteredItems.length > 0 && (
          <ul className="absolute z-10 bg-white border border-slate-200 rounded-lg mt-1 w-full max-h-48 overflow-auto shadow-md">
            {filteredItems.map((item) => (
              <li
                key={item.idItem}
                onClick={() => seleccionarItem(item)}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-start gap-2 text-left"
              >
                <Package size={16} className="text-slate-400 mt-1" />
                <span className="flex flex-col text-sm text-left">
                  <span className="font-medium text-slate-700">
                    {item.nombre}
                  </span>
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

      {/* 📱 Tarjetas responsive para móvil */}
      <div className="grid gap-3 sm:hidden mt-4">
        {seleccionados.map((i) => (
          <div
            key={i.idItem}
            className="bg-white shadow-md rounded-xl p-4 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-800">{i.nombre}</h4>
              {i.guardado ? (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Guardado
                </span>
              ) : (
                <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                  Pendiente
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Tag className="w-4 h-4" /> {i.categoria?.nombre || "Sin categoría"}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Hash className="w-4 h-4" /> Código: {i.codigo}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Database className="w-4 h-4" /> Stock Sistema: {i.stockReal}
            </p>

            <div className="mt-3">
              <input
                type="number"
                className={`border rounded-lg px-3 py-2 w-full text-center text-sm ${
                  i.guardado
                    ? "bg-gray-200 text-gray-500"
                    : "focus:ring-2 focus:ring-green-400"
                }`}
                placeholder="Conteo físico"
                value={i.stockContado}
                onChange={(e) => handleChange(i.idItem, e.target.value)}
                disabled={i.guardado}
              />

              <button
                onClick={() => guardarConteo(i)}
                disabled={i.guardado}
                className={`mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  i.guardado
                    ? "bg-gray-300 text-gray-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {i.guardado ? (
                  <>
                    <Check className="w-4 h-4" /> Guardado
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 💻 Tabla para escritorio */}
      {seleccionados.length > 0 && (
        <div className="hidden sm:block overflow-x-auto rounded-lg shadow mt-6">
          <table className="min-w-full bg-white text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Categoría</th>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Stock Sistema</th>
                <th className="px-4 py-2 text-left">Conteo Físico</th>
                <th className="px-4 py-2 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {seleccionados.map((i, idx) => (
                <tr
                  key={i.idItem}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-green-50 transition`}
                >
                  <td className="px-4 py-2">{i.nombre}</td>
                  <td className="px-4 py-2">{i.categoria?.nombre || "—"}</td>
                  <td className="px-4 py-2">{i.codigo}</td>
                  <td className="px-4 py-2">{i.stockReal}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      className={`border rounded-lg px-2 py-1 w-24 text-center text-sm ${
                        i.guardado
                          ? "bg-gray-200 text-gray-500"
                          : "focus:ring-2 focus:ring-green-400"
                      }`}
                      value={i.stockContado}
                      onChange={(e) =>
                        handleChange(i.idItem, e.target.value)
                      }
                      disabled={i.guardado}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => guardarConteo(i)}
                      className={`px-3 py-1 text-sm flex items-center gap-1 rounded-full ${
                        i.guardado
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600 transition"
                      }`}
                      disabled={i.guardado}
                    >
                      {i.guardado ? (
                        <>
                          <Check className="w-4 h-4" /> Guardado
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Guardar
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📊 Contador de progreso */}
      {seleccionados.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" /> Ítems guardados
            </span>
            <span className="text-base font-semibold text-green-600">
              {totalGuardados}/{seleccionados.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* ✅ Finalizar inventario */}
      <div className="text-right mt-6">
        <button
          onClick={onFinalizar}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg transition flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" /> Finalizar Inventario
        </button>
      </div>
    </div>
  );
}
