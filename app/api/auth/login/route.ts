import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as { id: number; name: string; email: string; password: string; role: string };

  if (!user || !(await bcrypt.compare(password, user.password)))
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  res.cookies.set("token", token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
  return res;
}