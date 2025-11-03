import { PrismaClient } from '@prisma/client';
import { TOutletProductStockChangeEvent, TOutletMaterialStockChangeEvent } from '../../../core/entities/websocket/events';

export class StockCalculationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Calculate current product stock for a specific outlet and product
   */
  async calculateProductStock(
    outletId: number,
    productId: number,
    date: Date = new Date()
  ): Promise<TOutletProductStockChangeEvent | null> {
    // Get product info
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return null;
    }

    const currentDateStr = date.toISOString().split('T')[0];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate first_stock (remaining from previous day)
    const previousDate = new Date(date);
    previousDate.setDate(previousDate.getDate() - 1);
    const prevStartOfDay = new Date(previousDate);
    prevStartOfDay.setHours(0, 0, 0, 0);
    const prevEndOfDay = new Date(previousDate);
    prevEndOfDay.setHours(23, 59, 59, 999);

    // Get previous day's stock in
    const prevStockInData = await this.prisma.outletProductRequest.aggregate({
      where: {
        product_id: productId,
        outlet_id: outletId,
        status: 'APPROVED',
        createdAt: {
          gte: prevStartOfDay,
          lte: prevEndOfDay,
        },
        is_active: true,
      },
      _sum: { approval_quantity: true },
    });
    const prevStockIn = prevStockInData._sum.approval_quantity || 0;

    // Get previous day's sold
    const prevSoldData = await this.prisma.orderItem.aggregate({
      where: {
        product_id: productId,
        order: {
          outlet_id: outletId,
          createdAt: {
            gte: prevStartOfDay,
            lte: prevEndOfDay,
          },
          is_active: true,
        },
        is_active: true,
      },
      _sum: { quantity: true },
    });
    const prevSold = prevSoldData._sum.quantity || 0;
    
    // First stock is previous stock in minus previous sold
    // Note: This is simplified. In production, you might want to track actual stock from product_stock table
    const firstStock = prevStockIn - prevSold;

    // Calculate stock_in (approved outlet requests for today)
    const stockInData = await this.prisma.outletProductRequest.aggregate({
      where: {
        product_id: productId,
        outlet_id: outletId,
        status: 'APPROVED',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        is_active: true,
      },
      _sum: {
        approval_quantity: true,
      },
    });
    const stockIn = stockInData._sum.approval_quantity || 0;

    // Calculate sold_stock (order items for today)
    const soldStockData = await this.prisma.orderItem.aggregate({
      where: {
        product_id: productId,
        order: {
          outlet_id: outletId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          is_active: true,
        },
        is_active: true,
      },
      _sum: {
        quantity: true,
      },
    });
    const soldStock = soldStockData._sum.quantity || 0;

    // Calculate remaining_stock
    const remainingStock = firstStock + stockIn - soldStock;

    return {
      date: currentDateStr,
      outlet_id: outletId,
      product_id: product.id,
      product_name: product.name,
      first_stock: firstStock,
      stock_in: stockIn,
      sold_stock: soldStock,
      remaining_stock: remainingStock,
    };
  }

  /**
   * Calculate current material stock for a specific outlet and material
   */
  async calculateMaterialStock(
    outletId: number,
    materialId: number,
    date: Date = new Date()
  ): Promise<TOutletMaterialStockChangeEvent | null> {
    // Get material info
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      select: { id: true, name: true },
    });

    if (!material) {
      return null;
    }

    const currentDateStr = date.toISOString().split('T')[0];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate first_stock (remaining from previous day)
    const previousDate = new Date(date);
    previousDate.setDate(previousDate.getDate() - 1);
    const prevStartOfDay = new Date(previousDate);
    prevStartOfDay.setHours(0, 0, 0, 0);
    const prevEndOfDay = new Date(previousDate);
    prevEndOfDay.setHours(23, 59, 59, 999);

    // Get previous day's stock in
    const prevStockInData = await this.prisma.outletMaterialRequest.aggregate({
      where: {
        material_id: materialId,
        outlet_id: outletId,
        status: 'APPROVED',
        createdAt: {
          gte: prevStartOfDay,
          lte: prevEndOfDay,
        },
        is_active: true,
      },
      _sum: { approval_quantity: true },
    });
    const prevStockIn = prevStockInData._sum.approval_quantity || 0;

    // Get previous day's used
    const prevUsedData = await this.prisma.materialOut.aggregate({
      where: {
        material_id: materialId,
        used_at: {
          gte: prevStartOfDay,
          lte: prevEndOfDay,
        },
      },
      _sum: { quantity: true },
    });
    const prevUsed = prevUsedData._sum.quantity || 0;
    
    const firstStock = prevStockIn - prevUsed;

    // Calculate stock_in (approved outlet material requests for today)
    const stockInData = await this.prisma.outletMaterialRequest.aggregate({
      where: {
        material_id: materialId,
        outlet_id: outletId,
        status: 'APPROVED',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        is_active: true,
      },
      _sum: {
        approval_quantity: true,
      },
    });
    const stockIn = stockInData._sum.approval_quantity || 0;

    // Calculate used_stock (material out for today)
    const usedStockData = await this.prisma.materialOut.aggregate({
      where: {
        material_id: materialId,
        used_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        quantity: true,
      },
    });
    const usedStock = usedStockData._sum.quantity || 0;

    // Calculate remaining_stock
    const remainingStock = firstStock + stockIn - usedStock;

    return {
      date: currentDateStr,
      outlet_id: outletId,
      material_id: material.id,
      material_name: material.name,
      first_stock: firstStock,
      stock_in: stockIn,
      used_stock: usedStock,
      remaining_stock: remainingStock,
    };
  }
}
