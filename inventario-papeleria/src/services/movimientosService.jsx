import { supabase } from "../supabase/client";

// Obtener todos los movimientos con join a item y categoria
export async function getMovimientos() {
  const { data, error } = await supabase
    .from("movimiento")
    .select(`
      idMovimiento,
      tipo,
      referenciaTipo,
      idReferencia,
      idItem,
      cantidad,
      fecha,
      descripcion,
      item: idItem (
        nombre,
        codigo,
        categoria ( idCategoria, nombre )
      )
    `)
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data;
}

