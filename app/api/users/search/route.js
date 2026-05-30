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

    const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
    if (q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const { data, error } = await supabase.rpc("search_office_users", { q });
    if (error) {
      console.error("[API] user search error:", error.message);
      return NextResponse.json({ users: [] });
    }

    return NextResponse.json({ users: data ?? [] });
  } catch (error) {
    console.error("[API] Error searching users:", error);
    return NextResponse.json({ users: [] });
  }
}
