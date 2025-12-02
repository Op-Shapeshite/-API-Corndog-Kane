
import express from 'express';
import { RoleController } from '../../controllers';
import { validate } from '../../validations/validate.middleware';
import { createRoleSchema,updateRoleSchema,deleteRoleSchema } from '../../validations/role.validation';
import RoleService from '../../../../core/services/RoleService';
import RoleRepository from '../../../../adapters/postgres/repositories/RoleRepository';
import { RoleResponseMapper } from '../../../../mappers/response-mappers';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();

const roleController = new RoleController();
const roleService = new RoleService(new RoleRepository());

/**
 * @route GET /api/v1/roles
 * @access ADMIN | SUPERADMIN
 */
router.get("/", 
  authMiddleware,
  permissionMiddleware(['roles:read']),
  validate(getPaginationSchema), 
  roleController.findAll(roleService, RoleResponseMapper)
);

/**
 * @route POST /api/v1/roles
 * @access ADMIN | SUPERADMIN
 */
router.post('/', 
  authMiddleware,
  permissionMiddleware(['roles:create']),
  validate(createRoleSchema), 
  roleController.create(roleService, RoleResponseMapper, 'Role berhasil dibuat')
);

/**
 * @route PUT /api/v1/roles/:id
 * @access ADMIN | SUPERADMIN
 */
router.put('/:id', 
  authMiddleware,
  permissionMiddleware(['roles:update']),
  validate(updateRoleSchema), 
  roleController.update(roleService, RoleResponseMapper, 'Role berhasil diperbarui')
);

/**
 * @route DELETE /api/v1/roles/:id
 * @access ADMIN | SUPERADMIN
 */
router.delete('/:id', 
  authMiddleware,
  permissionMiddleware(['roles:delete']),
  validate(deleteRoleSchema), 
  roleController.delete(roleService, 'Role berhasil dihapus')
);

export default router;