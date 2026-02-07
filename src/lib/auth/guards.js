import { getUserFromRequest } from "./request";
import {
  unauthorizedResponse,
  forbiddenResponse,
} from "../apiHelpers";

export const requireAuth = (handler) => {
  return async (request, context) => {
    const user = getUserFromRequest(request);
    if (!user) {
      return unauthorizedResponse("Authentication required");
    }

    return handler(request, context, user);
  };
};

export const requireRole = (...roles) => {
  return (handler) =>
    requireAuth((request, context, user) => {
      if (!roles.includes(user.role)) {
        return forbiddenResponse("Insufficient permissions");
      }
      return handler(request, context, user);
    });
};

export const requireAdmin = requireRole("ADMIN");
export const requireStudent = requireRole("STUDENT");
export const requireInstructor = requireRole("INSTRUCTOR");
export const requireDataAnalyst = requireRole("DATA_ANALYST");
