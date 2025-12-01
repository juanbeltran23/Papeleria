import { supabase } from "../supabase/client";

export async function getCounts() {
  // Returns counts for main entities
  try {
    const res = {};

    const [{ count: itemsCount }, { count: usuariosCount }, { count: entradasCount }, { count: salidasCount }, { count: devolucionesCount }, { count: ajustesCount }, { count: movimientosCount }, { count: alertasActivasCount }] = await Promise.all([
      supabase.from("item").select("idItem", { count: "exact", head: true }),
      supabase.from("usuario").select("idUsuario", { count: "exact", head: true }),
      supabase.from("entrada").select("idEntrada", { count: "exact", head: true }),
      supabase.from("salida").select("idSalida", { count: "exact", head: true }),
      supabase.from("devolucion").select("idDevolucion", { count: "exact", head: true }),
      supabase.from("ajuste").select("idAjuste", { count: "exact", head: true }),
      supabase.from("movimiento").select("idMovimiento", { count: "exact", head: true }),
      // Count solicitudes pendientes instead of alertas activas
      supabase.from("solicitud").select("idSolicitud", { count: "exact", head: true }).eq("estado", "pendiente"),
    ]);

    res.items = itemsCount ?? 0;
    res.usuarios = usuariosCount ?? 0;
    res.entradas = entradasCount ?? 0;
    res.salidas = salidasCount ?? 0;
    res.devoluciones = devolucionesCount ?? 0;
    res.ajustes = ajustesCount ?? 0;
    res.movimientos = movimientosCount ?? 0;
    res.solicitudesPendientes = alertasActivasCount ?? 0;

    return res;
  } catch (error) {
    throw error;
  }
}

export async function getMovimientosLastNDays(days = 30) {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (days - 1));
    const iso = fromDate.toISOString();

    const { data, error } = await supabase
      .from("movimiento")
      .select("fecha")
      .gte("fecha", iso)
      .order("fecha", { ascending: true })
      .limit(1000);

    if (error) throw error;

    // Aggregate by day
    const counts = {};
    const daysArr = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      counts[key] = 0;
      daysArr.push(key);
    }

    data.forEach((m) => {
      const key = m.fecha ? new Date(m.fecha).toISOString().slice(0, 10) : null;
      if (key && counts.hasOwnProperty(key)) counts[key]++;
    });

    return daysArr.map((k) => ({ day: k, count: counts[k] }));
  } catch (error) {
    throw error;
  }
}

export async function getMovimientosByType(startIso, endIso) {
  try {
    // fetch movimientos in range and return counts per tipo
    const query = supabase.from("movimiento").select("tipo, fecha");
    if (startIso) query.gte("fecha", startIso);
    if (endIso) query.lte("fecha", endIso);
    const { data, error } = await query;
    if (error) throw error;

    const counts = {};
    (data || []).forEach((m) => {
      const t = m.tipo || "desconocido";
      counts[t] = (counts[t] || 0) + 1;
    });

    // convert to array sorted by count desc
    return Object.entries(counts).map(([tipo, count]) => ({ tipo, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    throw error;
  }
}

export async function getLowStockItems(limit = 5) {
  try {
    // PostgREST doesn't support comparing two columns directly (stockReal <= stockMinimo)
    // so we fetch candidate items and filter client-side.
    const { data, error } = await supabase
      .from("item")
      .select("idItem, nombre, stockReal, stockMinimo")
      .order("stockReal", { ascending: true })
      .limit(1000);

    if (error) throw error;

    const filtered = (data || []).filter((it) => {
      const real = Number(it.stockReal ?? 0);
      const min = Number(it.stockMinimo ?? 0);
      return !isNaN(real) && !isNaN(min) && real <= min;
    });

    return filtered.slice(0, limit);
  } catch (error) {
    throw error;
  }
}
