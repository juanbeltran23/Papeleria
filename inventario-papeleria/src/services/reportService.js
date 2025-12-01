import { supabase } from "../supabase/client";

// Filters: { startIso, endIso, idUsuario, idItem, estado, tipo }
export async function getSalidas(filters = {}) {
  const { startIso, endIso, idUsuario } = filters;
  let q = supabase.from("salida").select(`*, salidaItem(*)`);
  if (startIso) q = q.gte("fecha", startIso);
  if (endIso) q = q.lte("fecha", endIso);
  if (idUsuario) q = q.eq("idUsuarioSolicitante", idUsuario);
  const { data, error } = await q.order("fecha", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getEntradas(filters = {}) {
  const { startIso, endIso, idUsuarioGestor, idItem } = filters;
  let q = supabase.from("entrada").select("*, item(*)");
  if (startIso) q = q.gte("fecha", startIso);
  if (endIso) q = q.lte("fecha", endIso);
  if (idUsuarioGestor) q = q.eq("idUsuarioGestor", idUsuarioGestor);
  if (idItem) q = q.eq("idItem", idItem);
  const { data, error } = await q.order("fecha", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMovimientos(filters = {}) {
  const { startIso, endIso, idItem, tipo } = filters;
  let q = supabase.from("movimiento").select("*, item(*)");
  if (startIso) q = q.gte("fecha", startIso);
  if (endIso) q = q.lte("fecha", endIso);
  if (idItem) q = q.eq("idItem", idItem);
  if (tipo) q = q.eq("tipo", tipo);
  const { data, error } = await q.order("fecha", { ascending: false }).limit(1000);
  if (error) throw error;
  return data;
}

export async function getDevoluciones(filters = {}) {
  const { startIso, endIso, idUsuarioSolicitante } = filters;
  let q = supabase.from("devolucion").select("*, devolucionItem(*)");
  if (startIso) q = q.gte("fecha", startIso);
  if (endIso) q = q.lte("fecha", endIso);
  if (idUsuarioSolicitante) q = q.eq("idUsuarioSolicitante", idUsuarioSolicitante);
  const { data, error } = await q.order("fecha", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getSolicitudes(filters = {}) {
  const { startIso, endIso, estado } = filters;
  let q = supabase.from("solicitud").select("*");
  if (startIso) q = q.gte("fechaSolicitud", startIso);
  if (endIso) q = q.lte("fechaSolicitud", endIso);
  if (estado) q = q.eq("estado", estado);
  const { data, error } = await q.order("fechaSolicitud", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getItemsReport(filters = {}) {
  const { idCategoria } = filters;
  let q = supabase.from("item").select("*");
  if (idCategoria) q = q.eq("idCategoria", idCategoria);
  const { data, error } = await q.order("nombre", { ascending: true });
  if (error) throw error;
  return data;
}
