
import express from 'express';
import { UserController } from '../../controllers';
import { validate } from '../../validations/validate.middleware';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  deleteUserSchema,

} from '../../validations/user.validation';
import UserService from '../../../../core/services/UserService';
import { UserResponseMapper } from '../../../../mappers/response-mappers';
import UserRepository from '../../../../adapters/postgres/repositories/UserRepository';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();

const userController = new UserController();
const userService = new UserService(new UserRepository());

/**
 * @route GET /api/v1/users
 * @access ADMIN | SUPERADMIN
 */
router.get('/', 
  authMiddleware,
  permissionMiddleware(['users:read']),
  validate(getPaginationSchema), 
  userController.findAll(userService, UserResponseMapper)
);

/**
 * @route GET /api/v1/users/:id
 * @access ADMIN | SUPERADMIN
 */
router.get('/:id', 
  authMiddleware,
  permissionMiddleware(['users:read:detail']),
  validate(getUserByIdSchema), 
  userController.findById
);

/**
 * @route POST /api/v1/users
 * @access ADMIN | SUPERADMIN
 */
router.post('/', 
  authMiddleware,
  permissionMiddleware(['users:create']),
  validate(createUserSchema), 
  userController.create(userService, UserResponseMapper, 'User created successfully')
);

/**
 * @route PUT /api/v1/users/:id
 * @access ADMIN | SUPERADMIN
 */
router.put('/:id', 
  authMiddleware,
  permissionMiddleware(['users:update']),
  validate(updateUserSchema), 
  userController.update(userService, UserResponseMapper, 'User updated successfully')
);

/**
 * @route DELETE /api/v1/users/:id
 * @access ADMIN | SUPERADMIN
 */
router.delete('/:id', 
  authMiddleware,
  permissionMiddleware(['users:delete']),
  validate(deleteUserSchema), 
  userController.delete(userService, 'User deleted successfully')
);

export default router;