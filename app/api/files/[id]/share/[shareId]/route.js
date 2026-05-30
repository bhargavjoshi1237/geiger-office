import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const ROLES = new Set(["viewer", "commenter", "editor"]);

async function requireOwner(supabase, id) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: role } = await supabase.rpc("office_file_role", { f_id: id });
  if (role !== "owner") {
    return { error: NextResponse.json({ error: "Only the owner can manage sharing" }, { status: 403 }) };
  }
  return { user };
}

export async function PATCH(request, { params }) {
  try {
    const { id, shareId } = await params;
    const supabase = await createClient();
    const { error: gate } = await requireOwner(supabase, id);
    if (gate) return gate;

    const body = await request.json().catch(() => ({}));
    if (!ROLES.has(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("office_file_shares")
      .update({ role: body.role })
      .eq("id", shareId)
      .eq("file_id", id)
      .select("id, email, role, user_id, created_at")
      .single();

    if (error) {
      const status = error.code === "PGRST116" ? 404 : 500;
      return NextResponse.json(
        { error: status === 404 ? "Share not found" : "Database Error", details: error.message },
        { status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error updating share:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id, shareId } = await params;
    const supabase = await createClient();
    const { error: gate } = await requireOwner(supabase, id);
    if (gate) return gate;

    const { error } = await supabase
      .from("office_file_shares")
      .delete()
      .eq("id", shareId)
      .eq("file_id", id);

    if (error) {
      return NextResponse.json({ error: "Database Error", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error revoking share:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
