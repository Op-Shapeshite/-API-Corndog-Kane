
import express from 'express';
import authRouter from './auth';
import testRouter from './test';
import userRouter from './user'
import roleRouter from './role';
import outletRouter from './outlet';
import employeeRouter from './employee';
const router = express.Router();

router.use("/auth", authRouter);
router.use("/", testRouter);
router.use('/users', userRouter);
router.use('/roles', roleRouter);
router.use('/outlets', outletRouter );
router.use('/employees', employeeRouter);

export default router;