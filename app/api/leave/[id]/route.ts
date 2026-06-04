import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb, countDays } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);

  if (user.role === "employee")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status, rejection_reason } = await req.json();

  if (!["approved", "rejected"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const db = getDb();
  const request = db.prepare(`
    UPDATE leave_requests
    SET status = ?, rejection_reason = ?, reviewed_by = ?, updated_at = datetime('now')
    WHERE id = ?
    RETURNING *
  `).get(status, rejection_reason ?? null, user.id, id);


  if (status === "approved") {
  const leaveRequest = db.prepare("SELECT start_date, end_date, user_id FROM leave_requests WHERE id = ?").get(id) as { start_date: string; end_date: string; user_id: number };
  const days = countDays(leaveRequest.start_date, leaveRequest.end_date);
  db.prepare("UPDATE users SET days_off_remaining = days_off_remaining - ? WHERE id = ?").run(days, leaveRequest.user_id);
}

  if (!request)
    return NextResponse.json({ error: "Request not found" }, { status: 404 });

  return NextResponse.json(request);
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  const { id } = await params;
  const db = getDb();

  const request = db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(id) as { user_id: number; status: string } | undefined;

  if (!request)
    return NextResponse.json({ error: "Request not found" }, { status: 404 });

  if (request.user_id !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (request.status !== "pending")
    return NextResponse.json({ error: "Only pending requests can be deleted" }, { status: 400 });

  db.prepare("DELETE FROM leave_requests WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}