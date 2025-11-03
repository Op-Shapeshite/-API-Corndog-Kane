import { Response } from 'express';
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TOrderGetResponse, TOrderCreateRequest } from "../../../core/entities/order/order";
import OrderService from '../../../core/services/OrderService';
import OrderRepository from "../../../adapters/postgres/repositories/OrderRepository";
import { OrderResponseMapper } from "../../../mappers/response-mappers/OrderResponseMapper";
import Controller from "./Controller";
import { AuthRequest } from '../../../policies/authMiddleware';
import { Request } from 'express';
import { getWebSocketInstance } from '../../websocket';
import { StockEventEmitter } from '../../websocket/events/StockEventEmitter';
import { StockCalculationService } from '../../websocket/services/StockCalculationService';
import PostgresAdapter from '../../../adapters/postgres/instance';

export class OrderController extends Controller<TOrderGetResponse, TMetadataResponse> {
  private orderService: OrderService;

  constructor() {
    super();
    this.orderService = new OrderService(new OrderRepository());
  }

  /**
   * Get all orders with pagination
   */
  async getAllOrders(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.orderService.getAllOrders(page, limit);

    // Map each order to list response format
    const data = result.orders.map(order => 
      OrderResponseMapper.toOrderListResponse(order)
    );

    return this.getSuccessResponse(
      res,
      {
        data: data as unknown as TOrderGetResponse,
        metadata: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        } as unknown as TMetadataResponse
      },
      'Orders retrieved successfully'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
    return this.handleError(
      res,
      new Error(errorMessage),
      errorMessage,
      500,
      [] as unknown as TOrderGetResponse,
      {} as TMetadataResponse
    );
  }
}

  /**
   * Get order by ID
   */
  async getOrderById(req: Request, res: Response) {
    try {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return this.getFailureResponse(
        res,
        {
          data: null as unknown as TOrderGetResponse,
          metadata: {} as TMetadataResponse
        },
        [{ field: 'id', message: 'Invalid order ID', type: 'invalid' }],
        'Invalid order ID',
        400
      );
    }

    const order = await this.orderService.getOrderById(orderId);
    const data = OrderResponseMapper.toOrderDetailResponse(order);

    return this.getSuccessResponse(
      res,
      {
        data: data as unknown as TOrderGetResponse,
        metadata: {} as TMetadataResponse
      },
      'Order retrieved successfully'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
    const statusCode = error instanceof Error && error.message === 'Order not found' ? 404 : 500;
    
    return this.handleError(
      res,
      error,
      errorMessage,
      statusCode,
      null as unknown as TOrderGetResponse,
      {} as TMetadataResponse
    );
  }
}

  /**
   * Create new order
   */
  async createOrder(req: AuthRequest, res: Response) {
    try {
    const { payment_method, items } = req.body as TOrderCreateRequest;
    const outletId = req.user?.outlet_id;

    if (!outletId) {
      return this.getFailureResponse(
        res,
        {
          data: null as unknown as TOrderGetResponse,
          metadata: {} as TMetadataResponse
        },
        [{ field: 'outlet_id', message: 'Outlet ID not found in authentication token', type: 'required' }],
        'Outlet ID not found in authentication token',
        400
      );
    }

    // Validate required fields
    if (!payment_method) {
      return this.getFailureResponse(
        res,
        {
          data: null as unknown as TOrderGetResponse,
          metadata: {} as TMetadataResponse
        },
        [{ field: 'payment_method', message: 'payment_method is required', type: 'required' }],
        'payment_method is required',
        400
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return this.getFailureResponse(
        res,
        {
          data: null as unknown as TOrderGetResponse,
          metadata: {} as TMetadataResponse
        },
        [{ field: 'items', message: 'items array is required and must not be empty', type: 'required' }],
        'items array is required and must not be empty',
        400
      );
    }      // Convert items format
      const orderItems = items.map(item => ({
        productId: item.product_id,
        qty: item.qty,
      }));

      // Create order
      const order = await this.orderService.createOrder(
        outletId,
        payment_method,
        orderItems
      );

      // Map response
      const response = OrderResponseMapper.toCreateResponse(order);
      // Fetch full order detail for WebSocket broadcast
      const fullOrder = await this.orderService.getOrderById(parseInt(order.id));
      const orderDetailForBroadcast = OrderResponseMapper.toOrderListResponse(fullOrder);

      // Emit new-order event to all connected clients
      try {
        const io = getWebSocketInstance();
        io.emit('new-order', orderDetailForBroadcast);
        console.log(`📡 WebSocket: Broadcasted new order ${fullOrder.invoice_number}`);
      } catch (wsError) {
        console.error('⚠️  WebSocket emit failed:', wsError);
        // Don't fail the request if WebSocket fails
      }

      // Emit product stock change events for each item in the order
      try {
        const stockCalcService = new StockCalculationService(PostgresAdapter.client);
        
        for (const item of items) {
          const stockData = await stockCalcService.calculateProductStock(
            outletId,
            item.product_id,
            new Date()
          );
          
          if (stockData) {
            StockEventEmitter.emitProductStockChange(stockData);
            console.log(`📊 WebSocket: Emitted stock change for product ${item.product_id} at outlet ${outletId}`);
          }
        }
      } catch (wsError) {
        console.error('⚠️  WebSocket stock emit failed:', wsError);
        // Don't fail the request if WebSocket fails
      }

      return this.getSuccessResponse(
        res,
        {
          data: response as unknown as TOrderGetResponse,
          metadata: {} as TMetadataResponse
        },
        'Order created successfully'
      );
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      return this.handleError(
        res,
        error,
        errorMessage,
        400,
        null as unknown as TOrderGetResponse,
        {} as TMetadataResponse
      );
    }
  }
}
