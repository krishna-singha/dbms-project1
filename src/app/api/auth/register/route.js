import { NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db/pool";
import { hashPassword, generateToken } from "@/lib/auth/crypto";
import {
  errorResponse,
  validationErrorResponse,
  validateRequired,
  isValidEmail,
  isValidPassword
} from "@/lib/apiHelpers";

const VALID_ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN", "DATA_ANALYST"];
const VALID_SKILL_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];

export async function POST(request) {
  let body = {};

  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: "Invalid JSON body" });
  }

  const { name, email, password, role, ...profileData } = body;

  const errors = validateRequired(body, ["name", "email", "password", "role"]);
  if (errors) return validationErrorResponse(errors);

  if (!isValidEmail(email)) {
    return validationErrorResponse({ email: "Invalid email format" });
  }

  if (!VALID_ROLES.includes(role)) {
    return validationErrorResponse({
      role: "Invalid role",
    });
  }

  if (!isValidPassword(password)) {
    return validationErrorResponse({
      password: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
    });
  }

  const { rows: existing } = await query(
    "SELECT 1 FROM users WHERE email = $1",
    [email]
  );

  if (existing.length > 0) {
    return errorResponse("User with this email already exists", 409);
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at
        `,
        [name, email, passwordHash, role]
      );

      const createdUser = rows[0];

      switch (role) {
        case "STUDENT": {
          const { age, country, skill_level, category } = profileData;

          if (
            skill_level &&
            !VALID_SKILL_LEVELS.includes(skill_level)
          ) {
            throw {
              type: "validation",
              errors: { skill_level: "Invalid skill level" },
            };
          }

          if (age && Number.isNaN(Number(age))) {
            throw {
              type: "validation",
              errors: { age: "Age must be a number" },
            };
          }

          await client.query(
            `
            INSERT INTO students (user_id, age, country, skill_level, category)
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
              createdUser.id,
              age ? Number(age) : null,
              country ?? null,
              skill_level ?? null,
              category ?? null,
            ]
          );
          break;
        }

        case "INSTRUCTOR": {
          const { experience } = profileData;

          if (experience && Number.isNaN(Number(experience))) {
            throw {
              type: "validation",
              errors: { experience: "Experience must be a number" },
            };
          }

          await client.query(
            `
            INSERT INTO instructors (user_id, experience, rating)
            VALUES ($1, $2, $3)
            `,
            [createdUser.id, experience ? Number(experience) : 0, 0]
          );
          break;
        }

        case "ADMIN":
        case "DATA_ANALYST":
          break;

        default:
          throw new Error("Invalid role");
      }

      return createdUser;
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user,
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    if (err?.type === "validation") {
      return validationErrorResponse(err.errors);
    }

    console.error("Registration error", {
      message: err.message,
      code: err.code,
    });

    return errorResponse("Failed to register user", 500);
  }
}
