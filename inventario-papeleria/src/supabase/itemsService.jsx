import { supabase } from "./client";

// Subir imagen al bucket
async function uploadItemImage(file) {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from("items-images")
    .upload(fileName, file);

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from("items-images")
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}

// Crear nuevo item
export async function createItem(itemData) {
  let imageUrl = null;
  if (itemData.imagen) {
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
      qr: null, // pendiente para generación posterior
    },
  ]);

  if (error) throw error;
}

// Obtener lista de items
export async function getItems() {
  const { data, error } = await supabase
    .from("item")
    .select("*, categoria(nombre)")
    .order("idItem", { ascending: false });
  if (error) throw error;
  return data;
}

// Actualizar item
export async function updateItem(idItem, updatedData) {
  const { error } = await supabase
    .from("item")
    .update(updatedData)
    .eq("idItem", idItem);
  if (error) throw error;
}

// Eliminar item
export async function deleteItem(idItem) {
  const { error } = await supabase.from("item").delete().eq("idItem", idItem);
  if (error) throw error;
}
