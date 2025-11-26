import { Request, Response } from 'express';
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TMaterialGetResponse, TMaterialStockInCreateRequest, TMaterialStockOutCreateRequest, TMaterialInventoryGetResponse, TMaterialStockInGetResponse } from "../../../core/entities/material/material";
import MaterialService from '../../../core/services/MaterialService';
import MaterialRepository from "../../../adapters/postgres/repositories/MaterialRepository";
import Controller from "./Controller";
import { MaterialStockOutResponseMapper } from "../../../mappers/response-mappers/MaterialStockOutResponseMapper";

export class MaterialController extends Controller<TMaterialGetResponse | TMaterialInventoryGetResponse | TMaterialStockInGetResponse, TMetadataResponse> {
  private materialService: MaterialService;

  constructor() {
    super();
    this.materialService = new MaterialService(new MaterialRepository());
  }

  stockIn = () => {
    return async (req: Request, res: Response) => {
      try {
        const data: TMaterialStockInCreateRequest = req.body;

        // Service returns entity
        const entity = await this.materialService.stockIn(data);

        // Map entity to response
        const responseData = MaterialStockOutResponseMapper.toResponse(entity);

        // 🔥 AUTO-POST FINANCE TRANSACTION TO ACCOUNT 5101 (HPP/COGS)
        try {
          const { TransactionRepository } = await import('../../../adapters/postgres/repositories/TransactionRepository');
          const { PrismaClient } = await import('@prisma/client');

          const transactionRepo = new TransactionRepository();
          const prisma = new PrismaClient();

          // Get material name  
          const material = await prisma.material.findUnique({
            where: { id: data.material_id },
            select: { name: true }
          });

          const materialName = material?.name || 'Unknown Material';
          const purchaseDate = new Date();

          // Calculate total purchase cost: price * quantity
          const totalCost = data.price * data.quantity;

          if (totalCost > 0) {
            await transactionRepo.create({
              accountId: 5101, // Account: HPP/COGS
              amount: totalCost,
              transactionType: 'EXPENSE' as any,
              description: `Pembelian ${materialName}`,
              transactionDate: purchaseDate,
              referenceNumber: `MAT-${data.material_id}-${purchaseDate.getTime()}`
            });

            console.log(`💰 Auto-posted transaction to account 5101: Rp ${totalCost.toLocaleString()} for ${materialName}`);
          }

          await prisma.$disconnect();
        } catch (financeError) {
          console.error('⚠️  Auto-post finance transaction failed:', financeError);
          // Don't fail the stock-in request if finance posting fails
        }

        return this.getSuccessResponse(
          res,
          {
            data: responseData,
            metadata: {} as TMetadataResponse,
          },
          "Stock in created successfully"
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Failed to create stock in",
          500,
          {} as TMaterialInventoryGetResponse,
          {} as TMetadataResponse
        );
      }
    };
  }

  stockOut = () => {
    return async (req: Request, res: Response) => {
      try {
        const data: TMaterialStockOutCreateRequest = req.body;

        // Service returns entity
        const entity = await this.materialService.stockOut(data);

        // Map entity to response
        const mappedResult: TMaterialInventoryGetResponse = MaterialStockOutResponseMapper.toResponse(entity);

        return this.getSuccessResponse(
          res,
          {
            data: mappedResult,
            metadata: {} as TMetadataResponse,
          },
          "Stock out created successfully"
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Failed to create stock out",
          500,
          {} as TMaterialInventoryGetResponse,
          {} as TMetadataResponse
        );
      }
    };
  }

  getBuyList = () => {
    return async (req: Request, res: Response) => {
      try {
        // Use validated pagination params from middleware with defaults
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

        const { data, total } = await this.materialService.getBuyList(page, limit);

        // Map MaterialStockInEntity to TMaterialStockInGetResponse format
        const mappedResults: TMaterialStockInGetResponse[] = data.map(item => ({
          id: item.id,
          date: item.receivedAt.toISOString(),
          suplier_id: item.material.suplierId,
          suplier_name: item.material.suplier?.name || '',
          material_id: item.materialId,
          material_name: item.material.name,
          price: item.price,
          unit_quantity: item.quantityUnit,
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

        return this.getSuccessResponse(
          res,
          {
            data: mappedResults,
            metadata,
          },
          "Material purchase list retrieved successfully"
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Failed to retrieve buy list",
          500,
          [] as TMaterialStockInGetResponse[],
          {} as TMetadataResponse
        );
      }
    };
  }

  getStocksList = () => {
    return async (req: Request, res: Response) => {
      try {
        // Use validated pagination params from middleware with defaults
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

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

        return this.getSuccessResponse(
          res,
          {
            data: mappedResults,
            metadata,
          },
          "Material stocks inventory retrieved successfully"
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Failed to retrieve stocks list",
          500,
          [] as TMaterialInventoryGetResponse[],
          {} as TMetadataResponse
        );
      }
    };
  }
}
