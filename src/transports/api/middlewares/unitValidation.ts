import { Request, Response, NextFunction } from 'express';
import QuantityUnitService from '../../../core/services/QuantityUnitService';
import QuantityUnitRepository from '../../../adapters/postgres/repositories/QuantityUnitRepository';
import { normalizeUnit, isUnitSupported } from '../../../core/utils/unitNormalizer';

const quantityUnitService = new QuantityUnitService(new QuantityUnitRepository());

/**
 * Middleware to validate and normalize unit codes in request body
 * Checks fields: unit_quantity, unit, quantity_unit
 * Normalizes units to standard database codes
 */
export const validateUnit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const unitFields = ['unit_quantity', 'unit', 'quantity_unit'];
        for (const field of unitFields) {
            if (req.body[field]) {
                try {
                    if (!isUnitSupported(req.body[field])) {
                        return res.status(400).json({
                            status: 'error',
                            message: `Kode satuan tidak valid: "${req.body[field]}". Gunakan kode satuan yang valid seperti kg, g, pcs, L, ml, dll. Pastikan satuan sudah terdaftar di sistem`
                        });
                    }
                    
                    // Normalize the unit in the request body
                    req.body[field] = normalizeUnit(req.body[field]);
                } catch (error: any) {
                    return res.status(400).json({
                        status: 'error',
                        message: error.message
                    });
                }
            }
        }
        if (req.body.materials && Array.isArray(req.body.materials)) {
            for (let i = 0; i < req.body.materials.length; i++) {
                const item = req.body.materials[i];
                
                if (item.unit) {
                    try {
                        if (!isUnitSupported(item.unit)) {
                            return res.status(400).json({
                                status: 'error',
                                message: `Kode satuan tidak valid di materials[${i}]: "${item.unit}". Gunakan kode satuan yang valid seperti kg, g, pcs, L, ml, dll.`
                            });
                        }
                        req.body.materials[i].unit = normalizeUnit(item.unit);
                    } catch (error: any) {
                        return res.status(400).json({
                            status: 'error',
                            message: `Error di materials[${i}]: ${error.message}`
                        });
                    }
                }
                
                if (item.unit_quantity) {
                    try {
                        if (!isUnitSupported(item.unit_quantity)) {
                            return res.status(400).json({
                                status: 'error',
                                message: `Kode satuan tidak valid di materials[${i}]: "${item.unit_quantity}". Gunakan kode satuan yang valid seperti kg, g, pcs, L, ml, dll.`
                            });
                        }
                        req.body.materials[i].unit_quantity = normalizeUnit(item.unit_quantity);
                    } catch (error: any) {
                        return res.status(400).json({
                            status: 'error',
                            message: `Error di materials[${i}]: ${error.message}`
                        });
                    }
                }
            }
        }
        if (req.body.items && Array.isArray(req.body.items)) {
            for (let i = 0; i < req.body.items.length; i++) {
                const item = req.body.items[i];
                
                const itemUnitFields = ['unit', 'unit_quantity', 'quantity_unit'];
                for (const field of itemUnitFields) {
                    if (item[field]) {
                        try {
                            if (!isUnitSupported(item[field])) {
                                return res.status(400).json({
                                    status: 'error',
                                    message: `Kode satuan tidak valid di items[${i}].${field}: "${item[field]}". Gunakan kode satuan yang valid seperti kg, g, pcs, L, ml, dll.`
                                });
                            }
                            req.body.items[i][field] = normalizeUnit(item[field]);
                        } catch (error: any) {
                            return res.status(400).json({
                                status: 'error',
                                message: `Error di items[${i}].${field}: ${error.message}`
                            });
                        }
                    }
                }
            }
        }

        next();
    } catch (error) {
        console.error('Unit validation error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan server saat validasi satuan. Silakan coba lagi atau hubungi administrator'
        });
    }
};
