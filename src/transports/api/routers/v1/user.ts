
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

const router = express.Router();

const userController = new UserController();
const userService = new UserService(new UserRepository());

router.get('/', validate(getPaginationSchema), userController.findAll(userService, UserResponseMapper));
router.get('/:id', validate(getUserByIdSchema), userController.findById);
router.post('/', validate(createUserSchema), userController.create(userService, UserResponseMapper, 'User created successfully'));
router.put('/:id', validate(updateUserSchema), userController.update(userService, UserResponseMapper, 'User updated successfully'));
router.delete('/:id', validate(deleteUserSchema), userController.delete(userService, 'User deleted successfully'));

export default router;