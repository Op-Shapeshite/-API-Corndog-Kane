import { Request, Response, NextFunction } from 'express';
import QuantityUnitService from '../../../core/services/QuantityUnitService';
import QuantityUnitRepository from '../../../adapters/postgres/repositories/QuantityUnitRepository';

const quantityUnitService = new QuantityUnitService(new QuantityUnitRepository());

/**
 * Middleware to validate unit codes in request body
 * Checks fields: unit_quantity, unit, quantity_unit
 */
export const validateUnit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const unitFields = ['unit_quantity', 'unit', 'quantity_unit'];
        const unitsToValidate: string[] = [];

        // Check top-level fields
        for (const field of unitFields) {
            if (req.body[field]) {
                unitsToValidate.push(req.body[field]);
            }
        }

        // Check nested materials array (common in master-products)
        if (req.body.materials && Array.isArray(req.body.materials)) {
            req.body.materials.forEach((item: any) => {
                if (item.unit) unitsToValidate.push(item.unit);
                if (item.unit_quantity) unitsToValidate.push(item.unit_quantity);
            });
        }

        // Check items array (common in inventory/stock-in)
        if (req.body.items && Array.isArray(req.body.items)) {
            req.body.items.forEach((item: any) => {
                if (item.unit) unitsToValidate.push(item.unit);
                if (item.unit_quantity) unitsToValidate.push(item.unit_quantity);
                if (item.quantity_unit) unitsToValidate.push(item.quantity_unit);
            });
        }

        // Validate each unique unit
        const uniqueUnits = [...new Set(unitsToValidate)];

        for (const unitCode of uniqueUnits) {
            const isValid = await quantityUnitService.validateUnitCode(unitCode);
            if (!isValid) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid unit code: "${unitCode}". Please use a valid unit code (e.g., kg, g, pcs).`
                });
            }
        }

        next();
    } catch (error) {
        console.error('Unit validation error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during unit validation'
        });
    }
};
