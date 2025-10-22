import { supabase } from "./client";

//Obtener todos los gestores (rol = 2)
export async function getGestores() {
  const { data, error } = await supabase
    .from("usuario")
    .select("*")
    .eq("idrol", 2)
    .order("idusuario", { ascending: true });

  if (error) {
    console.error("Error al obtener gestores:", error.message);
    return [];
  }
  return data;
}

//Crear un nuevo gestor (ya con signUp en Auth)
export async function createGestor({ email, password, nombre, apellidos, cedula }) {
  // Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (authError) throw authError;

  const userId = authData.user?.id;
  if (!userId) throw new Error("No se pudo obtener el ID del nuevo gestor.");

  //Insertar en la tabla usuario
  const { error: insertError } = await supabase.from("usuario").insert([
    {
      idauth: userId,
      nombre,
      apellidos,
      cedula,
      correo: email,
      idrol: 2, // Gestor
    },
  ]);

  if (insertError) throw insertError;

  return authData.user;
}

//Actualizar los datos de un gestor
export async function updateGestor(id, { nombre, apellidos, cedula, email }) {
  const { error } = await supabase
    .from("usuario")
    .update({ nombre, apellidos, cedula, correo: email })
    .eq("idusuario", id);

  if (error) {
    console.error("Error al actualizar gestor:", error.message);
    throw error;
  }
}

// Eliminar un gestor
export async function deleteGestor(id) {
  const { error } = await supabase
    .from("usuario")
    .delete()
    .eq("idusuario", id)
    .eq("idrol", 2); // Solo borra si realmente es gestor

  if (error) {
    console.error("Error al eliminar gestor:", error.message);
    throw error;
  }
}
