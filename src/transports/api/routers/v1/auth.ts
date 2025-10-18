
import express from 'express';

const router = express.Router();

// router.get;
router.post('/login', (req:express.Request, res:express.Response) => {
  return res.json({ message: 'Login route' });
});

export default router;