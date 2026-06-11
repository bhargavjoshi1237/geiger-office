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

    const email = (user.email ?? "").toLowerCase();
    const projectId = new URL(request.url).searchParams.get("project_id");
    if (projectId && projectId !== "personal" && !UUID_PATTERN.test(projectId)) {
      return NextResponse.json({ error: "Invalid project_id" }, { status: 400 });
    }

    const scopedFiles = ({ trashed = false } = {}) => {
      let query = supabase
        .from("office_files")
        .select("id", { count: "exact", head: true })
        .eq("trashed", trashed);

      if (!projectId || projectId === "personal") query = query.eq("user_id", user.id);
      if (projectId === "personal") query = query.is("project_id", null);
      else if (projectId) query = query.eq("project_id", projectId);
      return query;
    };

    const ownedActive = () => scopedFiles();

    let sharedQuery = supabase
      .from("office_file_shares")
      .select("id, office_files!inner(trashed, project_id)", { count: "exact", head: true })
      .eq("office_files.trashed", false)
      .or(`user_id.eq.${user.id},email.eq.${email}`);
    if (projectId === "personal") sharedQuery = sharedQuery.is("office_files.project_id", null);
    else if (projectId) sharedQuery = sharedQuery.eq("office_files.project_id", projectId);

    const [total, documents, spreadsheets, presentations, starred, trashed, shared] =
      await Promise.all([
        ownedActive(),
        ownedActive().eq("type", "document"),
        ownedActive().eq("type", "spreadsheet"),
        ownedActive().eq("type", "presentation"),
        ownedActive().eq("starred", true),
        scopedFiles({ trashed: true }),
        sharedQuery,
      ]);

    return NextResponse.json({
      viewerId: user.id,
      email: user.email,
      total: total.count ?? 0,
      documents: documents.count ?? 0,
      spreadsheets: spreadsheets.count ?? 0,
      presentations: presentations.count ?? 0,
      starred: starred.count ?? 0,
      trashed: trashed.count ?? 0,
      shared: shared.count ?? 0,
    });
  } catch (error) {
    console.error("[API] Error computing stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
