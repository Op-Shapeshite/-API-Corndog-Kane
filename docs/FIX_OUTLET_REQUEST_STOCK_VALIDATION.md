# Fix: Product Stock Calculation in Outlet Request Validation

## Problem
Endpoint `POST /outlet-requests` was incorrectly reporting 0 available stock for products that should have stock available. In the specific case mentioned, product_id 38 should have had 21 stock but was showing 0.

## Root Cause
The `getProductCurrentStock()` function in `outletRequest.validation.ts` was **summing all ProductStock records** for a product instead of taking the **latest stock snapshot**.

This is incorrect because `ProductStock` table contains daily snapshots, not incremental transactions. Each record represents the total stock on that specific date.

## Error Analysis
**Incorrect Logic (Before Fix):**
```typescript
// Wrong: Sum all ProductStock records
const allStocks = await PostgresAdapter.client.productStock.findMany({
  where: { product_id: productId },
});
return allStocks.reduce((sum, stock) => sum + stock.quantity, 0);
```

If you had these records for product_id 38:
- 2025-12-01: quantity = 20
- 2025-12-02: quantity = 21  
- 2025-12-03: quantity = 21

The old logic would calculate: 20 + 21 + 21 = 62 (wrong!)
When it should be: 21 (latest snapshot)

## Solution
**Correct Logic (After Fix):**
```typescript
// Correct: Get latest stock snapshot by date
const latestStock = await PostgresAdapter.client.productStock.findFirst({
  where: { 
    product_id: productId,
    is_active: true 
  },
  orderBy: { date: 'desc' },
});

return latestStock?.quantity || 0;
```

## File Changed
**File**: `src/transports/api/validations/outletRequest.validation.ts`  
**Function**: `getProductCurrentStock(productId: number)`

## Test Case
To verify the fix works:

1. Check actual stock in database:
```sql
SELECT product_id, quantity, date, is_active 
FROM product_stocs 
WHERE product_id = 38 
ORDER BY date DESC 
LIMIT 1;
```

2. Test the endpoint:
```bash
curl -X POST http://localhost:8080/outlet-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "products": [
      {
        "id": 38,
        "quantity": 1
      }
    ]
  }'
```

**Expected Result**: Should succeed if quantity <= latest stock, instead of showing "Requested quantity (1) exceeds available stock (0)".

## Impact
- ✅ Fixes incorrect stock availability calculation
- ✅ Allows valid outlet requests to proceed  
- ✅ Prevents false stock shortage errors
- ✅ Uses proper snapshot logic for stock calculation

## Related Tables
- `product_stocs` (ProductStock): Daily stock snapshots
- `outlet_product_requests`: Outlet requests for products

## Notes
- This fix only affects the validation layer
- The underlying stock calculation logic in other parts of the system may need similar review
- ProductStock represents snapshots, not transactions - this pattern should be consistent across the codebase