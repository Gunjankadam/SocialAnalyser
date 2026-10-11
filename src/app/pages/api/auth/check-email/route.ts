import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Error during email check query:", error);
      return NextResponse.json({ error: "Error checking user in database" }, { status: 500 });
    }

    return NextResponse.json({ exists: !!user });
  } catch (err) {
    console.error("General error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
