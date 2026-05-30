import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const VALID_TYPES = new Set(["document", "spreadsheet", "presentation"]);

const DEFAULT_NAMES = {
  document: "Untitled document",
  spreadsheet: "Untitled spreadsheet",
  presentation: "Untitled presentation",
};

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

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "recent";
    const type = searchParams.get("type");
    const q = searchParams.get("q")?.trim();
    const cols = "id, type, name, starred, trashed, thumbnail, created_at, updated_at, user_id";

    if (filter === "shared") {
      const email = (user.email ?? "").toLowerCase();
      let query = supabase
        .from("office_file_shares")
        .select(`role, file:office_files!inner(${cols})`)
        .eq("office_files.trashed", false)
        .or(`user_id.eq.${user.id},email.eq.${email}`)
        .order("created_at", { ascending: false });

      if (type && VALID_TYPES.has(type)) query = query.eq("office_files.type", type);
      if (q) query = query.ilike("office_files.name", `%${q}%`);

      const { data, error } = await query;
      if (error) {
        console.error("[API] Supabase error (shared files):", error);
        return NextResponse.json({ error: "Database Error", details: error.message }, { status: 500 });
      }

      const files = (data ?? [])
        .filter((row) => row.file)
        .map((row) => ({ ...row.file, _role: row.role }));
      return NextResponse.json({ files, viewerId: user.id });
    }

    let query = supabase
      .from("office_files")
      .select(cols)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (filter === "trash") {
      query = query.eq("trashed", true);
    } else {
      query = query.eq("trashed", false);
      if (filter === "starred") query = query.eq("starred", true);
    }

    if (type && VALID_TYPES.has(type)) query = query.eq("type", type);
    if (q) query = query.ilike("name", `%${q}%`);

    const { data, error } = await query;

    if (error) {
      console.error("[API] Supabase error (list files):", error);
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500 },
      );
    }

    const files = (data ?? []).map((f) => ({ ...f, _role: "owner" }));
    return NextResponse.json({ files, viewerId: user.id });
  } catch (error) {
    console.error("[API] Error listing files:", error);
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
    const { type } = body;
    const name = body.name?.trim();

    if (!type || !VALID_TYPES.has(type)) {
      return NextResponse.json(
        { error: "Invalid or missing file type" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("office_files")
      .insert({
        user_id: user.id,
        type,
        name: name || DEFAULT_NAMES[type],
        content: body.content ?? {},
      })
      .select()
      .single();

    if (error) {
      console.error("[API] Supabase error (create file):", error);
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error creating file:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
