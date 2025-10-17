import { useState } from "react";
import { registerSolicitante } from "../supabase/auth";
import { useNavigate } from "react-router-dom";

export default function RegisterSolicitante() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    password2: "",
    nombre: "",
    apellidos: "",
    cedula: "",
    area: "",
    cargo: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("Correo y contraseña son obligatorios");
    if (form.password !== form.password2) return setError("Las contraseñas no coinciden");
    if (form.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    setLoading(true);
    try {
      // Elimina password2 antes de enviar si tu API no lo espera
      const { password2, ...payload } = form;
      await registerSolicitante(payload);
      alert("Usuario solicitante registrado con éxito");
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center text-slate-800">Registro de Solicitante</h2>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-2 rounded">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Apellidos</label>
            <input name="apellidos" value={form.apellidos} onChange={handleChange} required
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Cédula</label>
            <input name="cedula" value={form.cedula} onChange={handleChange} required
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Área</label>
            <input name="area" value={form.area} onChange={handleChange} required
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Cargo</label>
            <input name="cargo" value={form.cargo} onChange={handleChange} required
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Correo</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <label className="block text-sm text-slate-600 mb-1">Contraseña</label>
            <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required
              className="w-full border border-slate-200 p-3 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <button type="button" onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-9 text-slate-500 hover:text-slate-700" aria-label="Mostrar u ocultar contraseña">
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3-11-7 1.066-2.254 2.706-4.112 4.75-5.324M3 3l18 18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm text-slate-600 mb-1">Confirmar contraseña</label>
            <input type={showPassword ? "text" : "password"} name="password2" value={form.password2} onChange={handleChange} required
              className="w-full border border-slate-200 p-3 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300" />
            {/* Ojo compartido; el mismo botón cambia ambas entradas */}
            <div className="absolute right-3 top-9 text-slate-400">
              {/* espacio reservado para alineación del ojo; no necesita acción adicional */}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition">
            {loading ? "Guardando..." : "Registrar"}
          </button>
          <button type="button" onClick={() => navigate("/")} className="flex-1 bg-gray-100 text-slate-700 py-3 rounded-xl hover:bg-gray-200 transition">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
