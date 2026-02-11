import { NextResponse } from "next/server";
import { query } from "@/lib/db/pool";
import { verifyPassword, hashPassword } from "@/lib/crypto";
import {
  errorResponse,
  validationErrorResponse,
  validateRequired,
  isValidEmail,
  isValidPassword,
} from "@/lib/apiHelpers";

export async function POST(request) {
  let body = {};

  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: "Invalid JSON body" });
  }

  const { email, oldPassword, newPassword } = body;

  const errors = validateRequired(body, ["email", "oldPassword", "newPassword"]);
  if (errors) return validationErrorResponse(errors);

  if (!isValidEmail(email)) {
    return validationErrorResponse({ email: "Invalid email format" });
  }

  if (!isValidPassword(newPassword)) {
    return validationErrorResponse({
      newPassword: "Password must be at least 8 characters",
    });
  }

  if (oldPassword === newPassword) {
    return validationErrorResponse({
      newPassword: "New password must be different from old password",
    });
  }

  try {
    const { rows } = await query(
      `
      SELECT id, password_hash
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    const user = rows[0] ?? null;

    const passwordHash =
      user?.password_hash ??
      "$2b$12$invalidinvalidinvalidinvalidinvalidinv";

    const passwordOk = await verifyPassword(oldPassword, passwordHash);

    if (!user || !passwordOk) {
      return errorResponse("Invalid email or old password", 401);
    }

    const newPasswordHash = await hashPassword(newPassword);

    await query(
      `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      `,
      [newPasswordHash, user.id]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return errorResponse("Failed to change password", 500);
  }
}
