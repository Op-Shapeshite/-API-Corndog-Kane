-- Migration: Add unique constraint for product_id + material_id in product_inventories
-- Date: 2025-12-04
-- Description: Prevents duplicate materials for the same product in product inventories

-- Add unique constraint to prevent duplicate product-material combinations
ALTER TABLE product_inventories 
ADD CONSTRAINT product_material_unique 
UNIQUE (product_id, material_id);

-- Add index for performance on frequent lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_inventories_product_material 
ON product_inventories (product_id, material_id);