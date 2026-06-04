import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password)
    return NextResponse.json({ error: "All fields required" }, { status: 400 });

  const db = getDb();
  const hash = await bcrypt.hash(password, 10);

  try {
    const user = db.prepare(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?) RETURNING id, email, role"
    ).get(name, email, hash) as { id: number; email: string; role: string };

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set("token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }
}