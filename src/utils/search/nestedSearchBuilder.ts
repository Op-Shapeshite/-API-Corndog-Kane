/**
 * Utility for building nested Prisma where clauses from field paths
 * Supports n-level deep nesting for search operations
 */

import { SearchConfig } from "../../core/repositories/Repository";

/**
 * Builds a nested where clause for Prisma from a field path
 * Supports any depth of nesting (e.g., "product.product_master.name")
 * 
 * @param fieldPath - Dot-separated field path (e.g., "product.product_master.name")
 * @param value - Value to search for
 * @param mode - Search mode ('insensitive' for case-insensitive, 'default' for case-sensitive)
 * @returns Nested where clause object
 * 
 * @example
 * buildNestedWhereClause('product.product_master.name', 'coffee', 'insensitive')
 * // Returns:
 * // {
 * //   product: {
 * //     product_master: {
 * //       name: {
 * //         contains: 'coffee',
 * //         mode: 'insensitive'
 * //       }
 * //     }
 * //   }
 * // }
 */
export function buildNestedWhereClause(
  fieldPath: string, 
  value: string, 
  mode: 'insensitive' | 'default' = 'insensitive'
): Record<string, any> {
  const parts = fieldPath.split('.');
  
  // Build the innermost condition (the actual search criteria)
  let result: Record<string, any> = {
    contains: value,
    mode: mode
  };
  
  // Build nested object from the inside out (right to left)
  // Start from the last part (the actual field to search)
  // and work backwards to build the nested structure
  for (let i = parts.length - 1; i >= 0; i--) {
    result = { [parts[i]]: result };
  }
  
  return result;
}

/**
 * Builds multiple OR conditions for search with nested field support
 * 
 * @param searchConfigs - Array of search configurations
 * @param mode - Search mode ('insensitive' for case-insensitive)
 * @returns Array of where clause objects for Prisma OR condition
 * 
 * @example
 * buildSearchOrConditions([
 *   { field: 'product.name', value: 'coffee' },
 *   { field: 'product.product_master.name', value: 'coffee' }
 * ])
 * // Returns array of nested where clauses for OR condition
 */
export function buildSearchOrConditions(
  searchConfigs: SearchConfig[],
  mode: 'insensitive' | 'default' = 'insensitive'
): Record<string, any>[] {
  return searchConfigs
    .filter(config => config.field && config.value)
    .map(config => buildNestedWhereClause(config.field, config.value, mode));
}

/**
 * Builds a complete where clause with search support
 * Merges base where conditions with search OR conditions
 * 
 * @param baseWhere - Base where conditions (e.g., { status: 'ACCEPTED' })
 * @param searchConfigs - Array of search configurations
 * @param mode - Search mode ('insensitive' for case-insensitive)
 * @returns Complete where clause object
 * 
 * @example
 * buildWhereClauseWithSearch(
 *   { status: 'ACCEPTED' },
 *   [{ field: 'product.product_master.name', value: 'coffee' }]
 * )
 * // Returns:
 * // {
 * //   status: 'ACCEPTED',
 * //   OR: [{
 * //     product: {
 * //       product_master: {
 * //         name: { contains: 'coffee', mode: 'insensitive' }
 * //       }
 * //     }
 * //   }]
 * // }
 */
export function buildWhereClauseWithSearch(
  baseWhere: Record<string, any>,
  searchConfigs?: SearchConfig[],
  mode: 'insensitive' | 'default' = 'insensitive'
): Record<string, any> {
  const whereClause = { ...baseWhere };
  
  if (searchConfigs && searchConfigs.length > 0) {
    const orConditions = buildSearchOrConditions(searchConfigs, mode);
    if (orConditions.length > 0) {
      whereClause.OR = orConditions;
    }
  }
  
  return whereClause;
}

/**
 * Extracts the relation path and field name from a field path
 * Useful for building includes dynamically
 * 
 * @param fieldPath - Dot-separated field path
 * @returns Object with relationPath and fieldName
 * 
 * @example
 * parseFieldPath('product.product_master.name')
 * // Returns: { relationPath: 'product.product_master', fieldName: 'name' }
 */
export function parseFieldPath(fieldPath: string): { 
  relationPath: string | null; 
  fieldName: string;
  parts: string[];
} {
  const parts = fieldPath.split('.');
  
  if (parts.length === 1) {
    return {
      relationPath: null,
      fieldName: parts[0],
      parts: parts
    };
  }
  
  return {
    relationPath: parts.slice(0, -1).join('.'),
    fieldName: parts[parts.length - 1],
    parts: parts
  };
}

/**
 * Builds nested include object for Prisma from field path
 * Supports n-level deep includes
 * 
 * @param fieldPath - Dot-separated field path (e.g., "product.product_master")
 * @param selectFields - Optional fields to select at the deepest level
 * @returns Nested include object
 * 
 * @example
 * buildNestedInclude('product.product_master', { name: true })
 * // Returns:
 * // {
 * //   product: {
 * //     include: {
 * //       product_master: {
 * //         select: { name: true }
 * //       }
 * //     }
 * //   }
 * // }
 */
export function buildNestedInclude(
  fieldPath: string,
  selectFields?: Record<string, boolean>
): Record<string, any> {
  const parts = fieldPath.split('.');
  
  if (parts.length === 0) return {};
  
  // Build from the deepest level
  let result: any = selectFields 
    ? { select: selectFields }
    : true;
  
  // Build nested structure from right to left
  for (let i = parts.length - 1; i >= 0; i--) {
    if (i === parts.length - 1) {
      // Last part: use select if provided
      result = { [parts[i]]: result };
    } else {
      // Intermediate parts: wrap in include
      result = { [parts[i]]: { include: result } };
    }
  }
  
  return result;
}
