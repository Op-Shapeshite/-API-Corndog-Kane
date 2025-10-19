
import express from 'express';
import { UserController } from '../../controllers';
const router = express.Router();

// router.get;

const userController = new UserController();
router.get('/', userController.findAll);
router.get('/:id', userController.findById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;