import { SearchConfig } from "../../core/repositories/Repository";
import { EntityName, mapResponseFieldToDbField, isSearchableField } from "./fieldMapping";

/**
 * Enhanced search utility for building search configurations
 */
export class SearchHelper {
  /**
   * Build search configuration from query parameters
   * Maps response field names to database field names for proper searching
   * @param entityName - Name of the entity being searched
   * @param searchKey - Field name from API response  
   * @param searchValue - Value to search for
   * @returns Search configuration array or undefined if invalid
   */
  static buildSearchConfig(
    entityName: EntityName,
    searchKey?: string | undefined,
    searchValue?: string | undefined
  ): SearchConfig[] | undefined {
    if (!searchKey || !searchValue || searchKey === 'undefined' || searchValue === 'undefined') {
      return undefined;
    }
    if (!isSearchableField(entityName, searchKey)) {
      throw new Error(`Field '${searchKey}' is not searchable for entity '${entityName}'`);
    }
    const dbField = mapResponseFieldToDbField(entityName, searchKey);
    if (!dbField) {
      return undefined;
    }

    return [{
      field: dbField,
      value: searchValue
    }];
  }

  /**
   * Validate search parameters and return validation result
   * @param entityName - Name of the entity being searched
   * @param searchKey - Field name from API response
   * @param searchValue - Value to search for  
   * @returns Validation result with success flag and error message
   */
  static validateSearchParams(
    entityName: EntityName,
    searchKey?: string | undefined,
    searchValue?: string | undefined
  ): { valid: boolean; error?: string; searchable_fields?: string[] } {
    if (!searchKey && !searchValue) {
      return { valid: true };
    }
    if (!searchKey || !searchValue) {
      return { 
        valid: false, 
        error: 'Both search_key and search_value must be provided for search functionality'
      };
    }
    if (searchKey === 'undefined' || searchValue === 'undefined') {
      return { 
        valid: false, 
        error: 'Invalid search parameters'
      };
    }
    if (!isSearchableField(entityName, searchKey)) {
      return { 
        valid: false, 
        error: `Field '${searchKey}' is not searchable for this endpoint`,
        searchable_fields: this.getSearchableFieldsForEntity(entityName)
      };
    }

    return { valid: true };
  }

  /**
   * Get searchable fields for an entity with proper import handling
   * @param entityName - Name of the entity
   * @returns Array of searchable field names
   */
  private static getSearchableFieldsForEntity(entityName: EntityName): string[] {
    try {
      // Import getSearchableFields dynamically to avoid circular dependencies
      const { getSearchableFields } = require('./fieldMapping');
      return getSearchableFields(entityName);
    } catch {
      return [];
    }
  }

  /**
   * Build error response for invalid search parameters  
   * @param entityName - Name of the entity
   * @param searchKey - Invalid search key that was provided
   * @returns Error object with details
   */
  static buildSearchErrorResponse(entityName: EntityName, searchKey: string) {
    return {
      error: `Invalid search_key: '${searchKey}'`,
      message: `The field '${searchKey}' is not searchable for this endpoint.`,
      searchable_fields: this.getSearchableFieldsForEntity(entityName),
      example: `Use ?search_key=name&search_value=John to search by name`
    };
  }
}