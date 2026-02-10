import { getUserFromRequest } from "@/lib/auth/request";
import { query } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

// GET single university with detailed information
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Get university details
    const { rows: universityRows } = await query(
      `
      SELECT id, name, country
      FROM partner_university
      WHERE id = $1
      `,
      [id]
    );

    if (universityRows.length === 0) {
      return errorResponse("University not found", 404);
    }

    const university = universityRows[0];

    // Get courses offered by this university
    const { rows: courses } = await query(
      `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.program_type,
        c.duration,
        c.created_at,
        COUNT(DISTINCT e.student_id) as enrolled_count,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as topics
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id
      LEFT JOIN course_topics ct ON ct.course_id = c.id
      LEFT JOIN topics t ON t.id = ct.topic_id
      WHERE c.university_id = $1
      GROUP BY c.id, c.name, c.description, c.program_type, c.duration, c.created_at
      ORDER BY c.created_at DESC
      `,
      [id]
    );

    // Get statistics
    const { rows: stats } = await query(
      `
      SELECT 
        COUNT(DISTINCT c.id) as total_courses,
        COUNT(DISTINCT e.student_id) as total_students,
        COUNT(DISTINCT t.instructor_id) as total_instructors
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id
      LEFT JOIN teaches t ON t.course_id = c.id
      WHERE c.university_id = $1
      `,
      [id]
    );

    return Response.json({
      university: {
        ...university,
        courses,
        stats: stats[0],
      },
    });
  } catch (error) {
    console.error("Error fetching university:", error);
    return errorResponse("Failed to fetch university details", 500);
  }
}

// PUT - Update university (Admin only)
export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, country } = body;

    if (!name || !country) {
      return errorResponse("Name and country are required", 400);
    }

    const { rows } = await query(
      `
      UPDATE partner_university
      SET name = $1, country = $2
      WHERE id = $3
      RETURNING id, name, country
      `,
      [name, country, id]
    );

    if (rows.length === 0) {
      return errorResponse("University not found", 404);
    }

    return Response.json({ success: true, university: rows[0] });
  } catch (error) {
    console.error("Error updating university:", error);
    if (error.code === "23505") {
      return errorResponse("University with this name already exists", 409);
    }
    return errorResponse("Failed to update university", 500);
  }
}

// DELETE - Delete university (Admin only)
export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  try {
    const { id } = await params;

    // Check if university has courses
    const { rows: courseCheck } = await query(
      `SELECT COUNT(*) as count FROM courses WHERE university_id = $1`,
      [id]
    );

    if (parseInt(courseCheck[0].count) > 0) {
      return errorResponse(
        "Cannot delete university with existing courses. Delete or reassign courses first.",
        409
      );
    }

    const { rows } = await query(
      `
      DELETE FROM partner_university
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse("University not found", 404);
    }

    return Response.json({ success: true, message: "University deleted successfully" });
  } catch (error) {
    console.error("Error deleting university:", error);
    return errorResponse("Failed to delete university", 500);
  }
}
