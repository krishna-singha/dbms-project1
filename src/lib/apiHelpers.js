import { NextResponse } from "next/server";

// Base JSON response
const jsonResponse = (payload, status = 200) => {
  return NextResponse.json(payload, { status });
};

// Success response
export const successResponse = (
  data = null,
  message = "Success",
  status = 200,
) => {
  return jsonResponse(
    {
      success: true,
      message,
      ...(data !== null && { data }),
    },
    status,
  );
};

// Error response
export const errorResponse = (
  message = "Error",
  status = 500,
  errors = null,
) => {
  return jsonResponse(
    {
      success: false,
      message,
      ...(errors && { errors }),
    },
    status,
  );
};

// HTTP specific responses
export const unauthorizedResponse = (message = "Unauthorized") =>
  errorResponse(message, 401);

export const forbiddenResponse = (message = "Forbidden") =>
  errorResponse(message, 403);

export const notFoundResponse = (message = "Resource not found") =>
  errorResponse(message, 404);

export const validationErrorResponse = (errors) =>
  errorResponse("Validation failed", 422, errors);

export const serverErrorResponse = (message = "Internal server error") =>
  errorResponse(message, 500);

// Validation helpers
export const validateRequired = (data, required) => {
  const errors = {};

  for (const field of required) {
    const value = data[field];

    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      errors[field] = `${field} is required`;
    }
  }

  return Object.keys(errors).length ? errors : null;
};

// email
export function isValidEmail(email) {
  if (typeof email !== "string") return false

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  return emailRegex.test(email.trim())
}

// password
export function isValidPassword(password, options = {}) {
  if (typeof password !== "string") return false

  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = false,
  } = options

  if (password.length < minLength) return false
  if (requireUppercase && !/[A-Z]/.test(password)) return false
  if (requireLowercase && !/[a-z]/.test(password)) return false
  if (requireNumber && !/[0-9]/.test(password)) return false
  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false

  return true
}

// match
export function isMatch(value, compareWith) {
  return value === compareWith
}

export const isValidUUID = (uuid) =>
  typeof uuid === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid,
  );

// Pagination helpers
export const parsePaginationParams = (url) => {
  if (!(url instanceof URL)) {
    throw new Error("parsePaginationParams expects a URL object");
  }

  const params = url.searchParams;

  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 10));

  return { page, limit, offset: (page - 1) * limit };
};

// Sorting helpers
export const parseSortParams = (
  url,
  allowedFields = ["created_at"],
  defaultField = "created_at",
) => {
  if (!(url instanceof URL)) {
    throw new Error("parseSortParams expects a URL object");
  }

  const params = url.searchParams;

  const sortBy = allowedFields.includes(params.get("sortBy"))
    ? params.get("sortBy")
    : defaultField;

  const order = params.get("order")?.toUpperCase() === "ASC" ? "ASC" : "DESC";

  return { sortBy, order };
};

export default {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
  validateRequired,
  isValidEmail,
  isValidUUID,
  parsePaginationParams,
  parseSortParams,
};
