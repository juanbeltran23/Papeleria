import { useEffect, useState } from "react";
import { addInventarioDetalle } from "../../services/inventarioService";
import { getItems } from "../../services/itemsService";
import { toast } from "react-toastify";
import {
  Check,
  Save,
  Box,
  Tag,
  Hash,
  Database,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function InventarioGeneral({ idInventario, estado, onFinalizar }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getItems();
        setItems(data.map(i => ({ ...i, stockContado: "", guardado: false })));
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar ítems");
      }
    };
    cargar();
  }, []);

  const handleChange = (idItem, value) => {
    setItems(prev =>
      prev.map(i =>
        i.idItem === idItem ? { ...i, stockContado: value } : i
      )
    );
  };

  const guardarConteo = async (item) => {
    if (item.stockContado === "")
      return toast.warning("Ingrese un conteo válido");

    try {
      await addInventarioDetalle({
        idInventario,
        idItem: item.idItem,
        stockContado: parseInt(item.stockContado),
      });

      setItems(prev =>
        prev.map(i =>
          i.idItem === item.idItem ? { ...i, guardado: true } : i
        )
      );

      toast.success(`Conteo registrado para ${item.nombre}`);
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar conteo");
    }
  };

  // 📊 Calcular progreso
  const totalGuardados = items.filter(i => i.guardado).length;
  const progreso = items.length > 0 ? (totalGuardados / items.length) * 100 : 0;

  return (
    <div className="mt-4">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <Box className="w-6 h-6 text-green-600" /> Inventario General
      </h3>

      {/* 📱 Vista en tarjetas para móvil */}
      <div className="grid gap-3 sm:hidden">
        {items.map((i) => (
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
                className={`border rounded-lg px-3 py-2 w-full text-center text-sm ${i.guardado
                    ? "bg-gray-200 text-gray-500"
                    : "focus:ring-2 focus:ring-green-400"
                  }`}
                placeholder="Conteo físico"
                value={i.stockContado}
                onChange={e => handleChange(i.idItem, e.target.value)}
                disabled={i.guardado}
              />

              <button
                onClick={() => guardarConteo(i)}
                disabled={i.guardado}
                className={`mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${i.guardado
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
      <div className="hidden sm:block overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className="px-4 py-2"><Tag className="inline w-4 h-4 mr-1" /> Nombre</th>
              <th className="px-4 py-2"><Box className="inline w-4 h-4 mr-1" /> Categoría</th>
              <th className="px-4 py-2"><Hash className="inline w-4 h-4 mr-1" /> Código</th>
              <th className="px-4 py-2"><Database className="inline w-4 h-4 mr-1" /> Stock</th>
              <th className="px-4 py-2">Conteo</th>
              <th className="px-4 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={i.idItem} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50 transition`}>
                <td className="px-4 py-2">{i.nombre}</td>
                <td className="px-4 py-2">{i.categoria?.nombre || "Sin categoría"}</td>
                <td className="px-4 py-2">{i.codigo}</td>
                <td className="px-4 py-2">{i.stockReal}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className={`border rounded-lg px-2 py-1 w-24 text-center text-sm ${i.guardado ? "bg-gray-200 text-gray-500" : "focus:ring-2 focus:ring-green-400"
                      }`}
                    value={i.stockContado}
                    onChange={e => handleChange(i.idItem, e.target.value)}
                    disabled={i.guardado}
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => guardarConteo(i)}
                    className={`px-3 py-1 text-sm flex items-center gap-1 rounded-full ${i.guardado
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

      {/* 📊 Progreso */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-600" /> Ítems guardados
          </span>
          <span className="text-base font-semibold text-green-600">
            {totalGuardados}/{items.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progreso}%` }}
          ></div>
        </div>
      </div>

      {/* 🟢 Botones de acción */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
        <button
          onClick={onFinalizar}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" /> {estado === "En progreso" ? "Continuar Inventario" : "Finalizar Inventario"}
        </button>
      </div>
    </div>
  );
}
