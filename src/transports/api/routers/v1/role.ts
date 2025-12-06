
import express from 'express';
import { RoleController, PermissionController } from '../../controllers';
import { validate } from '../../validations/validate.middleware';
import { createRoleSchema, updateRoleSchema, getRoleDetailSchema, deleteRoleSchema } from '../../validations/role.validation';
import RoleService from '../../../../core/services/RoleService';
import RoleRepository from '../../../../adapters/postgres/repositories/RoleRepository';
import { RoleResponseMapper } from '../../../../mappers/response-mappers';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();

const roleController = new RoleController();
const roleService = new RoleService(new RoleRepository());
const permissionController = new PermissionController();

// Permission endpoints under /roles (must be before /:id routes to avoid conflicts)
router.get('/permissions', authMiddleware, permissionMiddleware(['roles:permissions:read']), permissionController.getAllWithoutPagination());

// Get authenticated user's permissions
router.get('/access', authMiddleware, permissionMiddleware(['roles:access:read']), permissionController.getMyPermissions());

// Role endpoints
router.get("/", authMiddleware, permissionMiddleware(['roles:read']), validate(getPaginationSchema), roleController.getAll());
router.get('/:id', authMiddleware, permissionMiddleware(['roles:read:detail']), validate(getRoleDetailSchema), roleController.getDetail());
router.post('/', authMiddleware, permissionMiddleware(['roles:create']), validate(createRoleSchema), roleController.createWithPermissions());
router.put('/:id', authMiddleware, permissionMiddleware(['roles:update']), validate(updateRoleSchema), roleController.updateWithPermissions());
router.delete('/:id', authMiddleware, permissionMiddleware(['roles:delete']), validate(deleteRoleSchema), roleController.delete(roleService, 'Role berhasil dihapus'));

export default router;