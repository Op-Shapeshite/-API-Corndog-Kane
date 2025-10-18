
import express from 'express';
import authRouter from './auth';
const router = express.Router();

// router.get;
router.use("/auth", authRouter);

export default router;