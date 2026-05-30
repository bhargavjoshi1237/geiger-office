import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const ROLES = new Set(["viewer", "commenter", "editor"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getRole(supabase, id) {
  const { data, error } = await supabase.rpc("office_file_role", { f_id: id });
  if (error) return null;
  return data ?? null;
}

async function requireUser(supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getRole(supabase, id);
    if (!role) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const { data: file, error: fileErr } = await supabase
      .from("office_files")
      .select("id, name, type, user_id, visibility, link_role")
      .eq("id", id)
      .single();
    if (fileErr) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const isOwner = role === "owner";
    let shares = [];
    if (isOwner) {
      const { data } = await supabase
        .from("office_file_shares")
        .select("id, email, role, user_id, created_at")
        .eq("file_id", id)
        .order("created_at", { ascending: true });
      shares = data ?? [];
    }

    return NextResponse.json({
      file: { id: file.id, name: file.name, type: file.type },
      isOwner,
      myRole: role,
      visibility: file.visibility,
      linkRole: file.link_role,
      shares,
      me: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("[API] Error reading share state:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if ((await getRole(supabase, id)) !== "owner") {
      return NextResponse.json({ error: "Only the owner can share this file" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const role = body.role;
    const userId = UUID_RE.test(body.userId ?? "") ? body.userId : null;

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (!ROLES.has(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (email === user.email?.toLowerCase()) {
      return NextResponse.json({ error: "You already own this file" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("office_file_shares")
      .upsert({ file_id: id, email, role, user_id: userId }, { onConflict: "file_id,email" })
      .select("id, email, role, user_id, created_at")
      .single();

    if (error) {
      console.error("[API] Supabase error (add share):", error);
      return NextResponse.json({ error: "Database Error", details: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error adding share:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if ((await getRole(supabase, id)) !== "owner") {
      return NextResponse.json({ error: "Only the owner can change access" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const update = {};
    if (body.visibility === "restricted" || body.visibility === "link") {
      update.visibility = body.visibility;
    }
    if (ROLES.has(body.link_role)) update.link_role = body.link_role;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("office_files")
      .update(update)
      .eq("id", id)
      .select("id, visibility, link_role")
      .single();

    if (error) {
      return NextResponse.json({ error: "Database Error", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ visibility: data.visibility, linkRole: data.link_role });
  } catch (error) {
    console.error("[API] Error updating general access:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
