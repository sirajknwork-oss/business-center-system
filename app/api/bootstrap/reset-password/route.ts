import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bootstrapSecret = process.env.BOOTSTRAP_SECRET;

export async function POST(request: Request) {
  // Check environment variables
  if (!supabaseUrl || !supabaseServiceRoleKey || !bootstrapSecret) {
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

  // Get the user by email
  const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();

  if (fetchError || !users) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }

  const user = users.users.find((u) => u.email === email);

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  // Update the password and set creator role in metadata
  const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { 
      password,
      user_metadata: {
        role: "creator",
      },
    }
  );

  if (updateError || !updatedUser.user) {
    console.error("Failed to reset password:", updateError);
    return NextResponse.json(
      { error: updateError?.message || "Failed to reset password" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Password reset successfully",
    user: {
      id: updatedUser.user.id,
      email: updatedUser.user.email,
    },
  });
}
