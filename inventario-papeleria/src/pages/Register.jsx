import { useState } from "react";
import { registerUser } from "../supabase/auth";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    nombre: "",
    apellidos: "",
    cedula: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(form.email, form.password, form.nombre, form.apellidos, form.cedula);
      alert("Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
    } catch (err) {
      alert("Error al registrar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg w-96 space-y-4">
        <h1 className="text-xl font-bold text-center">Registro de Usuario</h1>
        <input type="text" placeholder="Nombre" className="input input-bordered w-full"
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <input type="text" placeholder="Apellidos" className="input input-bordered w-full"
          onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
        <input type="text" placeholder="Cédula" className="input input-bordered w-full"
          onChange={(e) => setForm({ ...form, cedula: e.target.value })} />
        <input type="email" placeholder="Correo" className="input input-bordered w-full"
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Contraseña" className="input input-bordered w-full"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
}
