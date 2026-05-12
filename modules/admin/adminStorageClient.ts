import { supabase } from "@/lib/supabaseClient";

// Auto-create table if it doesn't exist
async function ensureTableExists() {
  try {
    // Test if table exists
    const { error } = await supabase
      .from('admin_users_storage')
      .select('count')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('Creating admin_users_storage table...');
      
      // Use a simple approach: create a test record to trigger table creation
      const { error: createError } = await supabase
        .from('admin_users_storage')
        .insert([{
          name: 'temp',
          email: 'temp@temp.com',
          password: 'temp',
          role: 'admin'
        }]);
      
      if (createError) {
        console.error('Could not create table automatically:', createError.message);
        return false;
      }
      
      // Clean up temp record
      await supabase
        .from('admin_users_storage')
        .delete()
        .eq('email', 'temp@temp.com');
      
      console.log('Table created successfully');
      return true;
    }
    
    return true;
  } catch (err) {
    console.error('Error ensuring table exists:', err);
    return false;
  }
}

export interface AdminUserStorage {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff" | "customer";
  company_id?: string;
  customer_type?: "company" | "individual";
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export async function getAdminUsers(): Promise<AdminUserStorage[]> {
  try {
    // Ensure table exists
    await ensureTableExists();
    
    const { data, error } = await supabase
      .from('admin_users_storage')
      .select(`
        *,
        companies (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getAdminUsers:', err);
    return [];
  }
}

export async function createAdminUser(userData: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff" | "customer";
  company_id?: string;
}): Promise<AdminUserStorage> {
  try {
    // Ensure table exists
    await ensureTableExists();
    
    const { data, error } = await supabase
      .from('admin_users_storage')
      .insert([userData])
      .select(`
        *,
        companies (
          id,
          name
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Error in createAdminUser:', err);
    throw err;
  }
}

export async function deleteAdminUser(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('admin_users_storage')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    console.error('Error in deleteAdminUser:', err);
    throw err;
  }
}

export async function updateAdminUser(
  id: string, 
  userData: Partial<AdminUserStorage>
): Promise<AdminUserStorage> {
  try {
    const { data, error } = await supabase
      .from('admin_users_storage')
      .update(userData)
      .eq('id', id)
      .select(`
        *,
        companies (
          id,
          name
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Error in updateAdminUser:', err);
    throw err;
  }
}
