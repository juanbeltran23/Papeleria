import { supabase } from "../supabase/client";

export async function updateUsuario(idUsuario, formData) {
  const { error } = await supabase
    .from("usuario")
    .update({
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      cedula: formData.cedula,
      correo: formData.correo,
    })
    .eq("idUsuario", idUsuario);

  if (error) throw error;
}

export async function getSolicitantes() {
  const { data, error } = await supabase
    .from("usuario")
    .select("idUsuario, nombre, apellidos, cedula")
    .eq("idRol", 3);

  if (error) throw error;
  return data;
}
