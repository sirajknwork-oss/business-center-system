import { supabase } from "@/lib/supabaseClient";

export interface Company {
  id: string;
  company_code?: string;
  company_name: string;
  cn_number?: string;
  trade_license_number?: string;
  establishment_card_number?: string;
  vat_number?: string;
  contact_person?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
  assigned_staff_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export async function getCompanies(companyId?: string) {
  let query = supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (companyId) {
    query = query.eq("id", companyId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Company[];
}

export async function getCompany(id: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Company;
}

export async function createCompany(data: { 
  company_code?: string;
  company_name: string;
  cn_number?: string;
  trade_license_number?: string;
  establishment_card_number?: string;
  vat_number?: string;
  contact_person?: string;
  mobile?: string;
  email?: string;
  address?: string;
  status?: string;
  assigned_staff_id?: string;
}) {
  const { data: result, error } = await supabase
    .from("companies")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result as Company;
}

export async function updateCompany(id: string, data: { 
  company_code?: string;
  company_name?: string;
  cn_number?: string;
  trade_license_number?: string;
  establishment_card_number?: string;
  vat_number?: string;
  contact_person?: string;
  mobile?: string;
  email?: string;
  address?: string;
  status?: string;
  assigned_staff_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}) {
  const { data: result, error } = await supabase
    .from("companies")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return result as Company;
}

export async function deleteCompany(id: string) {
  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
