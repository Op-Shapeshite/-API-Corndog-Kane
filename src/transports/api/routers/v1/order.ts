import express from 'express';
import { OrderController } from '../../controllers';
import { validate } from '../../validations/validate.middleware';
import { createOrderSchema } from '../../validations/order.validation';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();

const orderController = new OrderController();

// GET my orders (filtered by outlet_id from token)
router.get(
	"/my",
	authMiddleware,
	permissionMiddleware(['orders:read']),
	(req, res) => orderController.getMyOrders(req, res)
);

// GET all orders (with pagination)
router.get(
	"/",
	authMiddleware,
	permissionMiddleware(['orders:read']),
	(req, res) => orderController.getAllOrders(req, res)
);

// GET order by ID
router.get(
	"/:id",
	authMiddleware,
	permissionMiddleware(['orders:read:detail']),
	(req, res) => orderController.getOrderById(req, res)
);

// POST create order
router.post(
	"/",
	authMiddleware,
	permissionMiddleware(['orders:create']),
	validate(createOrderSchema),
	(req, res) => orderController.createOrder(req, res)
);

export default router;