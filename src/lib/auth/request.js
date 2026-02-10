import { verifyToken } from "../crypto";

export const extractToken = (request) => {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  return match?.[1] ?? null;
};

export const getUserFromRequest = (request) => {
  const token = extractToken(request);
  if (!token) return null;

  return verifyToken(token);
};
