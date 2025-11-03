/**
 * WebSocket Event Types
 */
export enum WebSocketEvent {
  OUTLET_PRODUCT_STOCK_CHANGED = 'outlet:product:stock:changed',
  OUTLET_MATERIAL_STOCK_CHANGED = 'outlet:material:stock:changed',
}

/**
 * Outlet Product Stock Change Event Data
 */
export type TOutletProductStockChangeEvent = {
  date: string;
  outlet_id: number;
  product_id: number;
  product_name: string;
  first_stock: number;
  stock_in: number;
  sold_stock: number;
  remaining_stock: number;
};

/**
 * Outlet Material Stock Change Event Data
 */
export type TOutletMaterialStockChangeEvent = {
  date: string;
  outlet_id: number;
  material_id: number;
  material_name: string;
  first_stock: number;
  stock_in: number;
  used_stock: number;
  remaining_stock: number;
};
