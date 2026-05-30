import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const ROLES = new Set(["viewer", "commenter", "editor"]);

async function getRole(supabase, id) {
  const { data, error } = await supabase.rpc("office_file_role", { f_id: id });
  if (error) return null;
  return data ?? null;
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("office_files")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      const status = error.code === "PGRST116" ? 404 : 500;
      return NextResponse.json(
        { error: status === 404 ? "File not found" : "Database Error", details: error.message },
        { status },
      );
    }

    const role = await getRole(supabase, id);
    return NextResponse.json({ ...data, _role: role });
  } catch (error) {
    console.error("[API] Error fetching file:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getRole(supabase, id);
    if (!role) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const isOwner = role === "owner";
    if (!isOwner && role !== "editor") {
      return NextResponse.json({ error: "You don't have edit access to this file" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const update = {};
    if (body.content !== undefined) update.content = body.content;
    if (typeof body.name === "string") update.name = body.name.trim() || "Untitled";

    if (isOwner) {
      if (typeof body.starred === "boolean") update.starred = body.starred;
      if (typeof body.trashed === "boolean") update.trashed = body.trashed;
      if (body.thumbnail !== undefined) update.thumbnail = body.thumbnail;
      if (body.visibility === "restricted" || body.visibility === "link") {
        update.visibility = body.visibility;
      }
      if (ROLES.has(body.link_role)) update.link_role = body.link_role;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("office_files")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const status = error.code === "PGRST116" ? 404 : 500;
      return NextResponse.json(
        { error: status === 404 ? "File not found" : "Database Error", details: error.message },
        { status },
      );
    }

    return NextResponse.json({ ...data, _role: role });
  } catch (error) {
    console.error("[API] Error updating file:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("office_files")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[API] Supabase error (delete file):", error);
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error deleting file:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
