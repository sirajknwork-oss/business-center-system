import { supabase } from "@/lib/supabaseClient";

export interface StoreItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export async function getStoreItems(companyId?: string) {
  let query = supabase
    .from("store_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as StoreItem[];
}

export async function getStoreItem(id: string) {
  const { data, error } = await supabase
    .from("store_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as StoreItem;
}

export async function createStoreItem(data: {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category: string;
  company_id?: string;
}) {
  const { data: result, error } = await supabase
    .from("store_items")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result as StoreItem;
}

export async function updateStoreItem(id: string, data: {
  name?: string;
  description?: string;
  price?: number;
  stock_quantity?: number;
  category?: string;
}) {
  const { data: result, error } = await supabase
    .from("store_items")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return result as StoreItem;
}

export async function deleteStoreItem(id: string) {
  const { error } = await supabase
    .from("store_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getStoreCategories() {
  const { data, error } = await supabase
    .from("store_items")
    .select("category")
    .not("category", "is", null);

  if (error) throw error;
  
  // Extract unique categories
  const categories = [...new Set(data.map((item: { category: string | null }) => item.category).filter(Boolean))];
  return categories;
}
