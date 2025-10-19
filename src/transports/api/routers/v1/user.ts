
import express from 'express';
import { UserController } from '../../controllers';
const router = express.Router();

// router.get;

const userController = new UserController();
router.get('/', userController.findAll);

export default router;