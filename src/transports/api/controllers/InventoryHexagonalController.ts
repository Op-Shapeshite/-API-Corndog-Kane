import { Request, Response } from 'express';
import { InventoryApplicationService } from '../../../core/application/InventoryApplicationService';
import { LegacyInventoryServiceAdapter } from '../../../adapters/legacy/LegacyInventoryServiceAdapter';

/**
 * Inventory Hexagonal Controller
 * Transport layer for inventory domain following hexagonal architecture
 */
export class InventoryHexagonalController {
  constructor(
    private readonly inventoryService: InventoryApplicationService,
    private readonly legacyAdapter: LegacyInventoryServiceAdapter
  ) {}

  /**
   * POST /api/v2/inventory/stock-in
   * Process stock in (batch)
   */
  async stockIn(req: Request, res: Response): Promise<Response> {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Items array is required and must not be empty',
        });
      }

      // Use legacy adapter for backward compatibility
      const result = await this.legacyAdapter.stockIn({ items });

      return res.status(201).json({
        success: true,
        message: 'Stock in processed successfully',
        data: result,
      });
    } catch (error) {
      console.error('Inventory Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * GET /api/v2/inventory/buy-list
   * Get inventory purchase list (material purchases)
   */
  async getBuyList(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchField = req.query.searchField as string | undefined;
      const searchValue = req.query.searchValue as string | undefined;

      const searchConfig = searchField && searchValue
        ? [{ field: searchField, value: searchValue }]
        : undefined;

      const result = await this.legacyAdapter.getBuyList(page, limit, searchConfig);

      return res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      console.error('Inventory Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * PUT /api/v2/inventory/stock-in/:id
   * Update stock in record
   */
  async updateStockIn(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid stock in ID',
        });
      }

      const {
        material_id,
        material,
        supplier_id,
        quantity,
        unit_quantity,
        price,
      } = req.body;

      if (!supplier_id || quantity === undefined || !unit_quantity || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: supplier_id, quantity, unit_quantity, price',
        });
      }

      const result = await this.legacyAdapter.updateStockIn(id, {
        material_id,
        material,
        supplier_id,
        quantity,
        unit_quantity,
        price,
      });

      return res.status(200).json({
        success: true,
        message: 'Stock in updated successfully',
        data: result,
      });
    } catch (error) {
      console.error('Inventory Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * GET /api/v2/inventory/stock/:materialId
   * Get current stock for a material
   */
  async getMaterialStock(req: Request, res: Response): Promise<Response> {
    try {
      const materialId = parseInt(req.params.materialId);
      
      if (isNaN(materialId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid material ID',
        });
      }

      const { MaterialId } = await import('../../../core/domain/value-objects/InventoryValueObjects');
      
      const domainService = this.inventoryService.getDomainService();
      const stockInfo = await domainService.calculateMaterialStock(
        MaterialId.create(materialId)
      );

      return res.status(200).json({
        success: true,
        data: {
          materialId,
          totalStockIn: stockInfo.totalStockIn,
          totalStockOut: stockInfo.totalStockOut,
          currentStock: stockInfo.currentStock,
        },
      });
    } catch (error) {
      console.error('Inventory Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * POST /api/v2/inventory/validate
   * Validate stock in data before processing
   */
  async validateStockIn(req: Request, res: Response): Promise<Response> {
    try {
      const { material_id, material, supplier_id, quantity, unit_quantity } = req.body;

      if (!supplier_id || quantity === undefined || !unit_quantity) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: supplier_id, quantity, unit_quantity',
        });
      }

      const factory = this.inventoryService.getFactory();
      const validation = await factory.validateStockInCommand({
        materialId: material_id,
        materialName: material?.name,
        materialIsActive: material?.is_active,
        supplierId: supplier_id,
        quantity,
        unitQuantity: unit_quantity,
        price: 0, // Price not needed for validation
      });

      if (validation.isSuccess()) {
        return res.status(200).json({
          success: true,
          message: 'Validation passed',
          valid: true,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: validation.getError(),
          valid: false,
        });
      }
    } catch (error) {
      console.error('Inventory Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}
