/**
 * Master Product Domain Types
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export type TMasterProduct = {
  name: string;
  categoryId: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TMasterProductWithID = TMasterProduct & {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API RESPONSE TYPES (snake_case)
// ============================================================================

export type TMasterProductGetResponse = {
  id: number;
  name: string;
  category_id: number;
  category: {
    id: number;
    name: string;
    is_active: boolean;
  } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PRODUCT INVENTORY TYPES
// ============================================================================

export type TProductInventory = {
  id: number;
  productId: number;
  materialId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TProductInventoryWithMaterial = TProductInventory & {
  material: {
    id: number;
    name: string;
    suplierId: number;
  }
}

// Request type for create/update inventory
export type TProductInventoryRequest = {
  material_id: number;
  quantity: number;
}

// Response type for inventory
export type TProductInventoryResponse = {
  id: number;
  product_id: number;
  material_id: number;
  material_name: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}
