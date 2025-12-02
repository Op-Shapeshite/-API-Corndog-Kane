import express from 'express';
import { QuantityUnitController } from '../../controllers/QuantityUnitController';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();
const controller = new QuantityUnitController();

/**
 * @route  GET /api/v1/quantity-units
 * @desc   Get all quantity units (optional: filter by category)
 * @query  category - Optional: WEIGHT, VOLUME, or COUNT
 * @access ALL AUTHENTICATED USERS
 */
router.get('/', 
  authMiddleware,
  permissionMiddleware(['common:quantity-units:read']),
  controller.getAll()
);

/**
 * @route  GET /api/v1/quantity-units/:idOrCode
 * @desc   Get quantity unit by ID or code
 * @param  idOrCode - Unit ID (number) or code (string like "kg", "L", "pcs")
 * @access ALL AUTHENTICATED USERS
 */
router.get('/:idOrCode', 
  authMiddleware,
  permissionMiddleware(['common:quantity-units:read']),
  controller.getByIdOrCode()
);

export default router;
