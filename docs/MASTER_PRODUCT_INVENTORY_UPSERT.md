# Master Product Inventory Upsert Implementation

## Problem
When calling `POST /master-products/inventory`, the system was creating duplicate materials for the same product instead of updating existing ones (upsert behavior).

## Solution
Implemented upsert behavior for materials in the `MasterProductRepository.createProductInventoryWithTransaction` method:

### 1. Database Schema Changes
- Added unique constraint `product_material_unique` on `(product_id, material_id)` in `ProductInventory` model
- Added migration file: `20251204_add_unique_constraint_product_material.sql`

### 2. Code Changes
**File**: `src/adapters/postgres/repositories/MasterProductRepository.ts`

**Before** (Lines 226-240):
```typescript
const inventoryItems = await Promise.all(
    data.inventoryItems.map(item =>
        prisma.productInventory.create({
            data: {
                product_id: productId!,
                material_id: item.material_id,
                quantity: item.quantity,
                unit_quantity: item.unit_quantity,
            },
            include: {
                material: true,
            },
        })
    )
);
```

**After** (Lines 226-252):
```typescript
// Use Prisma upsert to avoid duplicating materials for the same product
const inventoryItems = await Promise.all(
    data.inventoryItems.map(async (item) => {
        return await prisma.productInventory.upsert({
            where: {
                product_material_unique: {
                    product_id: productId!,
                    material_id: item.material_id,
                },
            },
            update: {
                quantity: item.quantity, // Update existing record
                unit_quantity: item.unit_quantity,
                updatedAt: new Date(),
            },
            create: {
                product_id: productId!,
                material_id: item.material_id,
                quantity: item.quantity,
                unit_quantity: item.unit_quantity,
            },
            include: {
                material: true,
            },
        });
    })
);
```

## Behavior Changes
- **Before**: Each call to `POST /master-products/inventory` would create new `ProductInventory` records, even if the same product-material combination already existed
- **After**: The system now checks if a product-material combination exists:
  - If exists: Updates the quantity and unit_quantity
  - If not exists: Creates a new record

## Database Migration
Run the migration to apply the unique constraint:
```sql
-- Add unique constraint to prevent duplicate product-material combinations
ALTER TABLE product_inventories 
ADD CONSTRAINT product_material_unique 
UNIQUE (product_id, material_id);

-- Add index for performance on frequent lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_inventories_product_material 
ON product_inventories (product_id, material_id);
```

## Testing
Test with the same payload multiple times to verify upsert behavior:
```bash
curl -X POST http://localhost:3000/master-products/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "inventoryItems": [
      {
        "material_id": 1,
        "quantity": 10,
        "unit_quantity": "kg"
      }
    ],
    "productionStockIn": {
      "quantity": 1,
      "unit_quantity": "pcs"
    },
    "materialStockOuts": []
  }'
```

Expected result: Running this multiple times should update the same records instead of creating duplicates.