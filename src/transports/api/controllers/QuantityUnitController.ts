import { Request, Response } from 'express';
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TQuantityUnitGetResponse } from "../../../core/entities/quantityUnit/quantityUnit";
import QuantityUnitService from '../../../core/services/QuantityUnitService';
import QuantityUnitRepository from "../../../adapters/postgres/repositories/QuantityUnitRepository";
import Controller from "./Controller";
import { UnitCategory } from '../../../core/entities/quantityUnit/quantityUnit';
import { QuantityUnitResponseMapper } from "../../../mappers/response-mappers/QuantityUnitResponseMapper";

export class QuantityUnitController extends Controller<TQuantityUnitGetResponse, TMetadataResponse> {
    private quantityUnitService: QuantityUnitService;

    constructor() {
        super();
        this.quantityUnitService = new QuantityUnitService(new QuantityUnitRepository());
    }

    /**
     * GET /quantity-units
     * Enhanced with search support using the new search utilities
     */
    getAll = () => {
        return this.findAllWithSearch(this.quantityUnitService, QuantityUnitResponseMapper, 'quantity_unit');
    }

    /**
     * GET /quantity-units/:idOrCode
     * Get quantity unit by ID or code
     */
    getByIdOrCode = () => {
        return async (req: Request, res: Response) => {
            try {
                const param = req.params.idOrCode;

                let unit;

                // Try as ID first (if numeric)
                if (/^\d+$/.test(param)) {
                    unit = await this.quantityUnitService.getById(parseInt(param, 10));
                }

                // If not found or not numeric, try as code
                if (!unit) {
                    unit = await this.quantityUnitService.getByCode(param);
                }

                if (!unit) {
                    return this.handleError(
                        res,
                        new Error('Not Found'),
                        `Quantity unit with ID or code "${param}" not found`,
                        404,
                        {} as any,
                        {} as TMetadataResponse
                    );
                }

                // Use response mapper
                const responseData = QuantityUnitResponseMapper.toResponse(unit);

                return this.getSuccessResponse(
                    res,
                    {
                        data: responseData,
                        metadata: {} as TMetadataResponse,
                    },
                    "Quantity unit retrieved successfully"
                );
            } catch (error) {
                return this.handleError(
                    res,
                    error,
                    "Failed to retrieve quantity unit",
                    500,
                    {} as any,
                    {} as TMetadataResponse
                );
            }
        };
    }
}
