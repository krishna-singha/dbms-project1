import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { id } = await params;
  const user = await getServerUser();

  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await query(
      `INSERT INTO enrollments (course_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [id, user.id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}