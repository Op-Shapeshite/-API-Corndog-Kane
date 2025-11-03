import { getWebSocketInstance } from '../index';
import { 
  WebSocketEvent, 
  TOutletProductStockChangeEvent,
  TOutletMaterialStockChangeEvent 
} from '../../../core/entities/websocket/events';

export class StockEventEmitter {
  /**
   * Emit outlet product stock change event
   */
  static emitProductStockChange(data: TOutletProductStockChangeEvent): void {
    try {
      const io = getWebSocketInstance();
      
      // Emit to specific outlet room
      io.to(`outlet:${data.outlet_id}`).emit(
        WebSocketEvent.OUTLET_PRODUCT_STOCK_CHANGED,
        data
      );
      
      // Also emit to general product stock room for admin/monitoring
      io.to('product:stocks').emit(
        WebSocketEvent.OUTLET_PRODUCT_STOCK_CHANGED,
        data
      );
      
      console.log(`📊 Product stock change emitted for outlet ${data.outlet_id}, product ${data.product_id}`);
    } catch (error) {
      console.error('Failed to emit product stock change:', error);
    }
  }

  /**
   * Emit outlet material stock change event
   */
  static emitMaterialStockChange(data: TOutletMaterialStockChangeEvent): void {
    try {
      const io = getWebSocketInstance();
      
      // Emit to specific outlet room
      io.to(`outlet:${data.outlet_id}`).emit(
        WebSocketEvent.OUTLET_MATERIAL_STOCK_CHANGED,
        data
      );
      
      // Also emit to general material stock room for admin/monitoring
      io.to('material:stocks').emit(
        WebSocketEvent.OUTLET_MATERIAL_STOCK_CHANGED,
        data
      );
      
      console.log(`📊 Material stock change emitted for outlet ${data.outlet_id}, material ${data.material_id}`);
    } catch (error) {
      console.error('Failed to emit material stock change:', error);
    }
  }
}
