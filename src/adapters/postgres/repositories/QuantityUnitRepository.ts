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
     * Get quantity unit by code (case-insensitive)
     */
    async getByCode(code: string): Promise<TQuantityUnitWithID | null> {
        // Try exact match first
        let record = await this.getModel().findUnique({
            where: { code },
        });

        // If not found, try case-insensitive search
        if (!record) {
            const allUnits = await this.getModel().findMany({
                where: { is_active: true }
            });
            record = allUnits.find(unit => unit.code.toLowerCase() === code.toLowerCase()) || null;
        }

        return record ? (this.mapper.mapToEntity(record) as TQuantityUnitWithID) : null;
    }

    /**
     * Validate that a unit code exists (case-insensitive)
     */
    async validateUnitCode(code: string): Promise<boolean> {
        // Try exact match first
        let count = await this.getModel().count({
            where: { code, is_active: true },
        });

        // If not found, try case-insensitive search
        if (count === 0) {
            const allUnits = await this.getModel().findMany({
                where: { is_active: true }
            });
            const foundUnit = allUnits.find(unit => unit.code.toLowerCase() === code.toLowerCase());
            count = foundUnit ? 1 : 0;
        }

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
