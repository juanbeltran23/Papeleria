import { supabase } from "../supabase/client";
import { getCurrentUser } from "./auth";
import { createAlerta } from "./alertaService";

/**
 * Crea una solicitud:
 * - inserta fila en 'solicitud'
 * - inserta filas en 'solicitudItem' (si hay items seleccionados)
 * - devuelve la solicitud creada con items
 *
 * payload:
 * {
 *   actividad, fechaActividad (string yyyy-mm-dd | null),
 *   descripcionMaterial (string | null)  // para materiales nuevos
 *   items: [{ idItem, cantidad }]
 * }
 */
export async function createSolicitud({
  actividad,
  fechaActividad = null,
  descripcionMaterial = null,
  items = [], // ✅ usar plural
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No hay usuario autenticado.");

  // 1) crear solicitud
  const { data: solicitud, error: errSol } = await supabase
    .from("solicitud")
    .insert([
      {
        idUsuarioSolicitante: user.idUsuario,
        actividad,
        descripcionMaterial,
        fechaActividad,
        estado: "pendiente",
      },
    ])
    .select()
    .single();

  if (errSol) throw errSol;

  // 2) insertar items si existen
  if (items && items.length > 0) {
    const itemsToInsert = items.map((i) => ({
      idSolicitud: solicitud.idSolicitud,
      idItem: i.idItem,
      cantidad: i.cantidad,
    }));

    const { error: errItem } = await supabase
      .from("solicitudItem")
      .insert(itemsToInsert);

    if (errItem) throw errItem;
  }

  // devolver solicitud (recargada con items)
  return getSolicitudDetalle(solicitud.idSolicitud);
}

/**
 * Obtener listado de solicitudes
 */
export async function getSolicitudes({ forAdmin = false, estado = null, searchText = "" } = {}) {
  try {
    let user = null;
    if (!forAdmin) {
      user = await getCurrentUser();
      if (!user) throw new Error("No autenticado");
    }

    let query = supabase
      .from("solicitud")
      .select(`
        idSolicitud,
        idUsuarioSolicitante,
        idUsuarioAdministrador,
        actividad,
        descripcionMaterial,
        fechaActividad,
        fechaSolicitud,
        estado,
        usuarioSolicitante:usuario!solicitud_idUsuarioSolicitante_fkey(idUsuario, nombre, apellidos, correo, cedula),
        usuarioAdministrador:usuario!solicitud_idUsuarioAdministrador_fkey(idUsuario, nombre, apellidos, correo, cedula),
        solicitudItem(
          idSolicitudItem,
          idItem,
          cantidad,
          item:item(idItem, nombre, codigo)
        )
      `)
      .order("idSolicitud", { ascending: false });

    if (!forAdmin) {
      query = query.eq("idUsuarioSolicitante", user.idUsuario);
    }

    if (estado) query = query.eq("estado", estado);

    if (searchText && searchText.trim()) {
      query = query.or(
        `actividad.ilike.%${searchText}%,descripcionMaterial.ilike.%${searchText}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error en getSolicitudes:", err);
    throw err;
  }
}

/**
 * Obtener detalle de una solicitud con items e info de usuarios
 */
export async function getSolicitudDetalle(idSolicitud) {
  const { data, error } = await supabase
    .from("solicitud")
    .select(`
      idSolicitud,
      idUsuarioSolicitante,
      idUsuarioAdministrador,
      actividad,
      descripcionMaterial,
      fechaActividad,
      fechaSolicitud,
      estado,
      usuarioSolicitante: idUsuarioSolicitante (idUsuario, nombre, apellidos, correo),
      usuarioAdministrador: idUsuarioAdministrador (idUsuario, nombre, apellidos, correo),
      solicitudItem (
        idSolicitudItem,
        idItem,
        cantidad,
        item: idItem (
          idItem,
          nombre,
          codigo,
          stockReal,
          idCategoria,
          categoria: idCategoria (idCategoria, nombre)
        )
      )
    `)
    .eq("idSolicitud", idSolicitud)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Aprobar o rechazar una solicitud
 * - actualiza estado en 'solicitud'
 * - crea alertas para solicitante y gestor (si aplica)
 */
export async function procesarSolicitud({
  idSolicitud,
  estado,
  idGestor = null,
  motivo = "",
}) {
  const { data: solicitudData, error: solicitudError } = await supabase
    .from("solicitud")
    .update({
      estado,
      idUsuarioAdministrador: 2, // aquí deberías usar el admin actual
    })
    .eq("idSolicitud", idSolicitud)
    .select(`
      idSolicitud,
      estado,
      idUsuarioSolicitante,
      usuarioSolicitante:usuario!solicitud_idUsuarioSolicitante_fkey(nombre, apellidos, cedula),
      solicitudItem:solicitudItem(idItem, cantidad, item:item(idItem, nombre, codigo))
    `)
    .single();

  if (solicitudError) throw solicitudError;

  const { usuarioSolicitante, solicitudItem } = solicitudData;

  // Notificación al solicitante
  const mensajeSolicitante =
    estado === "rechazada"
      ? `Tu solicitud #${idSolicitud} fue rechazada. Motivo: ${motivo}`
      : `Tu solicitud #${idSolicitud} fue aprobada por el administrador.`;

  await createAlerta({
    tipo: estado === "rechazada" ? "solicitud_rechazada" : "solicitud_aprobada",
    mensaje: mensajeSolicitante,
    idUsuario: solicitudData.idUsuarioSolicitante,
  });

  // Notificación al gestor solo si hay items de inventario
  if (estado === "aprobada" && idGestor) {
    const itemsInventario = solicitudItem.filter((si) => si.idItem);

    if (itemsInventario.length > 0) {
      const mensajeGestor = `
        Nueva solicitud aprobada para despacho:
        Solicitante: ${usuarioSolicitante.nombre} ${usuarioSolicitante.apellidos} (${usuarioSolicitante.cedula})
        Materiales solicitados:
        ${itemsInventario
          .map(
            (i) =>
              `• ${i.item.nombre} (Código: ${i.item.codigo}) — Cantidad: ${i.cantidad}`
          )
          .join("\n")}
      `;

      await createAlerta({
        tipo: "salida_pendiente",
        mensaje: mensajeGestor,
        idUsuario: idGestor,
      });
    }
  }

  return solicitudData;
}
