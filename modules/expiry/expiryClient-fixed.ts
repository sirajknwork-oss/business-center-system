import { supabase } from "@/lib/supabaseClient";

export interface ExpiryItem {
  id: string;
  title: string;
  description?: string;
  expires_at: string;
  company_id?: string;
  employee_id?: string;
  document_type?: string;
  document_category?: string;
  document_status?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Fixed the nested type: employees and companies are siblings in your query, not nested inside each other.
export type ExpiryItemWithRelations = ExpiryItem & {
  companies?: { id: string; name: string } | null;
  employees?: { id: string; name: string; email: string } | null;
};

export async function getExpiryItems(companyId?: string, documentType?: string, documentCategory?: string) {
  let query = supabase
    .from("expiry_items")
    .select(`
      *,
      companies (
        id,
        name
      ),
      employees (
        id,
        name,
        email
      )
    `)
    .order("expires_at", { ascending: true });

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  if (documentType) {
    query = query.eq("document_type", documentType);
  }

  if (documentCategory) {
    query = query.eq("document_category", documentCategory);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ExpiryItemWithRelations[];
}

export async function getExpiryItem(id: string) {
  const { data, error } = await supabase
    .from("expiry_items")
    .select(`
      *,
      companies (
        id,
        name
      ),
      employees (
        id,
        name,
        email
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ExpiryItemWithRelations;
} // Fixed: Added missing closing brace here

export async function createExpiryItem(data: { 
  title: string; 
  description?: string; 
  expires_at: string; 
  company_id?: string;
  employee_id?: string;
  document_type?: string;
  document_category?: string;
  document_status?: string;
}) {
  const { data: result, error } = await supabase
    .from("expiry_items")
    .insert(data)
    .select(`
      *,
      companies (
        id,
        name
      ),
      employees (
        id,
        name,
        email
      )
    `)
    .single();

  if (error) throw error;
  return result as ExpiryItemWithRelations;
} // Fixed: Added missing closing brace here

export async function updateExpiryItem(id: string, data: { 
  title?: string; 
  description?: string; 
  expires_at?: string; 
  company_id?: string;
  employee_id?: string;
  document_type?: string;
  document_category?: string;
  document_status?: string;
}) {
  const { data: result, error } = await supabase
    .from("expiry_items")
    .update(data)
    .eq("id", id)
    .select(`
      *,
      companies (
        id,
        name
      ),
      employees (
        id,
        name,
        email
      )
    `)
    .single();

  if (error) throw error;
  return result as ExpiryItemWithRelations;
} // Fixed: Added missing closing brace here

export async function deleteExpiryItem(id: string) {
  const { error } = await supabase
    .from("expiry_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}