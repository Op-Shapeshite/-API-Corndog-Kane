import { TQuantityUnit, TQuantityUnitWithID, TQuantityUnitQuery, UnitCategory } from "../../../core/entities/quantityUnit/quantityUnit";
import Repository from "./Repository";

/**
 * Quantity Unit Repository
 * Handles database operations for quantity units
 */
export default class QuantityUnitRepository extends Repository<TQuantityUnit | TQuantityUnitWithID> {
    constructor() {
        super("quantityUnit");
    }

    /**
     * Get all quantity units with optional filters
     */
    async findAll(filters?: TQuantityUnitQuery): Promise<TQuantityUnitWithID[]> {
        const where: any = {};

        if (filters?.category) {
            where.category = filters.category;
        }

        if (filters?.is_active !== undefined) {
            where.is_active = filters.is_active;
        }

        const records = await this.getModel().findMany({
            where,
            orderBy: [
                { category: 'asc' as const },
                { conversion_factor: 'desc' as const }, // Largest to smallest
            ],
        });

        return this.mapper.mapToEntities(records) as TQuantityUnitWithID[];
    }

    /**
     * Get quantity unit by code
     */
    async getByCode(code: string): Promise<TQuantityUnitWithID | null> {
        const record = await this.getModel().findUnique({
            where: { code },
        });

        return record ? (this.mapper.mapToEntity(record) as TQuantityUnitWithID) : null;
    }

    /**
     * Validate that a unit code exists
     */
    async validateUnitCode(code: string): Promise<boolean> {
        const count = await this.getModel().count({
            where: { code, is_active: true },
        });

        return count > 0;
    }

    /**
     * Get units by category
     */
    async getByCategory(category: UnitCategory): Promise<TQuantityUnitWithID[]> {
        const records = await this.getModel().findMany({
            where: { category, is_active: true },
            orderBy: { conversion_factor: 'desc' as const },
        });

        return this.mapper.mapToEntities(records) as TQuantityUnitWithID[];
    }
}
