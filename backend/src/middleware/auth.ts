import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User.js";
import { ApiError } from "../utils/api-error.js";
import { verifyAccessToken } from "../config/jwt.js";
import type { AuthenticatedUser, Role } from "../types/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticateToken(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  let token = req.cookies?.accessToken;

  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    next(new ApiError(401, "Access token required"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('email firstName lastName role isActive schoolId');

    if (!user) {
      next(new ApiError(401, "Authenticated user not found"));
      return;
    }

    if (!user.isActive) {
      next(new ApiError(403, "This account is currently inactive"));
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      role: user.role as Role,
      schoolId: user.schoolId ? user.schoolId.toString() : undefined,
    };

    next();
  } catch {
    next(new ApiError(401, "Invalid or expired access token"));
  }
}

export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(403, "Insufficient permissions for this resource"));
      return;
    }

    next();
  };
}
