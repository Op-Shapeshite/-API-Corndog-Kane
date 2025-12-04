import express from 'express';
import { QuantityUnitController } from '../../controllers/QuantityUnitController';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();
const controller = new QuantityUnitController();

/**
 * @route  GET /api/v1/quantity-units
 * @desc   Get all quantity units (optional: filter by category)
 * @query  category - Optional: WEIGHT, VOLUME, or COUNT
 * @access Private
 */
router.get('/', authMiddleware, permissionMiddleware(['common:quantity-units:read']), controller.getAll());

/**
 * @route  GET /api/v1/quantity-units/:idOrCode
 * @desc   Get quantity unit by ID or code
 * @param  idOrCode - Unit ID (number) or code (string like "kg", "L", "pcs")
 * @access Private
 */
router.get('/:idOrCode', authMiddleware, permissionMiddleware(['common:quantity-units:read:detail']), controller.getByIdOrCode());

export default router;
