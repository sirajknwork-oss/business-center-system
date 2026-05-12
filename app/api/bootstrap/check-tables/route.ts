import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Try to query each table to check if they exist
    const checks = await Promise.all([
      supabase.from("companies").select("id").limit(1),
      supabase.from("employees").select("id").limit(1),
      supabase.from("expiry_items").select("id").limit(1),
      supabase.from("store_items").select("id").limit(1),
    ]);

    const allReady = checks.every(check => !check.error || check.error.code !== "PGRST116");

    if (allReady) {
      return NextResponse.json({ ready: true });
    } else {
      const missingTables = checks
        .map((check, i) => {
          const tableNames = ["companies", "employees", "expiry_items", "store_items"];
          return check.error ? tableNames[i] : null;
        })
        .filter(Boolean);

      return NextResponse.json({ ready: false, missingTables });
    }
  } catch {
    return NextResponse.json({ ready: false, error: "Database check failed" }, { status: 500 });
  }
}
