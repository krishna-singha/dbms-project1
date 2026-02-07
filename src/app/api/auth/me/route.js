import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/request";
import { query } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

// Prevent caching of auth data
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const payload = getUserFromRequest(request);

    if (!payload) {
      return errorResponse("Not authenticated", 401);
    }

    const { userId } = payload;

    // Fetch base user
    const { rows } = await query(
      `
      SELECT id, name, email, role
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    const user = rows[0];

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Role-specific profile
    let profile = null;

    switch (user.role) {
      case "STUDENT": {
        const { rows } = await query(
          `
          SELECT age, country, skill_level, category
          FROM students
          WHERE user_id = $1
          `,
          [user.id]
        );
        profile = rows[0] ?? null;
        break;
      }

      case "INSTRUCTOR": {
        const { rows } = await query(
          `
          SELECT experience, rating
          FROM instructors
          WHERE user_id = $1
          `,
          [user.id]
        );
        profile = rows[0] ?? null;
        break;
      }

      case "ADMIN":
      case "DATA_ANALYST":
        profile = null;
        break;

      default:
        console.error("Unknown role in /me", user.role);
        return errorResponse("Invalid user role", 500);
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get current user error", {
      message: error.message,
      stack: error.stack,
    });

    return errorResponse("Failed to get current user", 500);
  }
}
