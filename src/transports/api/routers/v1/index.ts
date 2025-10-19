
import express from 'express';
import authRouter from './auth';
import testRouter from './test';
import userRouter from './user'
const router = express.Router();

// router.get;
router.use("/auth", authRouter);
router.use("/", testRouter);
router.use('/users',userRouter)

export default router;