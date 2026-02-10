import { getUserFromRequest } from "@/lib/auth/request";
import { query } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

// GET all universities
export async function GET() {
  try {
    const { rows } = await query(`
      SELECT 
        u.id,
        u.name,
        u.country,
        COUNT(DISTINCT c.id) as course_count
      FROM partner_university u
      LEFT JOIN courses c ON c.university_id = u.id
      GROUP BY u.id, u.name, u.country
      ORDER BY u.name ASC
    `);

    return Response.json({ universities: rows });
  } catch (error) {
    console.error("Error fetching universities:", error);
    return errorResponse("Failed to fetch universities", 500);
  }
}

// POST - Create new university (Admin only)
export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  try {
    const body = await request.json();
    const { name, country } = body;

    if (!name || !country) {
      return errorResponse("Name and country are required", 400);
    }

    const { rows } = await query(
      `
      INSERT INTO partner_university (name, country)
      VALUES ($1, $2)
      RETURNING id, name, country
      `,
      [name, country]
    );

    return Response.json({ success: true, university: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating university:", error);
    if (error.code === "23505") {
      return errorResponse("University with this name already exists", 409);
    }
    return errorResponse("Failed to create university", 500);
  }
}
