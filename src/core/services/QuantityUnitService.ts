import { TQuantityUnit, TQuantityUnitWithID, TQuantityUnitQuery, UnitCategory } from "../entities/quantityUnit/quantityUnit";
import QuantityUnitRepository from "../../adapters/postgres/repositories/QuantityUnitRepository";
import { Service } from "./Service";

/**
 * Quantity Unit Service
 * Business logic for quantity unit management and conversion
 */
export default class QuantityUnitService extends Service<TQuantityUnit | TQuantityUnitWithID> {
    declare repository: QuantityUnitRepository;

    /**
     * Get all quantity units with optional category filter
     */
    async getAll(category?: UnitCategory): Promise<TQuantityUnitWithID[]> {
        const filters: TQuantityUnitQuery = {
            is_active: true,
        };

        if (category) {
            filters.category = category;
        }

        return await this.repository.findAll(filters);
    }

    /**
     * Get quantity unit by ID
     */
    async getById(id: number): Promise<TQuantityUnitWithID | null> {
        return await this.repository.getById(id.toString()) as TQuantityUnitWithID | null;
    }

    /**
     * Get quantity unit by code
     */
    async getByCode(code: string): Promise<TQuantityUnitWithID | null> {
        return await this.repository.getByCode(code) as TQuantityUnitWithID | null;
    }

    /**
     * Validate that a unit code exists and is active
     * Used by validation middleware
     */
    async validateUnitCode(code: string): Promise<boolean> {
        return await this.repository.validateUnitCode(code);
    }

    /**
     * Get units by category
     */
    async getByCategory(category: UnitCategory): Promise<TQuantityUnitWithID[]> {
        return await this.repository.getByCategory(category);
    }

    /**
     * Internal helper: Convert quantity between units
     * This is private and used internally for calculations
     * NOT exposed via API endpoint
     */
    async convertQuantity(
        fromCode: string,
        toCode: string,
        quantity: number
    ): Promise<number> {
        // Get both units
        
		const fromUnit = await this.repository.getByCode(fromCode);
		const toUnit = await this.repository.getByCode(toCode);
        console.log('fromUnit:', fromUnit);
        console.log('toUnit:', toUnit);
        console.log('fromCode:', fromCode, 'toCode:', toCode);
		if (!fromUnit || !toUnit) {
			throw new Error(
				`Unit not found: ${!fromUnit ? fromCode : toCode}`
			);
		}
		// If same unit, return as is (this should be checked first!)
		if (fromCode === toCode) {
			return quantity;
		}

		// Validate: both units must be in same category
		if (fromUnit.category !== toUnit.category) {
			throw new Error(
				`Cannot convert between different categories: ${fromUnit.category} and ${toUnit.category}`
			);
		}

		// COUNT units cannot be converted
		if (
			fromUnit.category === UnitCategory.COUNT ||
			toUnit.category === UnitCategory.COUNT
		) {
			throw new Error("Cannot convert COUNT units (pcs)");
		}

		// If same unit, return as is
		if (fromCode === toCode) {
			return quantity;
		}

		// Convert via base unit
		// Example: 1 kg to g => 1 * (1000 / 1) = 1000 g
		const convertedQuantity =
			quantity * (fromUnit.conversionFactor / toUnit.conversionFactor);

		return convertedQuantity;
    }

    /**
     * Get conversion factor between two units (for display purposes)
     */
    async getConversionFactor(fromCode: string, toCode: string): Promise<{ factor: number; formula: string }> {
        const fromUnit = await this.repository.getByCode(fromCode);
        const toUnit = await this.repository.getByCode(toCode);

        if (!fromUnit || !toUnit) {
            throw new Error('Unit not found');
        }

        if (fromUnit.category !== toUnit.category) {
            throw new Error('Units must be in same category');
        }

        const factor = fromUnit.conversionFactor / toUnit.conversionFactor;
        const formula = `1 ${fromCode} = ${factor} ${toCode}`;

        return { factor, formula };
    }
}
