import { supabase } from "./client";
import { getCurrentUser } from "./auth";

/**
 * Crea una nueva entrada, actualiza stock y genera movimiento tipo "entrada".
 */
export async function createEntrada({ idItem, cantidad, factura, observacion }) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("No hay usuario autenticado.");

    // obtener la fecha actual en zona horaria "America/Bogota"
    const now = new Date();
    const fechaBogota = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Bogota" })
    )
      .toISOString()
      .replace("T", " ")
      .slice(0, 19); // formato "YYYY-MM-DD HH:mm:ss"



    // 1️⃣ Insertar la entrada
    const { data: entrada, error: errorEntrada } = await supabase
      .from("entrada")
      .insert([
        {
          idItem,
          cantidad: parseInt(cantidad),
          factura,
          observacion,
          idUsuarioGestor: user.idUsuario,
          fecha: fechaBogota,
        },
      ])
      .select()
      .single();

    if (errorEntrada) throw errorEntrada;

    // Obtener el stock actual del ítem
    const { data: item, error: errorItem } = await supabase
      .from("item")
      .select("stockReal")
      .eq("idItem", idItem)
      .single();

    if (errorItem) throw errorItem;

    const nuevoStock = item.stockReal + parseInt(cantidad);

    // Actualizar el stock del ítem
    const { error: errorUpdate } = await supabase
      .from("item")
      .update({ stockReal: nuevoStock })
      .eq("idItem", idItem);

    if (errorUpdate) throw errorUpdate;

    // Registrar movimiento tipo "entrada"
    const { error: errorMov } = await supabase.from("movimiento").insert([
      {
        tipo: "entrada",
        referenciaTipo: "entrada",
        idItem,
        idReferencia: entrada.idEntrada,
        descripcion: `El gestor ${user.nombre} registró una entrada de ${cantidad} unidad(es).`,
        fecha: new Date(),
      },
    ]);

    if (errorMov) throw errorMov;

    return entrada;
  } catch (error) {
    console.error("❌ Error en createEntrada:", error);
    throw error;
  }
}


// Obtener todas las entradas
export async function getEntradas() {
  const { data, error } = await supabase
    .from("entrada")
    .select(
      `
      idEntrada,
      cantidad,
      factura,
      observacion,
      fecha,
      item (idItem, nombre, codigo),
      usuario: idUsuarioGestor (nombre)
      `
    )
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Elimina una entrada (opcional).
 */
export async function deleteEntrada(idEntrada) {
  try {
    const { error } = await supabase.from("entrada").delete().eq("idEntrada", idEntrada);
    if (error) throw error;
  } catch (error) {
    console.error("❌ Error en deleteEntrada:", error);
    throw error;
  }
}
