import express from 'express';
import { OrderController } from '../../controllers';
import { validate } from '../../validations/validate.middleware';
import { createOrderSchema } from '../../validations/order.validation';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';
import { checkinMiddleware } from '../../../../policies/checkinMiddleware';

const router = express.Router();

const orderController = new OrderController();

/**
 * @route GET /api/v1/orders/my
 * @access OUTLET | EMPLOYEE
 */
router.get(
	"/my",
	authMiddleware,
	permissionMiddleware(['orders:read:my']),
	(req, res) => orderController.getMyOrders(req, res)
);

/**
 * @route GET /api/v1/orders
 * @access ADMIN | SUPERADMIN
 */
router.get(
	"/",
	authMiddleware,
	permissionMiddleware(['orders:read']),
	(req, res) => orderController.getAllOrders(req, res)
);

/**
 * @route GET /api/v1/orders/:id
 * @access ADMIN | SUPERADMIN | OUTLET
 */
router.get(
	"/:id",
	authMiddleware,
	permissionMiddleware(['orders:read:detail']),
	(req, res) => orderController.getOrderById(req, res)
);

/**
 * @route POST /api/v1/orders
 * @access OUTLET | EMPLOYEE
 */
router.post(
	"/",
	authMiddleware,
	permissionMiddleware(['orders:create']),
	checkinMiddleware,
	validate(createOrderSchema),
	(req, res) => orderController.createOrder(req, res)
);

export default router;