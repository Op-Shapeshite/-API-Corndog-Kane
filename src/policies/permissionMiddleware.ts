import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { TErrorResponse, TResponse } from '../core/entities/base/response';
import PostgresAdapter from '../adapters/postgres/instance';

const sendFailureResponse = (
  res: Response, 
  errors: TErrorResponse[], 
  message: string, 
  code: number
): Response => {
  return res.status(code).json({
    status: "failed",
    message,
    data: null,
    errors,
    metadata: null,
  } as TResponse<null, null>);
};

// Cache for role permissions to reduce database queries
const permissionCache: Map<string, { permissions: string[]; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Get permissions for a role from cache or database
 */
async function getRolePermissions(roleName: string): Promise<string[]> {
  const cached = permissionCache.get(roleName);
  const now = Date.now();
  
  // Return cached permissions if still valid
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.permissions;
  }
  
  const prisma = PostgresAdapter.client;
  
  // Fetch role with permissions from database
  const role = await prisma.role.findUnique({
    where: { name: roleName },
    include: {
      rolePermissions: {
        where: { is_active: true },
        include: {
          permission: {
            select: {
              code: true,
              is_active: true,
            },
          },
        },
      },
    },
  });
  
  if (!role) {
    return [];
  }
  
  // Extract permission codes
  const permissions = role.rolePermissions
    .filter(rp => rp.permission.is_active)
    .map(rp => rp.permission.code);
  
  // Update cache
  permissionCache.set(roleName, { permissions, timestamp: now });
  
  return permissions;
}

/**
 * Clear permission cache for a specific role or all roles
 */
export function clearPermissionCache(roleName?: string): void {
  if (roleName) {
    permissionCache.delete(roleName);
  } else {
    permissionCache.clear();
  }
}

/**
 * Permission checker middleware - Validates if authenticated user has required permission(s)
 * Must be used after authMiddleware
 * 
 * @param requiredPermissions - Array of permission codes that are allowed to access the route
 *                              User needs to have at least one of the permissions
 * 
 * @example
 * // Single permission
 * router.get('/dashboard', authMiddleware, permissionMiddleware(['dashboard:read']), controller.method);
 * 
 * @example
 * // Multiple permissions (OR logic - user needs any one of them)
 * router.get('/outlets', authMiddleware, permissionMiddleware(['outlets:read', 'warehouse:outlet-stocks:read']), controller.method);
 */
export const permissionMiddleware = (requiredPermissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user exists (should be set by authMiddleware)
      if (!req.user) {
        return sendFailureResponse(
          res,
          [{ field: 'user', message: 'User not authenticated', type: 'invalid' }],
          'User not authenticated',
          401
        );
      }

      // Check if user has role property
      if (!req.user.role) {
        return sendFailureResponse(
          res,
          [{ field: 'role', message: 'User role not found', type: 'not_found' }],
          'User role not found',
          403
        );
      }

      // Get user's permissions from database
      const userPermissions = await getRolePermissions(req.user.role);
      
      // Check if user has any of the required permissions
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return sendFailureResponse(
          res,
          [{ 
            field: 'permission', 
            message: `Access denied. Required permissions: ${requiredPermissions.join(' or ')}`, 
            type: 'invalid' 
          }],
          'Insufficient permissions',
          403
        );
      }

      // User has required permission, proceed
      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return sendFailureResponse(
        res,
        [{ field: 'authorization', message: 'Permission verification error', type: 'internal_error' }],
        'Permission verification error',
        500
      );
    }
  };
};

/**
 * Require all permissions middleware - User must have ALL specified permissions
 * 
 * @param requiredPermissions - Array of permission codes that user must have ALL of
 * 
 * @example
 * router.post('/admin-action', authMiddleware, requireAllPermissions(['admin:create', 'admin:approve']), controller.method);
 */
export const requireAllPermissions = (requiredPermissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return sendFailureResponse(
          res,
          [{ field: 'user', message: 'User not authenticated', type: 'invalid' }],
          'User not authenticated',
          401
        );
      }

      if (!req.user.role) {
        return sendFailureResponse(
          res,
          [{ field: 'role', message: 'User role not found', type: 'not_found' }],
          'User role not found',
          403
        );
      }

      const userPermissions = await getRolePermissions(req.user.role);
      
      // Check if user has ALL required permissions
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(
          permission => !userPermissions.includes(permission)
        );
        return sendFailureResponse(
          res,
          [{ 
            field: 'permission', 
            message: `Access denied. Missing permissions: ${missingPermissions.join(', ')}`, 
            type: 'invalid' 
          }],
          'Insufficient permissions',
          403
        );
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return sendFailureResponse(
        res,
        [{ field: 'authorization', message: 'Permission verification error', type: 'internal_error' }],
        'Permission verification error',
        500
      );
    }
  };
};
