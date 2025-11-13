import { Request, Response } from "express";
import { MasterProductRepository } from "../../../adapters/postgres/repositories/MasterProductRepository";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TMasterProductGetResponse, TProductInventoryResponse } from "../../../core/entities/product/masterProduct";
import MasterProductService from "../../../core/services/MasterProductService";
import Controller from "./Controller";
import { MasterProductResponseMapper, ProductInventoryResponseMapper } from "../../../mappers/response-mappers/MasterProductResponseMapper";

export class MasterProductController extends Controller<TMasterProductGetResponse | TProductInventoryResponse, TMetadataResponse> {
  private masterProductService: MasterProductService;

  constructor() {
    super();
    this.masterProductService = new MasterProductService(new MasterProductRepository());
  }

  /**
   * Get all master products without pagination
   */
  getAllMasterProducts = async (req: Request, res: Response) => {
    try {
      const masterProducts = await this.masterProductService.getAllMasterProducts();
      
      // Get categories for each master product
      const prisma = new MasterProductRepository()['prisma'];
      const masterProductsWithCategory = await Promise.all(
        masterProducts.map(async (mp) => {
          const fullData = await prisma.productMaster.findUnique({
            where: { id: mp.id },
            include: { category: true },
          });
          return {
            ...mp,
            category: fullData?.category ? {
              id: fullData.category.id,
              name: fullData.category.name,
              is_active: fullData.category.is_active,
            } : null,
          };
        })
      );

      const responseData = MasterProductResponseMapper.toListResponse(masterProductsWithCategory);

      return this.getSuccessResponse(
        res,
        {
          data: responseData,
          metadata: {} as TMetadataResponse,
        },
        "Master products retrieved successfully"
      );
    } catch (error) {
      console.error("Error getting master products:", error);
      return this.handleError(
        res,
        error,
        "Failed to get master products",
        500,
        [] as TMasterProductGetResponse[],
        {} as TMetadataResponse
      );
    }
  }

  /**
   * Create or update product inventories
   */
  upsertProductInventories = async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const inventories = req.body;

      const result = await this.masterProductService.upsertProductInventories(productId, inventories);
      const responseData = ProductInventoryResponseMapper.toListResponse(result);

      return this.getSuccessResponse(
        res,
        {
          data: responseData,
          metadata: {} as TMetadataResponse,
        },
        "Product inventories updated successfully"
      );
    } catch (error) {
      console.error("Error upserting product inventories:", error);
      return this.handleError(
        res,
        error,
        "Failed to update product inventories",
        500,
        [] as TProductInventoryResponse[],
        {} as TMetadataResponse
      );
    }
  }

  /**
   * Get product inventories
   */
  getProductInventories = async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);

      const inventories = await this.masterProductService.getProductInventories(productId);
      const responseData = ProductInventoryResponseMapper.toListResponse(inventories);

      return this.getSuccessResponse(
        res,
        {
          data: responseData,
          metadata: {} as TMetadataResponse,
        },
        "Product inventories retrieved successfully"
      );
    } catch (error) {
      console.error("Error getting product inventories:", error);
      return this.handleError(
        res,
        error,
        "Failed to get product inventories",
        500,
        [] as TProductInventoryResponse[],
        {} as TMetadataResponse
      );
    }
  }
}
