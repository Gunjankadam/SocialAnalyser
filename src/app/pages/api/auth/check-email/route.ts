import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import { UserDocument } from "@/models/User";  // Make sure this is properly exported

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Connect to the database
    await connectDB();

    try {
      // Attempt to find the user by email
      const user = await User.findOne({ email }) as UserDocument | null;

      if (user) {
        // If user exists, return true
        return NextResponse.json({ exists: true });
      } else {
        // If user does not exist, return false
        return NextResponse.json({ exists: false });
      }
    } catch (dbError) {
      // Catch any error specific to the findOne query
      console.error("Error during findOne query:", dbError);
      return NextResponse.json({ error: "Error checking user in database" }, { status: 500 });
    }
  } catch (err) {
    // Catch any general errors
    console.error("General error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
