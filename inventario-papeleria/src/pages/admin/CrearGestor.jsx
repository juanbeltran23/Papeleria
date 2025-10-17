import { useState } from "react";
import { registerSelf } from "../supabase/auth.jsx";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    cedula: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registerSelf(form);
      alert("Usuario registrado correctamente. Por favor inicia sesión.");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">Registro de Solicitante</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <input name="nombre" placeholder="Nombre" onChange={handleChange} className="w-full border p-2 rounded mb-4" />
        <input name="apellidos" placeholder="Apellidos" onChange={handleChange} className="w-full border p-2 rounded mb-4" />
        <input name="cedula" placeholder="Cédula" onChange={handleChange} className="w-full border p-2 rounded mb-4" />
        <input name="email" type="email" placeholder="Correo" onChange={handleChange} className="w-full border p-2 rounded mb-4" />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} className="w-full border p-2 rounded mb-6" />

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
          Registrarme
        </button>
      </form>
    </div>
  );
}
