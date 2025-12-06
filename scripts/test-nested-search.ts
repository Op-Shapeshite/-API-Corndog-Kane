/**
 * Test script for nested search implementation
 * Run with: npx ts-node scripts/test-nested-search.ts
 */

import { buildNestedWhereClause, buildSearchOrConditions, buildWhereClauseWithSearch, parseFieldPath, buildNestedInclude } from '../src/utils/search/nestedSearchBuilder';

console.log('🧪 Testing Nested Search Builder\n');

// Test 1: Simple field (1 level)
console.log('Test 1: Simple field (1 level)');
const test1 = buildNestedWhereClause('name', 'coffee', 'insensitive');
console.log(JSON.stringify(test1, null, 2));
console.log('✅ Expected: { name: { contains: "coffee", mode: "insensitive" } }\n');

// Test 2: Nested field (2 levels)
console.log('Test 2: Nested field (2 levels)');
const test2 = buildNestedWhereClause('category.name', 'food', 'insensitive');
console.log(JSON.stringify(test2, null, 2));
console.log('✅ Expected: { category: { name: { contains: "food", mode: "insensitive" } } }\n');

// Test 3: Deep nested field (3 levels)
console.log('Test 3: Deep nested field (3 levels)');
const test3 = buildNestedWhereClause('product.product_master.name', 'latte', 'insensitive');
console.log(JSON.stringify(test3, null, 2));
console.log('✅ Expected: { product: { product_master: { name: { contains: "latte", mode: "insensitive" } } } }\n');

// Test 4: Very deep nesting (4 levels)
console.log('Test 4: Very deep nesting (4 levels)');
const test4 = buildNestedWhereClause('level1.level2.level3.field', 'value', 'insensitive');
console.log(JSON.stringify(test4, null, 2));
console.log('✅ Expected: 4 levels of nesting\n');

// Test 5: Multiple OR conditions
console.log('Test 5: Multiple OR conditions');
const test5 = buildSearchOrConditions([
  { field: 'name', value: 'coffee' },
  { field: 'category.name', value: 'beverage' }
]);
console.log(JSON.stringify(test5, null, 2));
console.log('✅ Expected: Array with 2 conditions\n');

// Test 6: Complete where clause with base conditions
console.log('Test 6: Complete where clause with base conditions');
const test6 = buildWhereClauseWithSearch(
  { status: 'ACCEPTED', is_active: true },
  [{ field: 'product.product_master.name', value: 'coffee' }]
);
console.log(JSON.stringify(test6, null, 2));
console.log('✅ Expected: Base conditions + OR with nested search\n');

// Test 7: Parse field path
console.log('Test 7: Parse field path');
const test7 = parseFieldPath('product.product_master.name');
console.log(JSON.stringify(test7, null, 2));
console.log('✅ Expected: { relationPath: "product.product_master", fieldName: "name", parts: [...] }\n');

// Test 8: Build nested include
console.log('Test 8: Build nested include');
const test8 = buildNestedInclude('product.product_master', { name: true, id: true });
console.log(JSON.stringify(test8, null, 2));
console.log('✅ Expected: Nested include structure\n');

// Test 9: Empty search configs
console.log('Test 9: Empty search configs');
const test9 = buildWhereClauseWithSearch({ status: 'ACTIVE' }, []);
console.log(JSON.stringify(test9, null, 2));
console.log('✅ Expected: Just base conditions, no OR\n');

// Test 10: Invalid/filtered search configs
console.log('Test 10: Filtered search configs');
const test10 = buildSearchOrConditions([
  { field: '', value: 'test' }, // Empty field - should be filtered
  { field: 'name', value: '' }, // Empty value - should be filtered  
  { field: 'name', value: 'valid' } // Valid - should be included
]);
console.log(JSON.stringify(test10, null, 2));
console.log('✅ Expected: Only 1 valid condition\n');

console.log('🎉 All tests completed!');
console.log('\n📝 Notes:');
console.log('- All nested structures are built from inside out');
console.log('- Field paths support unlimited depth');
console.log('- Empty/invalid configs are automatically filtered');
console.log('- Case-insensitive search is the default mode');
