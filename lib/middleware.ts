import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    return decoded; // { userId, role }
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export function requireAdmin(req: NextRequest) {
  const user = requireAuth(req);
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
