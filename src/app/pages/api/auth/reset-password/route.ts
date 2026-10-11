import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    const hashed = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
      .from("users")
      .update({ password: hashed })
      .eq("email", email)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Reset Error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
