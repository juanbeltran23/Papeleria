import { supabase } from "./client";
import { getCurrentUser } from "./auth";

/**
 * Crea una nueva devolucion con sus ítems, descuenta stock y registra movimientos.
 */
export async function createDevolucion({ solicitante, observacion, items }) {
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

    // Insertar devolucion principal
    const { data: devolucion, error: errorDevolucion } = await supabase
      .from("devolucion")
      .insert([
        {
          idUsuarioSolicitante: solicitante.idUsuario,
          idUsuarioGestor: user.idUsuario,
          observacion,
          fecha: fechaBogota,
        },
      ])
      .select()
      .single();

    if (errorDevolucion) throw errorDevolucion;

    // Procesar ítems
    for (const i of items) {
      const { idItem, cantidad } = i;

      // Obtener ítem actual
      const { data: item, error: errorItem } = await supabase
        .from("item")
        .select("stockReal, nombre")
        .eq("idItem", idItem)
        .single();
      if (errorItem) throw errorItem;

      const nuevoStock = item.stockReal + cantidad;

      // Insertar en devolucionItem
      const { data: devolucionItem, error: errordevolucionItem } = await supabase
        .from("devolucionItem")
        .insert([
          {
            idDevolucion: devolucion.idDevolucion,
            idItem,
            cantidad,
          },
        ])
        .select()
        .single();
      if (errordevolucionItem) throw errordevolucionItem;

      // Actualizar stock
      const { error: errorStock } = await supabase
        .from("item")
        .update({ stockReal: nuevoStock })
        .eq("idItem", idItem);
      if (errorStock) throw errorStock;

      // Registrar movimiento
      const { error: errorMov } = await supabase.from("movimiento").insert([
        {
          tipo: "devolucion",
          referenciaTipo: "devolucionItem",
          idReferencia: devolucionItem.idDevolucionItem,
          idItem,
          descripcion: `${solicitante.nombre + " " + solicitante.apellidos} devolvió ${cantidad} unidad(es) del ítem "${item.nombre}"`,
          fecha: new Date(),
        },
      ]);
      if (errorMov) throw errorMov;
    }

    return devolucion;
  } catch (error) {
    console.error("❌ Error en createDevolucion:", error);
    throw error;
  }
}

// Obtener todas las devoluciones
export async function getDevoluciones() {
  const { data, error } = await supabase
    .from("devolucion")
    .select(`
      idDevolucion,
      fecha,
      observacion,
      usuarioGestor: idUsuarioGestor (nombre, apellidos),
      usuarioSolicitante: idUsuarioSolicitante (nombre, apellidos)
    `)
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data;
}

// Obtener ítems de una devolucion específica
export async function getDevolucionItemsByDevolucionId(idDevolucion) {
  const { data, error } = await supabase
    .from("devolucionItem")
    .select(`
      idDevolucionItem,
      idItem,
      cantidad,
      item (nombre, codigo)
    `)
    .eq("idDevolucion", idDevolucion);

  if (error) throw error;
  return data;
}
