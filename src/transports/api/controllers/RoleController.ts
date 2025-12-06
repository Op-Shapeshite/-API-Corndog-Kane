import { Request, Response } from 'express';
import RoleRepository from "../../../adapters/postgres/repositories/RoleRepository";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TRoleGetResponse, TRoleCreateRequest } from "../../../core/entities/user/role";
import RoleService from '../../../core/services/RoleService';
import { RoleResponseMapper } from "../../../mappers/response-mappers/RoleResponseMapper";
import Controller from "./Controller";
import PostgresAdapter from '../../../adapters/postgres/instance';

export class RoleController extends Controller<TRoleGetResponse, TMetadataResponse> {
  private roleService: RoleService;

  constructor() {
    super();
    this.roleService = new RoleService(new RoleRepository());
  }

  // Enhanced getAll with proper search field mapping
  getAll = () => {
    return this.findAllWithSearch(this.roleService, RoleResponseMapper, 'role');
  }

  /**
   * Create role with optional permissions
   * Accepts permissions as array of permission codes
   */
  createWithPermissions = () => {
    return async (req: Request, res: Response) => {
      try {
        const { permissions, ...roleData } = req.body as TRoleCreateRequest & { permissions?: string[] };
        
        const prisma = PostgresAdapter.client;

        // Create role in transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
          // Create the role
          const newRole = await tx.role.create({
            data: {
              name: roleData.name,
              description: roleData.description,
              is_active: roleData.is_active ?? true,
            },
          });

          // If permissions are provided, create role-permission associations
          if (permissions && Array.isArray(permissions) && permissions.length > 0) {
            // Get permission IDs from codes
            const permissionRecords = await tx.permission.findMany({
              where: {
                code: { in: permissions },
                is_active: true,
              },
              select: { id: true, code: true },
            });

            // Check if all permission codes are valid
            const foundCodes = permissionRecords.map((p: any) => p.code);
            const invalidCodes = permissions.filter(code => !foundCodes.includes(code));

            if (invalidCodes.length > 0) {
              throw new Error(`Invalid permission codes: ${invalidCodes.join(', ')}`);
            }

            // Create role-permission associations
            await tx.rolePermission.createMany({
              data: permissionRecords.map((p: any) => ({
                role_id: newRole.id,
                permission_id: p.id,
                is_active: true,
              })),
            });
          }

          // Fetch the complete role with permissions
          const roleWithPermissions = await tx.role.findUnique({
            where: { id: newRole.id },
            include: {
              rolePermissions: {
                include: {
                  permission: {
                    select: {
                      code: true,
                      name: true,
                    },
                  },
                },
              },
            },
          });

          if (!roleWithPermissions) {
            throw new Error('Failed to retrieve created role');
          }

          return roleWithPermissions;
        });

        // Map to response format
        const mappedResult = {
          id: result.id.toString(),
          name: result.name,
          description: result.description,
          is_active: result.is_active,
          created_at: result.createdAt,
          updated_at: result.updatedAt,
          permissions: (result as any).rolePermissions?.map((rp: any) => ({
            code: rp.permission.code,
            name: rp.permission.name,
          })) || [],
        };

        return this.getSuccessResponse(
          res,
          {
            data: mappedResult as any,
            metadata: {} as TMetadataResponse,
          },
          "Role berhasil dibuat"
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Gagal membuat role",
          500,
          {} as TRoleGetResponse,
          {} as TMetadataResponse
        );
      }
    };
  }

  /**
   * Update role with optional permissions
   * Accepts permissions as array of permission codes
   * If permissions array is provided, it replaces all existing permissions
   */
  updateWithPermissions = () => {
    return async (req: Request, res: Response) => {
      try {
        const roleId = parseInt(req.params.id);
        const { permissions, ...roleData } = req.body;
        
        if (isNaN(roleId)) {
          return this.getFailureResponse(
            res,
            { data: {} as TRoleGetResponse, metadata: {} as TMetadataResponse },
            [{ field: 'id', message: 'ID role tidak valid', type: 'invalid' }],
            "ID role tidak valid",
            400
          );
        }

        const prisma = PostgresAdapter.client;

        // Update role in transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
          // Check if role exists
          const existingRole = await tx.role.findUnique({
            where: { id: roleId },
          });

          if (!existingRole) {
            throw new Error('Role not found');
          }

          // Update the role basic info
          const updatedRole = await tx.role.update({
            where: { id: roleId },
            data: {
              ...(roleData.name && { name: roleData.name }),
              ...(roleData.description !== undefined && { description: roleData.description }),
              ...(roleData.is_active !== undefined && { is_active: roleData.is_active }),
            },
          });

          // If permissions are provided, update role-permission associations
          if (permissions && Array.isArray(permissions)) {
            // Delete existing role-permission associations
            await tx.rolePermission.deleteMany({
              where: { role_id: roleId },
            });

            // If permissions array is not empty, create new associations
            if (permissions.length > 0) {
              // Get permission IDs from codes
              const permissionRecords = await tx.permission.findMany({
                where: {
                  code: { in: permissions },
                  is_active: true,
                },
                select: { id: true, code: true },
              });

              // Check if all permission codes are valid
              const foundCodes = permissionRecords.map((p: any) => p.code);
              const invalidCodes = permissions.filter(code => !foundCodes.includes(code));

              if (invalidCodes.length > 0) {
                throw new Error(`Invalid permission codes: ${invalidCodes.join(', ')}`);
              }

              // Create new role-permission associations
              await tx.rolePermission.createMany({
                data: permissionRecords.map((p: any) => ({
                  role_id: roleId,
                  permission_id: p.id,
                  is_active: true,
                })),
              });
            }
          }

          // Fetch the complete role with permissions
          const roleWithPermissions = await tx.role.findUnique({
            where: { id: roleId },
            include: {
              rolePermissions: {
                include: {
                  permission: {
                    select: {
                      code: true,
                      name: true,
                    },
                  },
                },
              },
            },
          });

          if (!roleWithPermissions) {
            throw new Error('Failed to retrieve updated role');
          }

          return roleWithPermissions;
        });

        // Map to response format
        const mappedResult = {
          id: result.id.toString(),
          name: result.name,
          description: result.description,
          is_active: result.is_active,
          created_at: result.createdAt,
          updated_at: result.updatedAt,
          permissions: (result as any).rolePermissions?.map((rp: any) => ({
            code: rp.permission.code,
            name: rp.permission.name,
          })) || [],
        };

        return this.getSuccessResponse(
          res,
          {
            data: mappedResult as any,
            metadata: {} as TMetadataResponse,
          },
          "Role berhasil diperbarui"
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Gagal memperbarui role",
          500,
          {} as TRoleGetResponse,
          {} as TMetadataResponse
        );
      }
    };
  }
}