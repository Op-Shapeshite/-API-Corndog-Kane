import express from 'express';
import { QuantityUnitController } from '../../controllers/QuantityUnitController';

const router = express.Router();
const controller = new QuantityUnitController();

/**
 * @route  GET /api/v1/quantity-units
 * @desc   Get all quantity units (optional: filter by category)
 * @query  category - Optional: WEIGHT, VOLUME, or COUNT
 * @access Public
 */
router.get('/', controller.getAll());

/**
 * @route  GET /api/v1/quantity-units/:idOrCode
 * @desc   Get quantity unit by ID or code
 * @param  idOrCode - Unit ID (number) or code (string like "kg", "L", "pcs")
 * @access Public
 */
router.get('/:idOrCode', controller.getByIdOrCode());

export default router;
