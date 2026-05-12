import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const creatorEmails = new Set(["sirajkn.work@gmail.com"]);

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentRole = (userData.user.user_metadata as { role?: string })?.role ?? null;
  const currentEmail = userData.user.email ?? "";
  if (currentRole !== "creator" && !creatorEmails.has(currentEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, password, role, company_id } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Missing required user fields" }, { status: 400 });
  }

  if (!["admin", "staff", "customer"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const { data: createdUser, error: creationError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role,
      company_id: company_id || null,
    },
  });

  if (creationError || !createdUser.user) {
    return NextResponse.json(
      { error: creationError?.message || "Failed to create auth user" },
      { status: 500 }
    );
  }

  const { data: employeeData, error: employeeError } = await supabaseAdmin
    .from("employees")
    .insert({
      name,
      email,
      role,
      company_id: company_id || null,
    })
    .select(`*, companies ( id, name )`)
    .single();

  if (employeeError) {
    await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
    return NextResponse.json({ error: employeeError.message }, { status: 500 });
  }

  return NextResponse.json(employeeData);
}
