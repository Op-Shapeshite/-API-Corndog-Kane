import { Request, Response } from 'express';
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TQuantityUnitGetResponse } from "../../../core/entities/quantityUnit/quantityUnit";
import QuantityUnitService from '../../../core/services/QuantityUnitService';
import QuantityUnitRepository from "../../../adapters/postgres/repositories/QuantityUnitRepository";
import Controller from "./Controller";
import { UnitCategory } from '../../../core/entities/quantityUnit/quantityUnit';

export class QuantityUnitController extends Controller<TQuantityUnitGetResponse, TMetadataResponse> {
    private quantityUnitService: QuantityUnitService;

    constructor() {
        super();
        this.quantityUnitService = new QuantityUnitService(new QuantityUnitRepository());
    }

    /**
     * GET /quantity-units
     * Get all quantity units with optional category filter
     */
    getAll = () => {
        return async (req: Request, res: Response) => {
            try {
                // Optional category filter from query
                const categoryParam = req.query.category as string | undefined;
                let category: UnitCategory | undefined;

                if (categoryParam) {
                    // Validate category value
                    if (!Object.values(UnitCategory).includes(categoryParam as UnitCategory)) {
                        return this.handleError(
                            res,
                            new Error(`Invalid category. Must be one of: ${Object.values(UnitCategory).join(', ')}`),
                            "Invalid category parameter",
                            400,
                            [] as TQuantityUnitGetResponse[],
                            {} as TMetadataResponse
                        );
                    }
                    category = categoryParam as UnitCategory;
                }

                // Get units from service
                const units = await this.quantityUnitService.getAll(category);

                // Map to response format (snake_case)
                const mappedResults: TQuantityUnitGetResponse[] = units.map(unit => ({
                    id: unit.id,
                    name: unit.name,
                    code: unit.code,
                    symbol: unit.symbol,
                    category: unit.category,
                    base_unit: unit.baseUnit,
                    conversion_factor: unit.conversionFactor,
                    is_base: unit.isBase,
                    is_active: unit.isActive,
                    created_at: unit.createdAt.toISOString(),
                    updated_at: unit.updatedAt.toISOString(),
                }));

                const metadata: TMetadataResponse = {
                    page: 1,
                    limit: mappedResults.length,
                    total_records: mappedResults.length,
                    total_pages: 1,
                };

                return this.getSuccessResponse(
                    res,
                    {
                        data: mappedResults,
                        metadata,
                    },
                    category
                        ? `Quantity units for category ${category} retrieved successfully`
                        : "All quantity units retrieved successfully"
                );
            } catch (error) {
                return this.handleError(
                    res,
                    error,
                    "Failed to retrieve quantity units",
                    500,
                    [] as TQuantityUnitGetResponse[],
                    {} as TMetadataResponse
                );
            }
        };
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

                // Map to response format
                const responseData: TQuantityUnitGetResponse = {
                    id: unit.id,
                    name: unit.name,
                    code: unit.code,
                    symbol: unit.symbol,
                    category: unit.category,
                    base_unit: unit.baseUnit,
                    conversion_factor: unit.conversionFactor,
                    is_base: unit.isBase,
                    is_active: unit.isActive,
                    created_at: unit.createdAt.toISOString(),
                    updated_at: unit.updatedAt.toISOString(),
                };

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
