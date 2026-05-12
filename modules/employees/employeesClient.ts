import { supabase } from "@/lib/supabaseClient";

export interface Employee {
  id: string;
  employee_id?: string;
  company_id?: string;
  name: string;
  passport_number?: string;
  visa_number?: string;
  emirates_id_number?: string;
  labour_card_number?: string;
  designation?: string;
  salary?: number;
  joining_date?: string;
  nationality?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_mobile?: string;
  emergency_contact_relation?: string;
  status?: string;
  passport_expiry_date?: string;
  visa_expiry_date?: string;
  emirates_id_issue_date?: string;
  emirates_id_expiry_date?: string;
  labour_card_expiry_date?: string;
  insurance?: string;
  insurance_expiry_date?: string;
  iloe_expiry_date?: string;
  date_of_birth?: string;
  role: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export async function getEmployees(companyId?: string) {
  let query = supabase
    .from("employees")
    .select(`
      *,
      companies (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as (Employee & { companies?: { id: string; name: string } })[];
}

export async function getEmployeesByRoles(roles: string[], companyId?: string) {
  let query = supabase
    .from("employees")
    .select(`
      *,
      companies (
        id,
        name
      )
    `)
    .in("role", roles)
    .order("created_at", { ascending: false });

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as (Employee & { companies?: { id: string; name: string } })[];
}

export async function getEmployeeByEmail(email: string) {
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      companies (
        id,
        name
      )
    `)
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data as Employee & { companies?: { id: string; name: string } } | null;
}

export async function getEmployee(id: string) {
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      companies (
        id,
        name
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Employee & { companies?: { id: string; name: string } };
}

export async function createEmployee(data: { 
  employee_id?: string;
  name: string;
  passport_number?: string;
  passport_expiry_date?: string;
  visa_number?: string;
  visa_expiry_date?: string;
  emirates_id_number?: string;
  emirates_id_issue_date?: string;
  emirates_id_expiry_date?: string;
  labour_card_number?: string;
  labour_card_expiry_date?: string;
  designation?: string;
  salary?: number;
  joining_date?: string;
  nationality?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_mobile?: string;
  emergency_contact_relation?: string;
  status?: string;
  insurance?: string;
  insurance_expiry_date?: string;
  iloe_expiry_date?: string;
  date_of_birth?: string;
  company_id?: string;
  role?: string;
  created_by?: string;
}) {
  const { data: result, error } = await supabase
    .from("employees")
    .insert(data)
    .select(`
      *,
      companies (
        id,
        name
      )
    `)
    .single();

  if (error) throw error;
  return result as Employee & { companies?: { id: string; name: string } };
}

export async function updateEmployee(id: string, data: { 
  employee_id?: string;
  name?: string;
  passport_number?: string;
  passport_expiry_date?: string;
  visa_number?: string;
  visa_expiry_date?: string;
  emirates_id_number?: string;
  emirates_id_issue_date?: string;
  emirates_id_expiry_date?: string;
  labour_card_number?: string;
  labour_card_expiry_date?: string;
  designation?: string;
  salary?: number;
  joining_date?: string;
  nationality?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_mobile?: string;
  emergency_contact_relation?: string;
  status?: string;
  insurance?: string;
  insurance_expiry_date?: string;
  iloe_expiry_date?: string;
  date_of_birth?: string;
  company_id?: string;
  role?: string;
  updated_by?: string;
}) {
  const { data: result, error } = await supabase
    .from("employees")
    .update(data)
    .eq("id", id)
    .select(`
      *,
      companies (
        id,
        name
      )
    `)
    .single();

  if (error) throw error;
  return result as Employee & { companies?: { id: string; name: string } };
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
