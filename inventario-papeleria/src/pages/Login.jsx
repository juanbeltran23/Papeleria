import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth.jsx";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Correo y contraseña son obligatorios");

    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast.success("Inicio de sesión exitoso 👋");
      if (user.rol.nombre === "Administrador") navigate("/admin");
      else if (user.rol.nombre === "Gestor") navigate("/gestor");
      else navigate("/solicitante");
    } catch (err) {
      toast.error(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md mx-auto"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center text-slate-800">Iniciar sesión</h2>

        <label className="block text-sm text-slate-700 mb-1">Correo</label>
        <input
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-200 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          required
          autoComplete="username"
        />

        <label className="block text-sm text-slate-700 mb-1">Contraseña</label>
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 p-3 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
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

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Entrar"}
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600 mb-3">¿No tienes cuenta?</p>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="inline-block px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Registrarse
          </button>
        </div>
      </form>
    </div>
  );
}
