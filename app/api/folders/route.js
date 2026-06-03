import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("office_folders")
      .select("id, name, color, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[API] Supabase error (list folders):", error);
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500 },
      );
    }

    const folderIds = (data ?? []).map((f) => f.id);
    let fileCounts = {};

    if (folderIds.length > 0) {
      const { data: countData } = await supabase
        .from("office_files")
        .select("folder_id")
        .in("folder_id", folderIds)
        .eq("trashed", false);

      for (const row of countData ?? []) {
        fileCounts[row.folder_id] = (fileCounts[row.folder_id] || 0) + 1;
      }
    }

    const folders = (data ?? []).map((f) => ({
      ...f,
      file_count: fileCounts[f.id] || 0,
    }));

    return NextResponse.json({ folders });
  } catch (error) {
    console.error("[API] Error listing folders:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name = body.name?.trim() || "Untitled folder";
    const color = body.color || "#4285f4";

    const { data, error } = await supabase
      .from("office_folders")
      .insert({ user_id: user.id, name, color })
      .select()
      .single();

    if (error) {
      console.error("[API] Supabase error (create folder):", error);
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ...data, file_count: 0 });
  } catch (error) {
    console.error("[API] Error creating folder:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
