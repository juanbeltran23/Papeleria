import { supabase } from "../supabase/client";

/**
 * Crear una alerta para un usuario
 * payload: { tipo, mensaje, idUsuario, estado?, nivel? }
 */
export async function createAlerta({
  tipo,
  mensaje,
  idUsuario,
  estado = "activa",
  nivel = "media",
}) {
  const { data, error } = await supabase
    .from("alerta")
    .insert([
      {
        tipo,
        mensaje,
        idUsuario,
        estado,
        nivel,
        fecha: new Date(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
