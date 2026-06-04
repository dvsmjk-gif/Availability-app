import { getDb, countDays } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  const db = getDb();

  const requests = user.role === "employee"
    ? db.prepare(`
        SELECT lr.*, u.name as user_name, u.color as user_color
        FROM leave_requests lr
        JOIN users u ON lr.user_id = u.id
        WHERE lr.user_id = ?
        ORDER BY lr.created_at DESC
      `).all(user.id)
    : db.prepare(`
        SELECT lr.*, u.name as user_name, u.color as user_color
        FROM leave_requests lr
        JOIN users u ON lr.user_id = u.id
        ORDER BY lr.created_at DESC
      `).all();

  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  const { start_date, end_date, start_time, end_time } = await req.json();

  if (!start_date || !end_date)
    return NextResponse.json({ error: "Start and end date are required" }, { status: 400 });

  const db = getDb();

  const existing = db.prepare(`
    SELECT id FROM leave_requests 
    WHERE user_id = ? 
    AND status != 'rejected'
    AND start_date <= ? 
    AND end_date >= ?
  `).get(user.id, end_date, start_date);

  if (existing)
    return NextResponse.json({ error: "You already have a leave request for these dates" }, { status: 409 });

  const days = countDays(start_date, end_date);
  const userRecord = db.prepare("SELECT days_off_remaining FROM users WHERE id = ?").get(user.id) as { days_off_remaining: number };

  if (userRecord.days_off_remaining < days)
    return NextResponse.json({ error: `Not enough days off remaining. You have ${userRecord.days_off_remaining} days left.` }, { status: 400 });

  const request = db.prepare(`
    INSERT INTO leave_requests (user_id, start_date, end_date, start_time, end_time)
    VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).get(user.id, start_date, end_date, start_time, end_time);

  return NextResponse.json(request, { status: 201 });
}