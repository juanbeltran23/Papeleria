import { useEffect, useState } from "react";
import {
  createGestor,
  getGestores,
  updateGestor,
  deleteGestor,
} from "../../services/gestoresService";
import { toast } from "react-toastify";
import GestorForm from "../../components/admin/GestorForm";
import GestorTable from "../../components/admin/GestorTable";

export default function GestorPanel() {
  const [gestores, setGestores] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    cedula: "",
    email: "",
    password: "",
    password2: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGestores();
  }, []);

  async function fetchGestores() {
    try {
      const data = await getGestores();
      setGestores(data);
    } catch (err) {
      toast.error("Error al cargar los gestores");
    }
  }

  const handleEdit = (gestor) => {
    setEditingId(gestor.idUsuario);
    setForm({
      nombre: gestor.nombre,
      apellidos: gestor.apellidos,
      cedula: gestor.cedula,
    });
    toast("Editando gestor...");
  };

  const handleCancel = () => {
    setEditingId(null);
    resetForm();
    toast("Edición cancelada");
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
    if (!editingId && form.password !== form.password2) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await updateGestor(editingId, form);
        toast.success("Gestor actualizado correctamente");
        setEditingId(null);
      } else {
        await createGestor(form);
        toast.success("Gestor registrado exitosamente");
      }
      resetForm();
      await fetchGestores();
    } catch (err) {
      toast.error("Error al guardar el gestor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que deseas eliminar este gestor?")) {
      try {
        await deleteGestor(id);
        await fetchGestores();
        toast.success("Gestor eliminado correctamente");
      } catch (err) {
        toast.error("Error al eliminar el gestor");
      }
    }
  };

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 py-6 flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GestorForm
          form={form}
          setForm={setForm}
          loading={loading}
          editingId={editingId}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
        />
        <GestorTable
          gestores={gestores}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
}
