import { getUserFromRequest } from "@/lib/auth/request";
import { query } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

// Add student to course (Admin only)
export async function POST(request, { params }) {
  const { id: courseId } = await params;
  const user = getUserFromRequest(request);

  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  const { studentId } = await request.json();

  if (!studentId) {
    return errorResponse("Student ID is required", 400);
  }

  try {
    await query(
      `
      INSERT INTO enrollments (student_id, course_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [studentId, courseId]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error enrolling student:", error);
    return errorResponse("Failed to enroll student in course", 500);
  }
}

// Remove student from course (Admin only)
export async function DELETE(request, { params }) {
  const { id: courseId } = await params;
  const user = getUserFromRequest(request);

  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return errorResponse("Student ID is required", 400);
  }

  try {
    await query(
      `
      DELETE FROM enrollments
      WHERE student_id = $1 AND course_id = $2
      `,
      [studentId, courseId]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error removing student:", error);
    return errorResponse("Failed to remove student from course", 500);
  }
}
