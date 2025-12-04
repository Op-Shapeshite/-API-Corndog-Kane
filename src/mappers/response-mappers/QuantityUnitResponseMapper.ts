import { TQuantityUnit, TQuantityUnitWithID, TQuantityUnitGetResponse } from "../../core/entities/quantityUnit/quantityUnit";

export class QuantityUnitResponseMapper {
  static toResponse(unit: TQuantityUnitWithID): TQuantityUnitGetResponse {
    return {
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
  }

  static toListResponse(units: TQuantityUnitWithID[]): TQuantityUnitGetResponse[] {
    return units.map(unit => this.toResponse(unit));
  }
}