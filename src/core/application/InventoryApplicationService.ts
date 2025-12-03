import { IMaterialRepository, ISupplierRepository, SearchConfig } from '../domain/repositories/IInventoryRepository';
import { IEventBus } from '../domain/ports/secondary/IEventBus';
import { InventoryFactory } from '../domain/factories/InventoryFactory';
import { InventoryDomainService } from '../domain/services/InventoryDomainService';
import {
  StockInCommandHandler,
  UpdateStockInCommandHandler,
  GetBuyListQueryHandler
} from './handlers/InventoryCommandHandlers';
import {
  StockInCommand,
  UpdateStockInCommand,
  GetBuyListQuery,
  StockInBatchResult,
  StockInResult,
  BuyListResult
} from './commands/InventoryCommands';
import { StockInItemData } from '../domain/value-objects/InventoryValueObjects';

/**
 * Inventory Application Service
 * Primary port for inventory operations
 * Coordinates between commands, queries, and domain services
 */
export class InventoryApplicationService {
  private readonly stockInHandler: StockInCommandHandler;
  private readonly updateStockInHandler: UpdateStockInCommandHandler;
  private readonly buyListHandler: GetBuyListQueryHandler;
  private readonly factory: InventoryFactory;
  private readonly domainService: InventoryDomainService;

  constructor(
    materialRepository: IMaterialRepository,
    supplierRepository: ISupplierRepository,
    eventBus: IEventBus
  ) {
    // Initialize domain service
    this.domainService = new InventoryDomainService(
      materialRepository,
      supplierRepository
    );

    // Initialize factory
    this.factory = new InventoryFactory(
      materialRepository,
      supplierRepository,
      this.domainService
    );

    // Initialize command handlers
    this.stockInHandler = new StockInCommandHandler(
      materialRepository,
      supplierRepository,
      eventBus,
      this.factory,
      this.domainService
    );

    this.updateStockInHandler = new UpdateStockInCommandHandler(
      materialRepository,
      supplierRepository,
      eventBus,
      this.factory,
      this.domainService
    );

    // Initialize query handlers
    this.buyListHandler = new GetBuyListQueryHandler(materialRepository);
  }

  /**
   * Process batch stock in
   */
  async stockIn(items: StockInItemData[]): Promise<StockInBatchResult> {
    const command = new StockInCommand(items);
    return this.stockInHandler.handle(command);
  }

  /**
   * Update stock in record
   */
  async updateStockIn(
    stockInId: number,
    data: {
      materialId?: number;
      materialName?: string;
      materialIsActive?: boolean;
      supplierId: number;
      quantity: number;
      unitQuantity: string;
      price: number;
    }
  ): Promise<StockInResult> {
    const command = new UpdateStockInCommand(
      stockInId,
      data.materialId,
      data.materialName,
      data.materialIsActive,
      data.supplierId,
      data.quantity,
      data.unitQuantity,
      data.price
    );
    return this.updateStockInHandler.handle(command);
  }

  /**
   * Get buy list with pagination
   */
  async getBuyList(
    page: number = 1,
    limit: number = 10,
    searchConfig?: SearchConfig[]
  ): Promise<BuyListResult> {
    const query = new GetBuyListQuery(
      page,
      limit,
      searchConfig?.[0]?.field,
      searchConfig?.[0]?.value
    );
    return this.buyListHandler.handle(query);
  }

  /**
   * Get domain service for direct domain operations
   */
  getDomainService(): InventoryDomainService {
    return this.domainService;
  }

  /**
   * Get factory for complex object creation
   */
  getFactory(): InventoryFactory {
    return this.factory;
  }
}
