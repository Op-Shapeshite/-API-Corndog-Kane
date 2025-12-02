import { Response } from 'express';
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TOrderGetResponse, TOrderCreateRequest, TOrderListResponse, TOrderDetailResponse, TMyOrderResponse } from "../../../core/entities/order/order";
import { TOutletStockItem, TMaterialStockItem } from "../../../core/entities/outlet/outlet";
import OrderService from '../../../core/services/OrderService';
import OrderRepository from "../../../adapters/postgres/repositories/OrderRepository";
import OutletService from '../../../core/services/OutletService';
import OutletRepository from '../../../adapters/postgres/repositories/OutletRepository';
import { OrderResponseMapper } from "../../../mappers/response-mappers/OrderResponseMapper";
import { OutletProductStockResponseMapper } from "../../../mappers/response-mappers/OutletProductStockResponseMapper";
import { OutletMaterialStockResponseMapper } from "../../../mappers/response-mappers/OutletMaterialStockResponseMapper";
import Controller from "./Controller";
import { AuthRequest } from '../../../policies/authMiddleware';
import { Request } from 'express';
import { getWebSocketInstance } from '../../websocket';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import { styleHeaderRow, setExcelHeaders, autoSizeColumns, formatDate } from '../../../utils/excelHelpers';

// Union type for all possible order response types (including null for error cases)
type TOrderResponseTypes = TOrderGetResponse | TOrderListResponse | TOrderDetailResponse | TMyOrderResponse | null;

// Extended metadata type for orders
type TOrderMetadata = TMetadataResponse | { page: number; limit: number; total: number; totalPages: number };

export class OrderController extends Controller<TOrderResponseTypes, TOrderMetadata> {
  private orderService: OrderService;
  private outletService: OutletService;
  private prisma: PrismaClient;

  constructor() {
    super();
    this.orderService = new OrderService(new OrderRepository());
    this.outletService = new OutletService(new OutletRepository());
    this.prisma = new PrismaClient();
  }

  /**
   * Get all orders with pagination
   */
  async getAllOrders(req: Request, res: Response) {
    try {
      // Check if Excel export is requested
      const type = req.query.type as string;

      // Use validated pagination params from middleware with defaults
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await this.orderService.getAllOrders(page, limit);

      // Map each order to list response format
      const data: TOrderListResponse[] = result.orders.map(order =>
        OrderResponseMapper.toOrderListResponse(order)
      );

      // If Excel export requested, generate and return Excel file
      if (type === 'xlsx') {
        return this.generateOrdersExcel(res, data);
      }

      const metadata: TMetadataResponse = {
        page: result.page,
        limit: result.limit,
        total_records: result.total,
        total_pages: result.totalPages,
      };

      return this.getSuccessResponse(
        res,
        {
          data,
          metadata,
        },
        'Pesanan berhasil diambil'
      );
    } catch (error) {
      return this.handleError(
        res,
        error,
        'Gagal mengambil data pesanan',
        500,
        [] as TOrderListResponse[],
        {
          page: 1,
          limit: 10,
          total_records: 0,
          total_pages: 0,
        } as TMetadataResponse
      );
    }
  }

