import { getUserFromRequest } from "@/lib/auth/request";
import { query } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

// Add instructor to course
export async function POST(request, { params }) {
  const { id: courseId } = await params;
  const user = getUserFromRequest(request);

  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  const { instructorId } = await request.json();

  if (!instructorId) {
    return errorResponse("Instructor ID is required", 400);
  }

  try {
    await query(
      `
      INSERT INTO teaches (instructor_id, course_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [instructorId, courseId]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error adding instructor:", error);
    return errorResponse("Failed to add instructor to course", 500);
  }
}

// Remove instructor from course
export async function DELETE(request, { params }) {
  const { id: courseId } = await params;
  const user = getUserFromRequest(request);

  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get("instructorId");

  if (!instructorId) {
    return errorResponse("Instructor ID is required", 400);
  }

  try {
    await query(
      `
      DELETE FROM teaches
      WHERE instructor_id = $1 AND course_id = $2
      `,
      [instructorId, courseId]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error removing instructor:", error);
    return errorResponse("Failed to remove instructor from course", 500);
  }
}
