import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/request";
import { query, withTransaction } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

export const dynamic = "force-dynamic";

export async function DELETE(request, { params }) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return errorResponse("Not authenticated", 401);
    }

    const { userId: requesterId } = payload;
    const { id: targetId } = await params;

    if (!targetId) {
      return errorResponse("User id required", 400);
    }

    // Prevent self delete
    if (targetId === requesterId) {
      return errorResponse("You cannot delete your own account", 400);
    }

    // Verify requester is ADMIN
    const { rows: adminRows } = await query(
      "SELECT role FROM users WHERE id = $1",
      [requesterId]
    );

    if (adminRows.length === 0 || adminRows[0].role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    // Fetch target user
    const { rows: targetRows } = await query(
      "SELECT id, role FROM users WHERE id = $1",
      [targetId]
    );

    if (targetRows.length === 0) {
      return errorResponse("User not found", 404);
    }

    const targetRole = targetRows[0].role;

    await withTransaction(async (client) => {
      if (targetRole === "STUDENT") {
        await client.query(
          "DELETE FROM students WHERE user_id = $1",
          [targetId]
        );
      }

      if (targetRole === "INSTRUCTOR") {
        await client.query(
          "DELETE FROM instructors WHERE user_id = $1",
          [targetId]
        );
      }

      await client.query(
        "DELETE FROM users WHERE id = $1",
        [targetId]
      );
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("DELETE /api/users/[id] error:", err);
    return errorResponse("Internal server error", 500);
  }
}