  /**
   * Get my orders (filtered by outlet_id from token)
   */
  async getMyOrders(req: AuthRequest, res: Response) {
    try {
      // Use validated pagination params from middleware with defaults
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const outletId = req.user?.outlet_id;

      if (!outletId) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ type: 'required', field: 'outlet_id', message: 'ID Outlet tidak ditemukan dalam token autentikasi' }],
          'ID Outlet tidak ditemukan dalam token autentikasi'
        );
      }

      const result = await this.orderService.getOrdersByOutlet(outletId, page, limit);

      // Map each order to my order response format (with nested items)
      const data: TMyOrderResponse[] = result.orders.map((order: any) =>
        OrderResponseMapper.toMyOrderResponse(order)
      );

      const metadata: TMetadataResponse = {
        page: result.page,
        limit: result.limit,
        total_records: result.total,
        total_pages: result.totalPages,
      };

      return this.getSuccessResponse(
        res,
        {
          data,
          metadata,
        },
        'Pesanan berhasil diambil'
      );
    } catch (error) {
      return this.handleError(
        res,
        error,
        'Gagal mengambil data pesanan',
        500,
        [] as TMyOrderResponse[],
        {
          page: 1,
          limit: 10,
          total_records: 0,
          total_pages: 0,
        } as TMetadataResponse
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
          { data: null, metadata: {} as TMetadataResponse },
          [{ type: 'invalid', field: 'order_id', message: 'ID pesanan tidak valid' }],
          'ID pesanan tidak valid'
        );
      }

      const order = await this.orderService.getOrderById(orderId);

      // Use the same format as /order/my endpoint
      const data: TMyOrderResponse = OrderResponseMapper.toMyOrderResponse(order);

      return this.getSuccessResponse(
        res,
        {
          data,
          metadata: {} as TMetadataResponse,
        },
        'Detail pesanan berhasil diambil'
      );
    } catch (error) {
      const statusCode = error instanceof Error && (error.message === 'Order not found' || error.message === 'Pesanan tidak ditemukan') ? 404 : 500;

      return this.handleError(
        res,
        error,
        'Gagal mengambil pesanan',
        statusCode,
        null,
        {} as TMetadataResponse
      );
    }
  }

  /**
   * Create new order
   */
  async createOrder(req: AuthRequest, res: Response) {
    try {
      const { payment_method, is_using_bag, packaging_type, items } = req.body as TOrderCreateRequest;
      const outletId = req.user?.outlet_id;

      if (!outletId) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ type: 'required', field: 'outlet_id', message: 'ID outlet tidak ditemukan dalam token autentikasi' }],
          'ID outlet tidak ditemukan dalam token autentikasi'
        );
      }

      // Validate required fields
      if (!payment_method) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ type: 'required', field: 'payment_method', message: 'Metode pembayaran wajib diisi' }],
          'Metode pembayaran wajib diisi'
        );
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return this.getFailureResponse(
          res,
          { data: null, metadata: {} as TMetadataResponse },
          [{ type: 'required', field: 'items', message: 'Array items wajib diisi dan tidak boleh kosong' }],
          'Array items wajib diisi dan tidak boleh kosong'
        );
      }

      // Validate each item has required fields
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.product_id || typeof item.product_id !== 'number') {
          return this.getFailureResponse(
            res,
            { data: null, metadata: {} as TMetadataResponse },
            [{ type: 'required', field: `items[${i}].product_id`, message: 'product_id wajib diisi dan harus berupa angka' }],
            `Item pada indeks ${i} tidak memiliki product_id yang valid`
          );
        }
        if (!item.qty || typeof item.qty !== 'number' || item.qty <= 0) {
          return this.getFailureResponse(
            res,
            { data: null, metadata: {} as TMetadataResponse },
            [{ type: 'required', field: `items[${i}].qty`, message: 'qty wajib diisi dan harus berupa angka positif' }],
            `Item pada indeks ${i} tidak memiliki qty yang valid`
          );
        }

        // Validate nested items if exists
        if (item.product_items_ids) {
          if (!Array.isArray(item.product_items_ids)) {
            return this.getFailureResponse(
              res,
              { data: null, metadata: {} as TMetadataResponse },
              [{ type: 'invalid', field: `items[${i}].product_items_ids`, message: 'product_items_ids harus berupa array' }],
              `Item pada indeks ${i} memiliki product_items_ids yang tidak valid`
            );
          }

          for (let j = 0; j < item.product_items_ids.length; j++) {
            const subItem = item.product_items_ids[j];
            if (!subItem.product_id || typeof subItem.product_id !== 'number') {
              return this.getFailureResponse(
                res,
                { data: null, metadata: {} as TMetadataResponse },
                [{ type: 'required', field: `items[${i}].product_items_ids[${j}].product_id`, message: 'product_id wajib diisi dan harus berupa angka' }],
                `Nested item pada items[${i}].product_items_ids[${j}] tidak memiliki product_id yang valid`
              );
            }
            if (!subItem.qty || typeof subItem.qty !== 'number' || subItem.qty <= 0) {
              return this.getFailureResponse(
                res,
                { data: null, metadata: {} as TMetadataResponse },
                [{ type: 'required', field: `items[${i}].product_items_ids[${j}].qty`, message: 'qty wajib diisi dan harus berupa angka positif' }],
                `Nested item pada items[${i}].product_items_ids[${j}] tidak memiliki qty yang valid`
              );
            }
          }
        }
      }

      // Validate max nesting depth (max 2 levels)
      for (const item of items) {
        if (item.product_items_ids) {
          for (const subItem of item.product_items_ids) {
            // Check if subItem has nested items (level 3+)
            if ('product_items_ids' in subItem) {
              return this.getFailureResponse(
                res,
                { data: null, metadata: {} as TMetadataResponse },
                [{ type: 'invalid', field: 'product_items_ids', message: 'Maximum nesting level is 2 (parent → children only)' }],
                'Maximum nesting level is 2'
              );
            }
          }
        }
      }

      // Convert items format with nested items
      const orderItems = items.map(item => ({
        productId: item.product_id,
        qty: item.qty,
        productItemsIds: item.product_items_ids?.map(subItem => ({
          productId: subItem.product_id,
          qty: subItem.qty,
        })),
      }));

      // Create order
      const order = await this.orderService.createOrder(
        outletId,
        payment_method,
        orderItems,
        is_using_bag,
        packaging_type
      );

      // Map response
      console.log(order)
      const response: TOrderGetResponse = OrderResponseMapper.toCreateResponse(order);
      // Fetch full order detail for WebSocket broadcast
      const fullOrder = await this.orderService.getOrderForBroadcast(parseInt(order.id));
      const orderDetailForBroadcast: TOrderListResponse = OrderResponseMapper.toOrderListResponse(fullOrder);

      // Emit new-order event to all connected clients
      try {
        const io = getWebSocketInstance();
        io.emit('new-order', orderDetailForBroadcast);
        console.log(`📡 WebSocket: Broadcasted new order ${fullOrder.invoice_number}`);

        // Extract unique product IDs from order items (from raw Prisma result)
        const orderedProductIds = new Set<number>();
        if (fullOrder && fullOrder.items) {
          for (const item of fullOrder.items) {
            orderedProductIds.add(item.product_id);
          }
        }

        // Fetch and emit product stock update (only for ordered products, today only)
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today

          const productStockResult = await this.outletService.getOutletProductStocks(
            outletId,
            1, // page
            undefined, // no limit
            today, // start date - today
            today // end date - today
          );

          // Filter to only include products that were ordered
          const filteredProductStocks = productStockResult.data.filter((item: TOutletStockItem) =>
            orderedProductIds.has(item.product_id)
          );

          if (filteredProductStocks.length > 0) {
            io.emit('new-product-stock', {
              outlet_id: outletId,
              data: filteredProductStocks.map((item: TOutletStockItem) => OutletProductStockResponseMapper.toListResponse(item)),
            });
            console.log(`📡 WebSocket: Broadcasted product stock update for ${filteredProductStocks.length} products in outlet ${outletId} (today only)`);
          }
        } catch (stockError) {
          console.error('⚠️  WebSocket product stock emit failed:', stockError);
        }

        // For materials, we need to check which materials are used in the ordered products
        try {
          if (orderedProductIds.size > 0) {
            // Get material dependencies for ordered products
            const productInventories = await this.prisma.productInventory.findMany({
              where: {
                product_id: {
                  in: Array.from(orderedProductIds),
                },
              },
              select: {
                material_id: true,
              },
            });

            const orderedMaterialIds = new Set<number>(
              productInventories.map((inv: { material_id: number }) => inv.material_id)
            );

            if (orderedMaterialIds.size > 0) {
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Start of today

              const materialStockResult = await this.outletService.getOutletMaterialStocks(
                outletId,
                1, // page
                undefined, // no limit
                today, // start date - today
                today // end date - today
              );

              // Filter to only include materials used in ordered products
              const filteredMaterialStocks = materialStockResult.data.filter((item: TMaterialStockItem) =>
                orderedMaterialIds.has(item.material_id)
              );

              if (filteredMaterialStocks.length > 0) {
                io.emit('new-material-stock', {
                  outlet_id: outletId,
                  data: filteredMaterialStocks.map((item: TMaterialStockItem) => OutletMaterialStockResponseMapper.toListResponse(item)),
                });
                console.log(`📡 WebSocket: Broadcasted material stock update for ${filteredMaterialStocks.length} materials in outlet ${outletId} (today only)`);
              }
            }
          }
        } catch (stockError) {
          console.error('⚠️  WebSocket material stock emit failed:', stockError);
        }
      } catch (wsError) {
        console.error('⚠️  WebSocket emit failed:', wsError);
        // Don't fail the request if WebSocket fails
      }

      // 🔥 AUTO-POST FINANCE TRANSACTION TO ACCOUNT 4101 (Pendapatan Penjualan)
      try {
        const TransactionRepository = (await import('../../../adapters/postgres/repositories/TransactionRepository')).TransactionRepository;
        const transactionRepo = new TransactionRepository();

        // Calculate total HPP from all order items
        let totalHPP = 0;
        if (fullOrder && fullOrder.items) {
          for (const item of fullOrder.items) {
            // Get product HPP from database
            const product = await this.prisma.product.findUnique({
              where: { id: item.product_id },
              select: { hpp: true }
            });

            if (product && product.hpp) {
              totalHPP += Number(product.hpp) * item.quantity;
            }
          }
        }

        // Calculate profit: total_amount - total_hpp
        const totalAmount = Number(fullOrder.total_amount) || 0;
        const profit = totalAmount - totalHPP;

        // Only create transaction if profit > 0
        if (profit > 0) {
          const orderDate = new Date();
          const formattedDate = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD

          await transactionRepo.create({
            accountId: 4101, // Account: Pendapatan Penjualan
            amount: profit,
            transactionType: 'INCOME' as any,
            description: `Pendapatan Penjualan ${formattedDate}`,
            transactionDate: orderDate,
            referenceNumber: fullOrder.invoice_number
          });

          console.log(`💰 Auto-posted transaction to account 4101: Rp ${profit.toLocaleString()} for order ${fullOrder.invoice_number}`);
        }
      } catch (financeError) {
        console.error('⚠️  Auto-post finance transaction failed:', financeError);
        // Don't fail the order request if finance posting fails
      }

      return this.getSuccessResponse(
        res,
        {
          data: response,
          metadata: {} as TMetadataResponse,
        },
        'Pesanan berhasil dibuat'
      );
    } catch (error) {
      console.error('Error creating order:', error);
      const errMessage =
        error instanceof Error ? error.message : typeof error === 'string' ? error : 'Failed to create order';
      return this.handleError(
        res,
        error,
        errMessage,
        400,
        null,
        {} as TMetadataResponse
      );
    }
  }

  /**
   * Generate Excel file for orders
   */
  private async generateOrdersExcel(res: Response, orders: TOrderListResponse[]) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders');

      // Add headers
      const headerRow = worksheet.addRow([
        'Invoice Number',
        'Outlet',
        'Payment Method',
        'Total Amount',
        'Order Status',
        'Created At'
      ]);
      styleHeaderRow(headerRow);

      // Add data rows
      orders.forEach(order => {
        worksheet.addRow([
          order.invoice_number || '-',
          order.outlet_name || '-',
          order.payment_method || '-',
          order.total_amount || 0,
          order.order_status || '-',
          (order.created_at && typeof order.created_at === 'string') || order.created_at instanceof Date
            ? formatDate(order.created_at as string | Date)
            : '-'
        ]);
      });

      // Auto-size columns
      autoSizeColumns(worksheet);

      // Set response headers and send file
      const filename = `orders-${new Date().toISOString().split('T')[0]}.xlsx`;
      setExcelHeaders(res, filename);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error generating Excel:', error);
      throw error;
    }
  }
}
