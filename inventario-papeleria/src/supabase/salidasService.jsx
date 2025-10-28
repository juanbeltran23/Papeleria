import { supabase } from "./client";
import { getCurrentUser } from "./auth";
import { uploadImageToBucket } from "./uploadService";

/**
 * Crea una nueva salida con sus ítems, descuenta stock y registra movimientos.
 */
export async function createSalida({ solicitante, actividad, firma, items }) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("No hay usuario autenticado.");

    // 1️⃣ Subir firma al bucket
    let firmaUrl = null;
    if (firma instanceof File) {
      firmaUrl = await uploadImageToBucket(firma, "firmas-digitales");
    }

     // obtener la fecha actual en zona horaria "America/Bogota"
    const now = new Date();
    const fechaBogota = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Bogota" })
    )
      .toISOString()
      .replace("T", " ")
      .slice(0, 19); // formato "YYYY-MM-DD HH:mm:ss"

    // 2️⃣ Insertar salida principal
    const { data: salida, error: errorSalida } = await supabase
      .from("salida")
      .insert([
        {
          idUsuarioSolicitante: solicitante.idUsuario,
          idUsuarioGestor: user.idUsuario,
          actividad,
          firma: firmaUrl,
          fecha: fechaBogota,
        },
      ])
      .select()
      .single();

    if (errorSalida) throw errorSalida;

    // 3️⃣ Procesar ítems
    for (const i of items) {
      const { idItem, cantidadRequerida, cantidadDespachada } = i;

      // Obtener ítem actual
      const { data: item, error: errorItem } = await supabase
        .from("item")
        .select("stockReal, nombre")
        .eq("idItem", idItem)
        .single();
      if (errorItem) throw errorItem;

      if (item.stockReal < cantidadDespachada) {
        throw new Error(`Stock insuficiente para el ítem "${item.nombre}"`);
      }

      const nuevoStock = item.stockReal - cantidadDespachada;

      // 4️⃣ Insertar en salidaItem
      const { data: salidaItem, error: errorSalidaItem } = await supabase
        .from("salidaItem")
        .insert([
          {
            idSalida: salida.idSalida,
            idItem,
            cantidadRequerida,
            cantidadDespachada,
          },
        ])
        .select()
        .single();
      if (errorSalidaItem) throw errorSalidaItem;

      // 5️⃣ Actualizar stock
      const { error: errorStock } = await supabase
        .from("item")
        .update({ stockReal: nuevoStock })
        .eq("idItem", idItem);
      if (errorStock) throw errorStock;

      // 6️⃣ Registrar movimiento
      const { error: errorMov } = await supabase.from("movimiento").insert([
        {
          tipo: "salida",
          referenciaTipo: "salidaItem",
          idReferencia: salidaItem.idSalidaItem,
          idItem,
          descripcion: `Salida por actividad "${actividad}"`,
          fecha: new Date(),
        },
      ]);
      if (errorMov) throw errorMov;
    }

    return salida;
  } catch (error) {
    console.error("❌ Error en createSalida:", error);
    throw error;
  }
}

// Obtener todas las salidas
export async function getSalidas() {
  const { data, error } = await supabase
    .from("salida")
    .select(`
      idSalida,
      fecha,
      actividad,
      firma,
      usuarioGestor: idUsuarioGestor (nombre, apellidos),
      usuarioSolicitante: idUsuarioSolicitante (nombre, apellidos)
    `)
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data;
}

// Obtener ítems de una salida específica
export async function getSalidaItemsBySalidaId(idSalida) {
  const { data, error } = await supabase
    .from("salidaItem")
    .select(`
      idSalidaItem,
      idItem,
      cantidadRequerida,
      cantidadDespachada,
      item (nombre, codigo)
    `)
    .eq("idSalida", idSalida);

  if (error) throw error;
  return data;
}
