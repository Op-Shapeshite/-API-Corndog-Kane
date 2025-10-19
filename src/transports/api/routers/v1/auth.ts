
import express from 'express';
import { AuthController } from '../../controllers';
const router = express.Router();

// router.get;

const authController = new AuthController();
router.post('/login', authController.login);

export default router;