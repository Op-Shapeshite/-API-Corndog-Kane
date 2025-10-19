import { MapperUtil } from "./MapperUtil";
import { EntityMapConfig, FieldMapping, RelationMapping } from "../Repository";

/**
 * EntityMapper class handles all mapping logic from database records to domain entities
 * This class is responsible for transforming raw database data into typed entity objects
 */
export class EntityMapper<T> {
  private mapConfig: EntityMapConfig;

  constructor(mapConfig: EntityMapConfig) {
    this.mapConfig = mapConfig;
  }

  /**
   * Get Prisma include configuration for relations
   * Automatically generates includes from relations configuration
   */
  public getIncludes(): Record<string, boolean | object> | undefined {
    if (!this.mapConfig.relations || this.mapConfig.relations.length === 0) {
      return undefined;
    }

    const includes: Record<string, boolean> = {};
    for (const relation of this.mapConfig.relations) {
      includes[relation.dbField] = true;
    }
    
    return includes;
  }

  /**
   * Map database record to entity
   * Main entry point for transforming database records
   */
  public mapToEntity(dbRecord: unknown): T {
    const dbData = dbRecord as Record<string, unknown>;
    const entity: Record<string, unknown> = {};

    this.mapFields(dbData, entity);
    this.mapRelations(dbData, entity);

    return entity as T;
  }

  /**
   * Map multiple database records to entities
   */
  public mapToEntities(dbRecords: unknown[]): T[] {
    return dbRecords.map(record => this.mapToEntity(record));
  }

  /**
   * Map database fields to entity fields
   * Iterates through all field mappings and applies transformations
   */
  private mapFields(dbData: Record<string, unknown>, entity: Record<string, unknown>): void {
    for (const fieldMap of this.mapConfig.fields) {
      const dbValue = dbData[fieldMap.dbField];
      entity[fieldMap.entityField] = this.transformField(dbValue, fieldMap);
    }
  }

  /**
   * Transform a single field value
   * Applies custom transform function if provided, otherwise returns raw value
   */
  private transformField(value: unknown, fieldMap: FieldMapping): unknown {
    return fieldMap.transform ? fieldMap.transform(value) : value;
  }

  /**
   * Map database relations to entity relations
   * Handles both single relations and relation arrays
   */
  private mapRelations(dbData: Record<string, unknown>, entity: Record<string, unknown>): void {
    if (!this.mapConfig.relations) return;

    for (const relationMap of this.mapConfig.relations) {
      const dbRelation = dbData[relationMap.dbField];
      entity[relationMap.entityField] = this.transformRelation(dbRelation, relationMap);
    }
  }

  /**
   * Transform a single relation value
   * Uses MapperUtil to handle array or single relation mapping
   */
  private transformRelation(value: unknown, relationMap: RelationMapping): unknown {
    if (relationMap.isArray) {
      return MapperUtil.mapRelationArray(value as unknown[], relationMap.mapper);
    }
    return MapperUtil.mapRelation(value, relationMap.mapper);
  }
}
