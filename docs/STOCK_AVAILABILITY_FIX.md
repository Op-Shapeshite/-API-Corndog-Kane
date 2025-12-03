# Stock Availability Check Fix

## Problem
User reported that POST /outlet-requests endpoint was showing "Requested quantity (1) exceeds available stock (0) for product ID 38" even though GET /products/stock endpoint showed final stock of 21 for the same product.

## Root Cause Analysis
There were inconsistencies in how stock was calculated between two different places:

### 1. GET /products/stock endpoint
- **Location**: `src/core/services/ProductService.ts` - `getStocksList` method
- **Logic**: Used `ProductStock` table only, no stock reduction for orders
- **Issue**: Did not account for order items as stock out

### 2. POST /outlet-requests validation
- **Location**: `src/transports/api/validations/outletRequest.validation.ts` - `getProductCurrentStock` function
- **Logic**: Incorrectly summed ALL product stock records instead of calculating running balance by date
- **Issue**: Wrong calculation method - should calculate chronological running stock

## Solution Implemented

### 1. Fixed Validation Stock Calculation
**File**: `src/transports/api/validations/outletRequest.validation.ts`

**Changed from**: Summing all product stock records
```typescript
const allStocks = await PostgresAdapter.client.productStock.findMany({
  where: { product_id: productId },
});
return allStocks.reduce((sum, stock) => sum + stock.quantity, 0);
```

**Changed to**: Proper chronological calculation with order items as stock out
```typescript
// Get both product stocks (IN) and order items (OUT)
const [productStocks, orderItems] = await Promise.all([...]);

// Group by date and calculate daily stock movements
const dailyStocksMap = new Map<string, DailyStock>();

// Process stock IN from productStock table
productStocks.forEach(record => {
  dailyStock.stockIn += record.quantity;
});

// Process stock OUT from orderItem table (excluding cancelled orders)
orderItems.forEach(orderItem => {
  if (orderItem.order.status === 'CANCELLED') return;
  dailyStock.stockOut += orderItem.quantity;
});

// Calculate running stock chronologically
let currentStock = 0;
dailyStocks.forEach(daily => {
  currentStock = currentStock + daily.stockIn - daily.stockOut;
});

return Math.max(0, currentStock);
```

### 2. Fixed GET /products/stock endpoint
**File**: `src/core/services/ProductService.ts` and `src/adapters/postgres/repositories/ProductRepository.ts`

**Added**: New method to fetch order items
```typescript
// In ProductRepository.ts
async getAllOrderItems() {
  return await this.prisma.orderItem.findMany({
    where: {
      is_active: true,
      order: {
        status: { not: 'CANCELLED' }
      }
    },
    include: { product, order },
    orderBy: { createdAt: 'asc' }
  });
}
```

**Updated**: ProductService to include order items in stock calculation
```typescript
// In ProductService.ts
const [productStocks, orderItems] = await Promise.all([
  this.repository.getAllProductStockRecords(),
  this.repository.getAllOrderItems(),
]);

// Process order items as stock out
orderItems.forEach(orderItem => {
  dailyStock.stockOut += orderItem.quantity;
});
```

## Stock Calculation Logic (After Fix)
Both endpoints now use the same consistent logic:

1. **Stock IN**: From `productStock` table (production, purchase)
2. **Stock OUT**: From `orderItem` table (sales, excluding cancelled orders)
3. **Calculation**: Chronological daily running balance: `currentStock = previousStock + stockIn - stockOut`
4. **Final Stock**: Latest calculated `currentStock` for each product

## Files Modified
1. `src/transports/api/validations/outletRequest.validation.ts`
   - Fixed `getProductCurrentStock` function
   - Added order items as stock out
   - Added proper chronological calculation

2. `src/core/services/ProductService.ts`
   - Updated `getStocksList` method
   - Added order items processing
   - Made stock calculation consistent with validation

3. `src/adapters/postgres/repositories/ProductRepository.ts`
   - Added `getAllOrderItems` method
   - Support for fetching order items with proper filtering

## Expected Behavior
- Both GET /products/stock and POST /outlet-requests now calculate stock consistently
- Stock availability check will properly account for sales/orders as stock reduction
- Product ID 38 should show the same stock value in both endpoints

## Testing
Test with the same product ID in both endpoints:
```bash
# Check stock via GET endpoint
curl -X GET "http://localhost:3000/products/stock?page=1&limit=10&search_key=product_id&search_value=38"

# Try outlet request with same product
curl -X POST http://localhost:3000/outlet-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "products": [{"id": 38, "quantity": 1}]
  }'
```

Expected: Both should show consistent stock values and outlet request should succeed if stock is available.