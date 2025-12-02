import { supabase } from "../supabase/client.jsx";

/**
 * REGISTRO DE USUARIOS (AUTORREGISTRO)
 * - Crea el usuario en Supabase Auth.
 * - Inserta en la tabla "usuario" con rol = 3 (Solicitante).
 */
export async function registerSolicitante({ email, password, nombre, apellidos, cedula, area, cargo }) {
  // Crear usuario en Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (authError) throw authError;

  const userId = authData.user?.id;
  if (!userId) throw new Error("No se pudo obtener el ID del usuario creado.");

  // Insertar en tabla usuario (rol 3 = solicitante)
  const { data: usuarioData, error: insertUsuarioError } = await supabase
    .from("usuario")
    .insert([
      {
        idauth: userId,
        nombre,
        apellidos,
        cedula,
        correo: email,
        idRol: 3, // solicitante por defecto
      },
    ])
    .select("idUsuario") // recuperamos el idUsuario recién insertado
    .single();

  if (insertUsuarioError) throw insertUsuarioError;

  const idUsuario = usuarioData.idUsuario;

  // Insertar en tabla solicitante (relacionada con usuario)
  const { error: insertSolicitanteError } = await supabase
    .from("solicitante")
    .insert([
      {
        idUsuario: idUsuario,
        area,
        cargo,
      },
    ]);

  if (insertSolicitanteError) throw insertSolicitanteError;

  return authData.user;
}

/**
 * LOGIN
 * - Autentica al usuario y obtiene sus datos completos (rol incluido)
 */
export async function login(email, password) {
  const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) throw loginError;

  const userId = sessionData.user.id;

  //obtener datos de tabla usuario  
  const { data: userData, error: userError } = await supabase
    .from("usuario")
    .select(`idUsuario, idRol, nombre, apellidos, correo, rol(nombre)`)
    .eq("idauth", userId)
    .single();

  if (userError) throw userError;

  localStorage.setItem("user", JSON.stringify(userData));

  return userData;
}

/**
 * LOGOUT
 */
export async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem("user");
}

/**
 * Obtener usuario actual y rol
 */
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
