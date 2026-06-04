import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = verifyToken(token);
  const db = getDb();
  const user = db.prepare("SELECT id, name, email, role, color, days_off_remaining FROM users WHERE id = ?").get(decoded.id) as { id: number; name: string; email: string; role: string; color: string; days_off_remaining: number };

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}