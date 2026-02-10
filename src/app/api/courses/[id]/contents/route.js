import { getUserFromRequest } from "@/lib/auth/request";
import { query } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

export async function GET(request, { params }) {
  const { id: courseId } = await params;
  const user = getUserFromRequest(request);

  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const hasAccess = await checkCourseAccess(user, courseId);
    if (!hasAccess) {
      return errorResponse("You don't have access to this course", 403);
    }

    const { rows } = await query(
      `
      SELECT id, type, body, created_at
      FROM contents
      WHERE course_id = $1
      ORDER BY created_at DESC
      `,
      [courseId]
    );

    return Response.json({ contents: rows });
  } catch (error) {
    console.error("Error fetching contents:", error);
    return errorResponse("Failed to fetch contents", 500);
  }
}

export async function POST(request, { params }) {
  const { id: courseId } = await params;
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
      INSERT INTO contents (course_id, type, body)
      VALUES ($1, $2, $3)
      RETURNING id, type, body, created_at
      `,
      [courseId, type, contentBody]
    );

    return Response.json({ success: true, content: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating content:", error);
    return errorResponse("Failed to create content", 500);
  }
}

async function checkCourseAccess(user, courseId) {
  if (user.role === "ADMIN") return true;

  if (user.role === "INSTRUCTOR") {
    const { rows } = await query(
      `SELECT 1 FROM teaches WHERE course_id = $1 AND instructor_id = $2`,
      [courseId, user.userId]
    );
    return rows.length > 0;
  }

  if (user.role === "STUDENT") {
    const { rows } = await query(
      `SELECT 1 FROM enrollments WHERE course_id = $1 AND student_id = $2`,
      [courseId, user.userId]
    );
    return rows.length > 0;
  }

  return false;
}
