// src/supabase/client.jsx
import { createClient } from "@supabase/supabase-js";

// 🚨 Asegúrate de tener tu archivo .env configurado correctamente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificación opcional
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Error: Falta configurar VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
