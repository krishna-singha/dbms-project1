import { getUserFromRequest } from "@/lib/auth/request";
import { query } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

export async function DELETE(request, { params }) {
  const { id: courseId, contentId } = await params;
  const user = getUserFromRequest(request);

  if (!user || user.role !== "INSTRUCTOR") {
    return errorResponse("Forbidden - Instructor access required", 403);
  }

  try {
    const { rows: teachCheck } = await query(
      `SELECT 1 FROM teaches WHERE course_id = $1 AND instructor_id = $2`,
      [courseId, user.userId]
    );

    if (teachCheck.length === 0) {
      return errorResponse("You don't teach this course", 403);
    }

    const { rows } = await query(
      `DELETE FROM contents WHERE id = $1 AND course_id = $2 RETURNING id`,
      [contentId, courseId]
    );

    if (rows.length === 0) {
      return errorResponse("Content not found", 404);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting content:", error);
    return errorResponse("Failed to delete content", 500);
  }
}

export async function PATCH(request, { params }) {
  const { id: courseId, contentId } = await params;
  const user = getUserFromRequest(request);

  if (!user || user.role !== "INSTRUCTOR") {
    return errorResponse("Forbidden - Instructor access required", 403);
  }

  try {
    const { rows: teachCheck } = await query(
      `SELECT 1 FROM teaches WHERE course_id = $1 AND instructor_id = $2`,
      [courseId, user.userId]
    );

    if (teachCheck.length === 0) {
      return errorResponse("You don't teach this course", 403);
    }

    const body = await request.json();
    const { type, body: contentBody } = body;

    if (!type || !contentBody) {
      return errorResponse("Type and content body are required", 400);
    }

    if (!["BOOK", "VIDEO", "NOTES"].includes(type)) {
      return errorResponse("Invalid content type", 400);
    }

    const { rows } = await query(
      `
      UPDATE contents
      SET type = $1, body = $2
      WHERE id = $3 AND course_id = $4
      RETURNING id, type, body, created_at
      `,
      [type, contentBody, contentId, courseId]
    );

    if (rows.length === 0) {
      return errorResponse("Content not found", 404);
    }

    return Response.json({ success: true, content: rows[0] });
  } catch (error) {
    console.error("Error updating content:", error);
    return errorResponse("Failed to update content", 500);
  }
}
