import { supabase } from "@/lib/supabaseClient";
import type { Employee } from "@/modules/employees/employeesClient";

export interface CreatedUserPayload {
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff" | "customer";
  company_id?: string;
}

export async function createUserAccount(data: CreatedUserPayload): Promise<Employee> {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) {
    throw new Error("Unable to authenticate. Please sign in again.");
  }

  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to create user account.");
  }

  return result as Employee;
}
