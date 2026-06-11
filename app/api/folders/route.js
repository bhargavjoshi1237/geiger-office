import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

    const projectId = new URL(request.url).searchParams.get("project_id");
    if (projectId && projectId !== "personal" && !UUID_PATTERN.test(projectId)) {
      return NextResponse.json({ error: "Invalid project_id" }, { status: 400 });
    }

    let query = supabase
      .from("office_folders")
      .select("id, project_id, name, color, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (!projectId || projectId === "personal") query = query.eq("user_id", user.id);
    if (projectId === "personal") query = query.is("project_id", null);
    else if (projectId) query = query.eq("project_id", projectId);

    const { data, error } = await query;

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
    const projectId = body.project_id || null;
    if (projectId && !UUID_PATTERN.test(projectId)) {
      return NextResponse.json({ error: "Invalid project_id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("office_folders")
      .insert({ user_id: user.id, project_id: projectId, name, color })
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
