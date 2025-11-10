  import { supabase } from "../supabase/client";
  import { getItemById } from "./itemsService";
  import { getCurrentUser } from "./auth";


// Crear inventario físico
export async function createInventario({ tipo }) {
  const user = await getCurrentUser();
  const idUsuarioGestor = user?.idUsuario;

  const fechaInicio = new Date().toISOString(); // Hora actual en UTC

  const { data, error } = await supabase
    .from("inventarioFisico")
    .insert([
      {
        idUsuarioGestor,
        tipo,
        estado: "En progreso",
        fechaInicio, // guardar fecha correcta
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Agregar ítem y registrar conteo físico
export async function addInventarioDetalle({ idInventario, idItem, stockContado }) {
  const user = await getCurrentUser();
  const idUsuarioGestor = user?.idUsuario;

  const fechaBogota = new Date().toISOString(); // hora actual

  const item = await getItemById(idItem);
  const stockSistema = item.stockReal;
  const diferencia = stockContado - stockSistema;

  const { data, error } = await supabase
    .from("inventarioFisicoDetalle")
    .insert([
      {
        idInventario,
        idItem,
        stockSistema,
        stockContado,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  if (diferencia !== 0) {
    // registrar ajuste
    const { error: ajusteError } = await supabase.from("ajuste").insert([
      {
        idItem,
        idUsuarioGestor,
        tipo: "ajuste inventario",
        cantidad: diferencia,
        motivo: "Diferencia detectada en conteo físico",
        fecha: fechaBogota,
      },
    ]);

    if (ajusteError) throw ajusteError;

    // actualizar stock real
    const { error: updateError } = await supabase
      .from("item")
      .update({ stockReal: stockContado })
      .eq("idItem", idItem);

    if (updateError) throw updateError;
  }

  return data;
}

  // Obtener detalles del inventario
  export async function getInventarioDetalle(idInventario) {
    const { data, error } = await supabase
      .from("inventarioFisicoDetalle")
      .select(`
        idDetalleInventario,
        idItem,
        stockSistema,
        stockContado,
        item (
          nombre,
          codigo,
          categoria (nombre)
        )
      `)
      .eq("idInventario", idInventario);

    if (error) throw error;
    return data;
  }


// Finalizar inventario
export async function finalizarInventario(idInventario) {
  const fechaFin = new Date().toISOString(); // hora actual

  const { error } = await supabase
    .from("inventarioFisico")
    .update({
      fechaFin,
      estado: "Finalizado",
    })
    .eq("idInventario", idInventario);

  if (error) throw error;
}

  // Obtener todos los inventarios con cantidad de diferencias de manera eficiente
  export async function getInventarios() {
    try {
      // Traer todos los inventarios
      const { data: inventarios, error: errorInventario } = await supabase
        .from("inventarioFisico")
        .select("*")
        .order("idInventario", { ascending: false });

      if (errorInventario) throw errorInventario;

      // Traer todos los detalles de inventarios de una sola vez
      const { data: detalles, error: errorDetalle } = await supabase
        .from("inventarioFisicoDetalle")
        .select("idInventario, stockSistema, stockContado");

      if (errorDetalle) throw errorDetalle;

      // Contar diferencias por inventario
      const diferenciasMap = {};
      detalles.forEach(d => {
        if (d.stockContado !== null && d.stockContado !== d.stockSistema) {
          diferenciasMap[d.idInventario] = (diferenciasMap[d.idInventario] || 0) + 1;
        }
      });

      // Asignar la cantidad de diferencias a cada inventario
      const inventariosConDiferencias = inventarios.map(inv => ({
        ...inv,
        cantDiferencias: diferenciasMap[inv.idInventario] || 0,
      }));

      return inventariosConDiferencias;
    } catch (err) {
      console.error("Error en getInventarios:", err);
      throw err;
    }
  }