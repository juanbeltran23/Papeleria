import { useState } from "react";

export default function GestorForm({
  form,
  setForm,
  loading,
  editingId,
  handleSubmit,
  handleCancel,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full"
    >
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-slate-800 text-center">
        {editingId ? "Editar Gestor" : "Registrar Gestor"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {["nombre", "apellidos", "cedula", "email"].map((field) => {
          if (editingId && field === "email") return null;

          return (
            <div key={field}>
              <label className="block text-sm text-slate-600 mb-1 capitalize">
                {field}
              </label>
              <input
                name={field}
                value={form[field] || ""}
                onChange={handleChange}
                required
                type={field === "email" ? "email" : "text"}
                className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          );
        })}
      </div>

      {!editingId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {["password", "password2"].map((field, i) => (
            <div key={field} className="relative">
              <label className="block text-sm text-slate-600 mb-1">
                {i === 0 ? "Contraseña" : "Confirmar contraseña"}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 p-3 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {i === 0 && (
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-9 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

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
  );
}
