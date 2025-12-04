import { Request, Response } from 'express';
import PermissionRepository from "../../../adapters/postgres/repositories/PermissionRepository";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TPermissionGetResponse } from "../../../core/entities/user/permission";
import PermissionService from '../../../core/services/PermissionService';
import { PermissionResponseMapper } from "../../../mappers/response-mappers/PermissionResponseMapper";
import Controller from "./Controller";
import { AuthRequest } from "../../../policies/authMiddleware";
import PostgresAdapter from '../../../adapters/postgres/instance';

export class PermissionController extends Controller<TPermissionGetResponse, TMetadataResponse> {
  private permissionService: PermissionService;

  constructor() {
    super();
    this.permissionService = new PermissionService(new PermissionRepository());
  }

  // Enhanced getAll with proper search field mapping
  getAll = () => {
    return this.findAllWithSearch(this.permissionService, PermissionResponseMapper, 'permission');
  }

  /**
   * Get permissions for authenticated user based on their role
   * Returns only the permissions that the user has access to
   */
  getMyPermissions = () => {
    return async (req: AuthRequest, res: Response) => {
      try {
        if (!req.user) {
          return this.handleError(
            res,
            new Error('User not authenticated'),
            "User not authenticated",
            401,
            [] as TPermissionGetResponse[],
            {} as TMetadataResponse
          );
        }

        if (!req.user.role) {
          return this.handleError(
            res,
            new Error('User role not found'),
            "Role pengguna tidak ditemukan",
            403,
            [] as TPermissionGetResponse[],
            {} as TMetadataResponse
          );
        }

        const prisma = PostgresAdapter.client;

        // Fetch role with active permissions
        const roleWithPermissions = await prisma.role.findUnique({
          where: { name: req.user.role },
          include: {
            rolePermissions: {
              where: { is_active: true },
              include: {
                permission: true,
              },
            },
          },
        });

        if (!roleWithPermissions) {
          return this.handleError(
            res,
            new Error('Role not found'),
            "Role tidak ditemukan",
            404,
            [] as TPermissionGetResponse[],
            {} as TMetadataResponse
          );
        }

        // Extract permissions and map to response format
        const permissions = roleWithPermissions.rolePermissions
          .filter((rp: any) => rp.permission && rp.permission.is_active)
          .map((rp: any) => rp.permission)
          .map((permission: any) => ({
            id: permission.id.toString(),
            name: permission.name,
            code: permission.code,
            description: permission.description,
            module: permission.module,
            is_active: permission.is_active,
            created_at: permission.createdAt,
            updated_at: permission.updatedAt,
          }));

        return this.getSuccessResponse(
          res,
          {
            data: permissions,
            metadata: {
              total_records: permissions.length,
            } as TMetadataResponse,
          },
          "Permissions berhasil diambil"
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Gagal mengambil permissions",
          500,
          [] as TPermissionGetResponse[],
          {} as TMetadataResponse
        );
      }
    };
  }
}
