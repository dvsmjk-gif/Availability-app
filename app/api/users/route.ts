import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  verifyToken(token);

  const db = getDb();
  const users = db.prepare("SELECT id, name, email, role, color FROM users").all();

  return NextResponse.json(users);
}