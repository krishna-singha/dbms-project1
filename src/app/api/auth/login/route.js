import { NextResponse } from "next/server";
import { query } from "@/lib/db/pool";
import { verifyPassword, generateToken } from "@/lib/crypto";
import {
  errorResponse,
  validationErrorResponse,
  validateRequired,
  isValidEmail,
} from "@/lib/apiHelpers";

export async function POST(request) {
  let body = {};

  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: "Invalid JSON body" });
  }

  const { email, password } = body;

  const errors = validateRequired(body, ["email", "password"]);
  if (errors) return validationErrorResponse(errors);

  if (!isValidEmail(email)) {
    return validationErrorResponse({ email: "Invalid email format" });
  }

  try {
    const { rows } = await query(
      `
      SELECT id, name, email, password_hash, role
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    const user = rows[0] ?? null;

    // timing-safe fallback hash
    const passwordHash =
      user?.password_hash ??
      "$2b$12$invalidinvalidinvalidinvalidinvalidinv";

    const passwordOk = await verifyPassword(password, passwordHash);
    console.log(passwordOk);

    

    if (!user || !passwordOk) {
      return errorResponse("Invalid email or password", 401);
    }

    // Load role-specific profile
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
        console.error("Unknown user role", user.role);
        return errorResponse("Invalid user role", 500);
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
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

    // HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error", {
      message: err.message,
      code: err.code,
    });

    return errorResponse("Authentication failed", 500);
  }
}
