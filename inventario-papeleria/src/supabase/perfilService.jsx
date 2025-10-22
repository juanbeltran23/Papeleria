import { supabase } from "./client";

export async function updatePerfil(idUsuario, formData) {
  const { error } = await supabase
    .from("usuario")
    .update({
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      cedula: formData.cedula,
      correo: formData.correo,
    })
    .eq("idusuario", idUsuario);

  if (error) throw error;
}
