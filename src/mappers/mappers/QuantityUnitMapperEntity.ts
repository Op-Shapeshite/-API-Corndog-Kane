import { EntityMapConfig } from "../../adapters/postgres/repositories/Repository";

export const QuantityUnitMapperEntity: EntityMapConfig = {
    fields: [
        { dbField: "id", entityField: "id" },
        { dbField: "name", entityField: "name" },
        { dbField: "code", entityField: "code" },
        { dbField: "symbol", entityField: "symbol" },
        { dbField: "category", entityField: "category" },
        { dbField: "base_unit", entityField: "baseUnit" },
        { dbField: "conversion_factor", entityField: "conversionFactor" },
        { dbField: "is_base", entityField: "isBase" },
        { dbField: "is_active", entityField: "isActive" },
        { dbField: "createdAt", entityField: "createdAt" },
        { dbField: "updatedAt", entityField: "updatedAt" },
    ],
};
