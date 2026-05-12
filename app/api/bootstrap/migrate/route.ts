import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const bootstrapSecret = process.env.BOOTSTRAP_SECRET!;

export async function POST(request: Request) {
  const authHeader = request.headers.get("x-bootstrap-secret") || "";

  if (!authHeader || authHeader !== bootstrapSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🔧 Running database migrations...");

    const sqlStatements = [
      `CREATE TABLE IF NOT EXISTS public.companies (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        code TEXT UNIQUE,
        name TEXT NOT NULL,
        ded_number TEXT,
        username TEXT,
        password TEXT,
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      `CREATE TABLE IF NOT EXISTS public.employees (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'staff',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      `CREATE TABLE IF NOT EXISTS public.expiry_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        expires_at DATE NOT NULL,
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      `CREATE TABLE IF NOT EXISTS public.store_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        category TEXT NOT NULL DEFAULT 'general',
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      `ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.expiry_items ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;`
    ];

    const results: { name: string; status: string; error?: string }[] = [];

    // Execute SQL via Supabase REST API
    for (const sql of sqlStatements) {
      const statementName = sql.split('\n')[0].substring(0, 40);
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceRoleKey}`,
            "apikey": supabaseServiceRoleKey,
          },
          body: JSON.stringify({
            procedure: "exec_sql",
            args: { sql }
          })
        });

        if (response.ok) {
          console.log(`✅ ${statementName}`);
          results.push({ name: statementName, status: "success" });
        } else {
          const error = await response.text();
          console.log(`⚠️ ${statementName}: ${error}`);
          results.push({ name: statementName, status: "failed", error });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.log(`❌ ${statementName}: ${message}`);
        results.push({ name: statementName, status: "error", error: message });
      }
    }

    return NextResponse.json(
      { 
        message: "Database setup instruction sent. Please manually create tables in Supabase dashboard.",
        note: "Go to SQL Editor in Supabase and run the schema SQL files.",
        results
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Migration failed" },
      { status: 500 }
    );
  }
}
