import { NextResponse } from "next/server";
import { queryDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    const userId = `user-${Date.now()}`;
    const passwordHash = Buffer.from(password).toString("base64"); // Simple hash for demo

    await queryDb(
      `INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
      [userId, name, email.toLowerCase(), passwordHash]
    );

    return NextResponse.json({
      success: true,
      user: { id: userId, name, email: email.toLowerCase() },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to register user." }, { status: 500 });
  }
}
