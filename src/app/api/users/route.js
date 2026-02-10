import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/request";
import { query } from "@/lib/db/pool";
import { hashPassword } from "@/lib/crypto";
import {
  errorResponse,
  validationErrorResponse,
  validateRequired,
  isValidEmail,
  isValidPassword,
} from "@/lib/apiHelpers";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = [
  "ADMIN",
  "STUDENT",
  "INSTRUCTOR",
  "DATA_ANALYST",
];

const ALLOWED_CREATE_ROLES = ["ADMIN", "DATA_ANALYST"];

// Fetch users by role
export async function GET(request) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return errorResponse("Not authenticated", 401);
    }

    const { userId } = payload;

    // Verify requester is ADMIN
    const { rows: adminRows } = await query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );

    if (adminRows.length === 0) {
      return errorResponse("User not found", 404);
    }

    if (adminRows[0].role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    const url = new URL(request.url);
    const role = url.searchParams.get("role");

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return errorResponse("Invalid role", 400);
    }

    const { rows } = await query(
      `
      SELECT id, name, email, created_at
      FROM users
      WHERE role = $1
      ORDER BY created_at ASC
      `,
      [role]
    );

    return NextResponse.json({
      success: true,
      users: rows,
    });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return errorResponse("Internal server error", 500);
  }
}

// Create new user (ADMIN or DATA_ANALYST)
export async function POST(request) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return errorResponse("Not authenticated", 401);
    }

    const { userId } = payload;

    // Verify requester is ADMIN
    const { rows: adminRows } = await query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );

    if (adminRows.length === 0 || adminRows[0].role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      return validationErrorResponse({ body: "Invalid JSON body" });
    }

    const { name, email, password, role } = body;

    const errors = validateRequired(body, [
      "name",
      "email",
      "password",
      "role",
    ]);
    if (errors) return validationErrorResponse(errors);

    if (!isValidEmail(email)) {
      return validationErrorResponse({ email: "Invalid email format" });
    }

    if (!isValidPassword(password)) {
      return validationErrorResponse({
        password:
          "Password must be at least 8 characters and include uppercase, lowercase, and a number",
      });
    }

    if (!ALLOWED_CREATE_ROLES.includes(role)) {
      return validationErrorResponse({
        role: "Only ADMIN or DATA_ANALYST can be created here",
      });
    }

    // Ensure email uniqueness
    const { rows: existing } = await query(
      "SELECT 1 FROM users WHERE email = $1",
      [email]
    );

    if (existing.length > 0) {
      return errorResponse("User with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    const { rows } = await query(
      `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at
      `,
      [name, email, passwordHash, role]
    );

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: rows[0],
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/users error:", err);
    return errorResponse("Internal server error", 500);
  }
}
