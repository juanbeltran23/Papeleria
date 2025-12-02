import { supabase } from "../supabase/client";
import { getCurrentUser } from "./auth.js";

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
  // Si estamos en el navegador, despachamos un evento local para que el UI lo capture inmediatamente
  try {
    if (typeof window !== "undefined") {
      const ev = new CustomEvent("alerta:created", { detail: data });
      window.dispatchEvent(ev);
    }
  } catch (e) {
    // ignore
  }

  return data;
}

export async function getUltimasAlertas(limit = 5) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No hay usuario autenticado.");

  const { data, error } = await supabase
    .from("alerta")
    .select("*")
    .eq("estado", "activa")
    .eq("idUsuario", user.idUsuario)   
    .order("fecha", { ascending: false }) 
    .limit(limit); 

  if (error) throw error;
  return data;
}

export async function getTodasAlertas() {
  const { data, error } = await supabase
    .from("alerta")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAlertaById(id) {
  const { data, error } = await supabase
    .from("alerta")
    .select("*")
    .eq("idAlerta", id)
    .single();

  if (error) throw error;
  return data;
}

export async function markAlertaInactiva(id) {
  const { data, error } = await supabase
    .from("alerta")
    .update({ estado: "inactiva" })
    .eq("idAlerta", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAlertasPorUsuario() {
  const user = await getCurrentUser();
  if (!user) throw new Error("No hay usuario autenticado.");

  const { data, error } = await supabase
    .from("alerta")
    .select("*")
    .eq("idUsuario", user.idUsuario)
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data;
}
