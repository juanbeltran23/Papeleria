import { useEffect, useState } from "react";
import { getCurrentUser } from "../supabase/auth";
import { updatePerfil } from "../supabase/perfilService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Perfil() {
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    cedula: "",
    correo: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const data = await getCurrentUser();
      if (data) {
        setUserData(data);
        setForm({
          nombre: data.nombre || "",
          apellidos: data.apellidos || "",
          cedula: data.cedula || "",
          correo: data.correo || "",
        });
      }
    }
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!userData) return;
    setLoading(true);

    try {
      await updatePerfil(userData.idusuario, form);
      setUserData({ ...userData, ...form });
      setEditing(false);
      toast.success("✅ Perfil actualizado correctamente", {
        position: "bottom-right",
        autoClose: 2500,
        theme: "colored",
      });
    } catch (err) {
      console.error(err);
      toast.error("❌ Error al actualizar el perfil", {
        position: "bottom-right",
        autoClose: 2500,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userData)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Cargando perfil...
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-12">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden transition-all duration-300">
        {/* Encabezado del perfil */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-36 relative">
          <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
            <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden shadow-lg">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${form.nombre}+${form.apellidos}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Cuerpo del perfil */}
        <div className="pt-20 pb-10 px-8">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 text-center mb-8">
            Mi Perfil
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {["nombre", "apellidos", "cedula", "correo"].map((field) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1"
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "correo" ? "email" : "text"}
                  name={field}
                  id={field}
                  value={form[field]}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full border rounded-lg p-3 text-gray-800 dark:text-gray-100 dark:bg-gray-700 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 transition`}
                />
              </div>
            ))}
          </div>

          {/* Botones */}
          <div className="flex justify-center mt-10 gap-4">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all disabled:bg-blue-300"
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="bg-yellow-500 text-white px-8 py-2.5 rounded-lg hover:bg-yellow-600 transition-all"
              >
                Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
