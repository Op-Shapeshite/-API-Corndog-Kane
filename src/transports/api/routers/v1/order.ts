import express from 'express';
import { OrderController } from '../../controllers';
import { validate } from '../../validations/validate.middleware';
import { createOrderSchema } from '../../validations/order.validation';
import { authMiddleware } from '../../../../policies/authMiddleware';

const router = express.Router();

const orderController = new OrderController();

// GET my orders (filtered by outlet_id from token)
router.get(
	"/my",
	authMiddleware,
	(req, res) => orderController.getMyOrders(req, res)
);

// GET all orders (with pagination)
router.get(
	"/",
	(req, res) => orderController.getAllOrders(req, res)
);

// GET order by ID
router.get(
	"/:id",
	(req, res) => orderController.getOrderById(req, res)
);

// POST create order
router.post(
	"/",
	authMiddleware,
	validate(createOrderSchema),
	(req, res) => orderController.createOrder(req, res)
);

export default router;