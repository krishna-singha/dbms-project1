import { getUserFromRequest } from "@/lib/auth/request";
import { query } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  const body = await request.json();
  const {
    name,
    description,
    program_type,
    duration,
    university_id,
    book_id,
  } = body;

  const { rows } = await query(
    `
    INSERT INTO courses
    (name, description, program_type, duration, university_id, book_id)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id
    `,
    [name, description, program_type, duration, university_id, book_id ?? null]
  );

  return Response.json({ success: true, courseId: rows[0].id });
}
