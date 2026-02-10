import { getUserFromRequest } from "@/lib/auth/request";
import { query, withTransaction } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = getUserFromRequest(request);

  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  const body = await request.json();
  const { name, description, program_type, duration, university_id, book_id } = body;

  await query(
    `
    UPDATE courses
    SET name = $1, description = $2, program_type = $3, duration = $4, university_id = $5, book_id = $6
    WHERE id = $7
    `,
    [name, description, program_type, duration, university_id, book_id ?? null, id]
  );

  return Response.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = getUserFromRequest(request);

  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  await withTransaction(async (client) => {
    await client.query("DELETE FROM teaches WHERE course_id = $1", [id]);
    await client.query("DELETE FROM courses WHERE id = $1", [id]);
  });

  return Response.json({ success: true });
}
