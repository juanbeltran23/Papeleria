import { supabase } from "../supabase/client";
import { uploadImageToBucket } from "./uploadService";

// 🖼️ Subir imagen al bucket específico de ítems
export async function uploadItemImage(file) {
  return await uploadImageToBucket(file, "items-images");
}

// 🧱 Crear nuevo ítem
export async function createItem(itemData) {
  let imageUrl = null;

  if (itemData.imagen instanceof File) {
    imageUrl = await uploadItemImage(itemData.imagen);
  }

  const { error } = await supabase.from("item").insert([
    {
      codigo: itemData.codigo,
      nombre: itemData.nombre,
      idCategoria: itemData.idCategoria,
      tipo: itemData.tipo,
      unidad: itemData.unidad,
      stockMinimo: itemData.stockMinimo,
      inventarioInicial: itemData.inventarioInicial,
      stockReal: itemData.inventarioInicial,
      imagen: imageUrl,
      qr: null,
    },
  ]);

  if (error) throw error;
}

// 📦 Obtener lista de ítems
export async function getItems() {
  const { data, error } = await supabase
    .from("item")
    .select("*, categoria(nombre)")
    .order("idItem", { ascending: false });

  if (error) throw error;
  return data;
}

// 📂 Obtener categorías
export async function getCategorias() {
  const { data, error } = await supabase
    .from("categoria")
    .select("idCategoria, nombre")
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data;
}

// ➕ Crear nueva categoría
export async function createCategoria(nombre) {
  const { data, error } = await supabase
    .from("categoria")
    .insert([{ nombre }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 🔍 Obtener ítem por ID
export async function getItemById(id) {
  const { data, error } = await supabase
    .from("item")
    .select("*")
    .eq("idItem", id)
    .single();

  if (error) throw error;
  return data;
}

// ✏️ Actualizar ítem
export async function updateItem(id, itemData) {
  let imageUrl = itemData.imagen;

  // Si se sube una nueva imagen, reemplázala
  if (itemData.imagen instanceof File) {
    imageUrl = await uploadItemImage(itemData.imagen);
  }

  const { error } = await supabase
    .from("item")
    .update({
      ...itemData,
      imagen: imageUrl,
    })
    .eq("idItem", id);

  if (error) throw error;
}

// 🗑️ Eliminar ítem
export async function deleteItem(id) {
  const { error } = await supabase.from("item").delete().eq("idItem", id);
  if (error) throw error;
}
