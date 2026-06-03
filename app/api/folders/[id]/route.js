import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const updates = {};

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.color !== undefined) updates.color = body.color;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("office_folders")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[API] Supabase error (update folder):", error);
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error updating folder:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from("office_folders")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[API] Supabase error (delete folder):", error);
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API] Error deleting folder:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
