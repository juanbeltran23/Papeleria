import { useEffect, useState } from "react";
import { createItem, getItems, updateItem, deleteItem } from "../../supabase/itemsService";

export default function RegistrarItem() {
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    idCategoria: "",
    tipo: "",
    unidad: "",
    stockMinimo: "",
    inventarioInicial: "",
    imagen: null,
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const data = await getItems();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (editingId) {
        await updateItem(editingId, form);
        setEditingId(null);
      } else {
        await createItem(form);
      }
      setForm({
        codigo: "",
        nombre: "",
        idCategoria: "",
        tipo: "",
        unidad: "",
        stockMinimo: "",
        inventarioInicial: "",
        imagen: null,
      });
      await fetchItems();
    } catch (err) {
      console.error(err);
      setError("Error al guardar el ítem.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (confirm("¿Seguro que deseas eliminar este ítem?")) {
      await deleteItem(id);
      await fetchItems();
    }
  }

  function handleEdit(item) {
    setEditingId(item.idItem);
    setForm({
      codigo: item.codigo,
      nombre: item.nombre,
      idCategoria: item.idCategoria,
      tipo: item.tipo,
      unidad: item.unidad,
      stockMinimo: item.stockMinimo,
      inventarioInicial: item.inventarioInicial,
      imagen: null,
    });
  }

  function handleCancel() {
    setEditingId(null);
    setForm({
      codigo: "",
      nombre: "",
      idCategoria: "",
      tipo: "",
      unidad: "",
      stockMinimo: "",
      inventarioInicial: "",
      imagen: null,
    });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row gap-6 bg-linear-to-b from-slate-50 to-slate-100 p-6">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg w-full md:w-1/2">
        <h2 className="text-2xl font-semibold mb-6 text-center text-slate-800">
          {editingId ? "Editar Ítem" : "Registrar Ítem"}
        </h2>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-2 rounded">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {["codigo", "nombre", "tipo", "unidad", "stockMinimo", "inventarioInicial"].map((field) => (
            <div key={field}>
              <label className="block text-sm text-slate-600 mb-1 capitalize">{field}</label>
              <input
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm text-slate-600 mb-1">Categoría (ID)</label>
            <input
              name="idCategoria"
              value={form.idCategoria}
              onChange={handleChange}
              required
              type="number"
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Imagen</label>
            <input
              type="file"
              name="imagen"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition"
          >
            {loading ? "Guardando..." : editingId ? "Guardar cambios" : "Registrar"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-100 text-slate-700 py-3 rounded-xl hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de ítems */}
      <div className="bg-white p-6 rounded-3xl shadow-lg w-full md:w-1/2 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4 text-slate-800">Lista de Ítems</h3>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="p-2">Código</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Stock</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.idItem} className="border-b">
                <td className="p-2">{item.codigo}</td>
                <td className="p-2">{item.nombre}</td>
                <td className="p-2">{item.stockReal}</td>
                <td className="p-2 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-md"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.idItem)}
                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
