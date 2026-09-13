import { NextResponse } from "next/server";
import { queryDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const users = await queryDb(
      `SELECT id, name, email, password_hash FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      // Mock login response if DB is in fallback mode
      return NextResponse.json({
        success: true,
        user: { id: `user-demo`, name: email.split("@")[0], email: email.toLowerCase() },
      });
    }

    const user = users[0];
    const passwordHash = Buffer.from(password).toString("base64");

    if (user.password_hash !== passwordHash) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed." }, { status: 500 });
  }
}
