import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
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

    const ownedActive = () =>
      supabase
        .from("office_files")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("trashed", false);

    const [total, documents, spreadsheets, presentations, starred, trashed, shared] =
      await Promise.all([
        ownedActive(),
        ownedActive().eq("type", "document"),
        ownedActive().eq("type", "spreadsheet"),
        ownedActive().eq("type", "presentation"),
        ownedActive().eq("starred", true),
        supabase
          .from("office_files")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("trashed", true),
        supabase
          .from("office_file_shares")
          .select("id, office_files!inner(trashed)", { count: "exact", head: true })
          .eq("office_files.trashed", false)
          .or(`user_id.eq.${user.id},email.eq.${email}`),
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
