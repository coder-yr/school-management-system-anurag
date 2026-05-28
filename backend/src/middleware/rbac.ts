import type { NextFunction, Request, Response } from "express";
import { Role } from "../models/Role.js";
import { ApiError } from "../utils/api-error.js";

/**
 * Middleware to check if the authenticated user has the required permissions.
 * SUPER_ADMIN bypasses this check automatically.
 * 
 * @param requiredPermissions Array of permission names required (e.g., 'CREATE_STUDENT')
 */
export function requirePermissions(...requiredPermissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new ApiError(401, "Authentication required"));
      }

      // SUPER_ADMIN has god-mode, bypass all permission checks
      if (req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      if (!req.user.schoolId) {
        return next(new ApiError(403, "User is not associated with a school"));
      }

      // Fetch the role for the user's school and populate permissions
      const roleDoc = await Role.findOne({ 
        name: req.user.role, 
        schoolId: req.user.schoolId 
      }).populate('permissions');

      if (!roleDoc) {
        return next(new ApiError(403, "Role configuration not found for this user"));
      }

      // Extract permission names
      const userPermissions = (roleDoc.permissions as any[]).map(p => p.name);

      // Check if user has ALL required permissions (or ANY, depending on business logic)
      // We'll enforce ALL required permissions here
      const hasAllPermissions = requiredPermissions.every(rp => userPermissions.includes(rp));

      if (!hasAllPermissions) {
        return next(new ApiError(403, "Insufficient permissions to perform this action"));
      }

      next();
    } catch (error) {
      next(new ApiError(500, "Error verifying permissions"));
    }
  };
}

/**
 * Middleware to ensure the user can only access resources belonging to their school.
 * SUPER_ADMIN can access any school.
 * 
 * It expects the schoolId to be present in either req.params.schoolId or req.body.schoolId.
 */
export function requireSchoolAccess(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  const targetSchoolId = req.params.schoolId || req.body.schoolId;

  if (!targetSchoolId) {
    // If route doesn't specify schoolId, we could optionally append the user's schoolId to the query/body.
    // But for explicit checks, if it's missing, we let it pass OR block. 
    // Usually, you'd force all requests to be school-scoped.
    return next(new ApiError(400, "School ID is required for this request"));
  }

  if (targetSchoolId.toString() !== req.user.schoolId) {
    return next(new ApiError(403, "Access denied: Resource belongs to a different school"));
  }

  next();
}
