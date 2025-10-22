import { useEffect, useState } from "react";
import {
  createGestor,
  getGestores,
  updateGestor,
  deleteGestor,
} from "../../supabase/gestoresService";
import { toast } from "react-toastify";

export default function GestorPanel() {
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    cedula: "",
    email: "",
    password: "",
    password2: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gestores, setGestores] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchGestores();
  }, []);

  async function fetchGestores() {
    try {
      const data = await getGestores();
      setGestores(data);
    } catch (err) {
      toast.error("Error al cargar los gestores");
      console.error(err);
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      apellidos: "",
      cedula: "",
      email: "",
      password: "",
      password2: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password2) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await updateGestor(editingId, form);
        console.log("Updated gestor with ID:", editingId);
        toast.success("Gestor actualizado correctamente");
        setEditingId(null);
      } else {
        await createGestor(form);
        toast.success("Gestor registrado exitosamente");
      }

      resetForm();
      await fetchGestores();
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar el gestor");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gestor) => {
    setEditingId(gestor.idusuario);
    setForm({
      nombre: gestor.nombre,
      apellidos: gestor.apellidos,
      cedula: gestor.cedula,
      email: gestor.correo,
      password: "",
      password2: "",
    });
    toast("Editando gestor...");
  };

  const handleCancel = () => {
    setEditingId(null);
    resetForm();
    toast("Edición cancelada");
  };

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que deseas eliminar este gestor?")) {
      try {
        await deleteGestor(id);
        await fetchGestores();
        toast.success("Gestor eliminado correctamente");
      } catch (err) {
        console.error(err);
        toast.error("Error al eliminar el gestor");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-8 p-4 sm:p-6 bg-linear-to-b from-slate-50 to-slate-100 w-full">
      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-lg w-full lg:w-1/2 transition-all"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-slate-800">
          {editingId ? "Editar Gestor" : "Registrar Gestor"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Apellidos
            </label>
            <input
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Cédula</label>
            <input
              name="cedula"
              value={form.cedula}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Correo</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Contraseñas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <label className="block text-sm text-slate-600 mb-1">
              Contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required={!editingId}
              className="w-full border border-slate-200 p-3 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-9 text-slate-500 hover:text-slate-700"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Confirmar contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password2"
              value={form.password2}
              onChange={handleChange}
              required={!editingId}
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition"
          >
            {loading
              ? "Guardando..."
              : editingId
              ? "Guardar Cambios"
              : "Registrar"}
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

      {/* Tabla */}
      <div className="bg-white p-6 rounded-3xl shadow-lg w-full lg:w-1/2 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-slate-800 text-center">
          Lista de Gestores
        </h2>
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">Apellidos</th>
              <th className="py-2 px-4">Correo</th>
              <th className="py-2 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gestores.map((g) => (
              <tr key={g.idusuario} className="border-t hover:bg-slate-50">
                <td className="py-2 px-4">{g.nombre}</td>
                <td className="py-2 px-4">{g.apellidos}</td>
                <td className="py-2 px-4">{g.correo}</td>
                <td className="py-2 px-4 flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(g)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 transition w-20"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(g.idusuario)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition w-20"
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
