import { Request, Response } from 'express';
import { TMetadataResponse, TResponse } from "../../../core/entities/base/response";
import { TMaterialGetResponse, TMaterialStockInCreateRequest, TMaterialStockOutCreateRequest, TMaterialInventoryGetResponse } from "../../../core/entities/material/material";
import MaterialService from '../../../core/services/MaterialService';
import MaterialRepository from "../../../adapters/postgres/repositories/MaterialRepository";
import Controller from "./Controller";
import { MaterialStockOutResponseMapper } from "../../../mappers/response-mappers/MaterialStockOutResponseMapper";

export class MaterialController extends Controller<TMaterialGetResponse, TMetadataResponse> {
  private materialService: MaterialService;

  constructor() {
    super();
    this.materialService = new MaterialService(new MaterialRepository());
  }

  private getCustomSuccessResponse<T>(
    res: Response,
    data: T,
    metadata: TMetadataResponse,
    message?: string
  ): Response<TResponse<T, TMetadataResponse>> {
    return res.status(200).json({
      status: "success",
      message: message || "Request was successful",
      data,
      metadata,
    } as TResponse<T, TMetadataResponse>);
  }

  stockIn = () => {
    return async (req: Request, res: Response) => {
      const data: TMaterialStockInCreateRequest = req.body;
      const result = await this.materialService.stockIn(data);
      // result is already MaterialInventoryRawData which matches TMaterialInventoryGetResponse structure
      
      return this.getCustomSuccessResponse(
        res,
        result,
        {} as TMetadataResponse,
        "Stock in created successfully"
      );
    };
  }

  stockOut = () => {
    return async (req: Request, res: Response) => {
      const data: TMaterialStockOutCreateRequest = req.body;
      const result = await this.materialService.stockOut(data);
      const mappedResult: TMaterialInventoryGetResponse = MaterialStockOutResponseMapper.toResponse(result);
      
      return this.getCustomSuccessResponse(
        res,
        mappedResult,
        {} as TMetadataResponse,
        "Stock out created successfully"
      );
    };
  }

  getBuyList = () => {
    return async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const { data, total } = await this.materialService.getBuyList(page, limit);
      
      // Map MaterialStockInEntity to response format
      const mappedResults = data.map(item => ({
        id: item.id,
        material_id: item.materialId,
        material_name: item.material.name,
        suplier_name: item.material.suplier?.name || '',
        price: item.price,
        quantity_unit: item.quantityUnit,
        quantity: item.quantity,
        received_at: item.receivedAt,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      }));
      
      const metadata: TMetadataResponse = {
        page,
        limit,
        total_records: total,
        total_pages: Math.ceil(total / limit),
      };
      
      return this.getCustomSuccessResponse(
        res,
        mappedResults,
        metadata,
        "Material purchase list retrieved successfully"
      );
    };
  }

  getStocksList = () => {
    return async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const { data, total } = await this.materialService.getStocksList(page, limit);
      const mappedResults: TMaterialInventoryGetResponse[] = data.map(item => 
        MaterialStockOutResponseMapper.toResponse(item)
      );
      
      const metadata: TMetadataResponse = {
        page,
        limit,
        total_records: total,
        total_pages: Math.ceil(total / limit),
      };
      
      return this.getCustomSuccessResponse(
        res,
        mappedResults,
        metadata,
        "Material stocks inventory retrieved successfully"
      );
    };
  }
}
