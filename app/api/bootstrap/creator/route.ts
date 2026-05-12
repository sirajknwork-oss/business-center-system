import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bootstrapSecret = process.env.BOOTSTRAP_SECRET;

export async function POST(request: Request) {
  // Check environment variables
  if (!supabaseUrl || !supabaseServiceRoleKey || !bootstrapSecret) {
    console.error("Missing environment variables:", {
      supabaseUrl: !!supabaseUrl,
      supabaseServiceRoleKey: !!supabaseServiceRoleKey,
      bootstrapSecret: !!bootstrapSecret,
    });
    return NextResponse.json(
      { error: "Server configuration error: missing environment variables" },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  const authHeader = request.headers.get("x-bootstrap-secret") || "";

  if (!authHeader || authHeader !== bootstrapSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
  }

  // Create the creator user in auth
  const { data: createdUser, error: creationError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "creator",
    },
  });

  if (creationError || !createdUser.user) {
    console.error("Failed to create creator account:", creationError);
    return NextResponse.json(
      { error: creationError?.message || "Failed to create creator account" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Creator account created successfully",
    user: {
      id: createdUser.user.id,
      email: createdUser.user.email,
    },
  });
}
