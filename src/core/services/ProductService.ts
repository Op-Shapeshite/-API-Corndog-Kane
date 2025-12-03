import { TProduct, TProductWithID, TProductStockInventory, TProductStockInRequest, TProductStockIn, TProductWithMaterial } from "../entities/product/product";
import { ProductRepository } from "../../adapters/postgres/repositories/ProductRepository";
import { Service } from "./Service";
import { PaginationResult, SearchConfig, FilterObject } from "../repositories/Repository";
import MaterialService from "./MaterialService";
import MaterialRepository from "../../adapters/postgres/repositories/MaterialRepository";
import { MasterProductRepository } from "../../adapters/postgres/repositories/MasterProductRepository";

export default class ProductService extends Service<TProduct | TProductWithID> {
  declare repository: ProductRepository;
  declare masterProductRepository: MasterProductRepository;
  private materialService: MaterialService;

  constructor(repository: ProductRepository) {
    super(repository);
    this.masterProductRepository = new MasterProductRepository();
    this.materialService = new MaterialService(new MaterialRepository());
  }

  /**
   * Override findAll to add outlet stock
   */
  async findAll(
    page?: number,
    limit?: number,
    search?: SearchConfig[],
    filters?: FilterObject,
    orderBy?: Record<string, 'asc' | 'desc'>,
    outletId?: number
  ): Promise<PaginationResult<TProduct | TProductWithID>> {
    const result = await super.findAll(page, limit, search, filters, orderBy);

    if (outletId) {
      const today = new Date();

      const dataWithStock = await Promise.all(
        result.data.map(async (product) => {
          const productWithId = product as TProductWithID;
          const stock = await this.repository.getProductStockByOutlet(
            productWithId.id,
            outletId,
            today
          );

          return {
            ...productWithId,
            stock,
          };
        })
      );

      return {
        ...result,
        data: dataWithStock as (TProduct | TProductWithID)[],
      };
    }

    return result;
  }

  /**
   * Add product stock with PRODUCTION source
   * @returns TProductStockIn entity
   */
  async addStockIn(data: TProductStockInRequest): Promise<TProductStockIn> {

    const product = await this.repository.getById(data.product_id.toString());
    if (!product) {
      throw new Error(`Product with ID ${data.product_id} not found`);
    }

    const detailedProduct = await this.repository.getDetailedProduct(data.product_id);
    if (!detailedProduct) {
      throw new Error(`Detailed product with ID ${data.product_id} not found`);
    }

    // Deduct materials based on product inventories for the quantity
    for (const material of detailedProduct.materials) {

      const materialQuantity = data.quantity * material.quantity;

      await this.materialService.stockOut({
        material_id: material.id,
        quantity: materialQuantity,
        unit_quantity: "pcs",
      });
    }

    const stockInRecord = await this.repository.createStockInProduction(
      data.product_id,
      data.quantity,
      data.unit_quantity
    );

    const productWithStocks = await this.repository.getProductWithStocks(data.product_id);
    if (!productWithStocks) {
      throw new Error("Product not found after stock in");
    }

    const currentStock = productWithStocks.stocks
      .reduce((sum, stock) => sum + stock.quantity, 0);

    return {
      id: stockInRecord.id,
      productId: data.product_id,
      productName: product.name,
      quantity: data.quantity,
      unitQuantity: data.unit_quantity,
      currentStock: currentStock,
      date: stockInRecord.date,
    };
  }

  /**
   * Get stocks inventory list
   * @returns Array of TProductStockInventory entities
   */
  async getStocksList(
    page: number = 1,
    limit: number = 10,
    search?: SearchConfig[]
  ): Promise<{ data: TProductStockInventory[], total: number }> {

    const formatTime = (date: Date | null): string => {
      if (!date) return "00:00:00";
      return new Date(date).toTimeString().split(' ')[0];
    };

    const formatDate = (date: Date): string => {
      return new Date(date).toISOString().split('T')[0];
    };

    const [productStocks] = await Promise.all([
      search && search.length > 0
        ? this.repository.getProductStockRecordsWithSearch(search)
        : this.repository.getAllProductStockRecords(),
      this.repository.getAllOrderItems(),
    ]);

    // Group by product_id and date
    interface DailyStock {
      productId: number;
      productName: string;
      date: string;
      stockIn: number;
      stockOut: number;
      unitQuantity: string;
      latestInTime: Date | null;
      latestOutTime: Date | null;
      updatedAt: Date;
    }

    const dailyStocksMap = new Map<string, DailyStock>();

    // Process product stock records
    productStocks.forEach(record => {
      const date = formatDate(record.date);
      const key = `${record.product_id}_${date}`;

      if (!dailyStocksMap.has(key)) {
        dailyStocksMap.set(key, {
          productId: record.product_id,
          productName: record.products.name,
          date,
          stockIn: 0,
          stockOut: 0,
          unitQuantity: 'pcs', // Default unit for products
          latestInTime: null,
          latestOutTime: null,
          updatedAt: record.date,
        });
      }

      const dailyStock = dailyStocksMap.get(key)!;

      // All records in productStock are stockIn
      dailyStock.stockIn += record.quantity;
      dailyStock.latestInTime = record.date;
      dailyStock.updatedAt = record.date;
    });

  
    

    // Convert to array and sort by product_id and date
    const dailyStocks = Array.from(dailyStocksMap.values()).sort((a, b) => {
      if (a.productId !== b.productId) {
        return a.productId - b.productId;
      }
      return a.date.localeCompare(b.date);
    });

    const productStocksMap = new Map<number, number>(); // productId -> running stock
    const data: TProductStockInventory[] = [];

    dailyStocks.forEach(daily => {
      const previousStock = productStocksMap.get(daily.productId) || 0;
      const currentStock = previousStock + daily.stockIn - daily.stockOut;

      data.push({
        id: daily.productId,
        product_id: daily.productId,
        date: daily.date,
        name: daily.productName,
        firstStockCount: previousStock, // Stock awal = stock akhir hari sebelumnya
        stockInCount: daily.stockIn,
        stockOutCount: daily.stockOut,
        currentStock: currentStock, // Stock akhir hari ini
        unitQuantity: daily.unitQuantity,
        updatedAt: daily.updatedAt,
        inTimes: formatTime(daily.latestInTime),
        outTimes: formatTime(daily.latestOutTime),
      });

      productStocksMap.set(daily.productId, currentStock);
    });

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedData = data.slice(skip, skip + limit);
    const total = data.length;

    return { data: paginatedData, total };
  }

  /**
   * Get detailed product with materials relation
   */
  async getDetailedProduct(productId: number) {
    return await this.repository.getDetailedProduct(productId);
  }
  async assignMaterialsToProduct(productId: number, materials: any[]) {
    const product = await this.repository.getById(productId.toString());
    if (!product || !product?.masterProductId) {
      throw new Error(`product with ID ${productId} not found`);
    }
    const masterProductId = product.masterProductId;
    console.log(materials)
    const assignedMaterials = await Promise.all(
      materials.map(materials =>
        this.masterProductRepository.createProductInventoryTransaction({
          product_id: masterProductId,
          material_id: materials.material_id,
          quantity: materials.quantity,
          unit_quantity: materials.unit_quantity,
        })
      ));
    return {
      ...product,
      materials: assignedMaterials.map(material => ({ ...material.material, quantity: material.quantity, quantityUnit: material.unit_quantity }))
    } as TProductWithMaterial
  }
}

