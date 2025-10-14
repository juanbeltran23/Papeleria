// src/supabase/auth.jsx
import { supabase } from "./client.jsx";

// REGISTRO
export async function register({ email, password, nombre, apellidos, cedula, idRol }) {
  // 1️⃣ Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  // 2️⃣ Crear registro en tu tabla usuario con el idauth
  const { error: insertError } = await supabase.from("usuario").insert([
    {
      idauth: authData.user.id,
      nombre,
      apellidos,
      cedula,
      correo: email,
      idRol,
    },
  ]);

  if (insertError) throw insertError;

  return authData.user;
}


// LOGIN
export async function login(email, password) {
  const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) throw loginError;

  const userId = sessionData.user.id;

  // Obtener datos de tu tabla usuario (para rol, etc.)
  const { data: userData, error: userError } = await supabase
    .from("usuario")
    .select(`
      idusuario,
      idrol,
      nombre,
      apellidos,
      correo,
      rol(nombre)
    `)
    .eq("idauth", userId)
    .single();

  if (userError) throw userError;

  // Guardar sesión con datos de rol
  localStorage.setItem("user", JSON.stringify(userData));

  return userData;
}

export async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem("user");
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("usuario")
    .select(`*, rol(nombre)`)
    .eq("idauth", user.id)
    .single();

  if (error) return null;

  return data;
}
