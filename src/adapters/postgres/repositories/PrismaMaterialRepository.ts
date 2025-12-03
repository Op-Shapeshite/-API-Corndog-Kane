import { PrismaClient } from '@prisma/client';
import {
  IMaterialRepository,
  CreateMaterialData,
  MaterialData,
  MaterialWithStocks,
  ProductInventory,
  CreateStockInData,
  UpdateStockInData,
  StockInData,
  MaterialInData,
  SearchConfig
} from '../../../core/domain/repositories/IInventoryRepository';
import { MaterialId } from '../../../core/domain/value-objects/InventoryValueObjects';

/**
 * Prisma Material Repository Adapter
 * Implements domain repository contract using Prisma
 */
export class PrismaMaterialRepository implements IMaterialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createMaterial(data: CreateMaterialData): Promise<MaterialData> {
    const material = await this.prisma.material.create({
      data: {
        name: data.name,
        is_active: data.isActive,
      },
    });

    return {
      id: material.id,
      name: material.name,
      isActive: material.is_active,
    };
  }

  async findById(materialId: MaterialId): Promise<MaterialData | null> {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId.getValue() },
    });

    if (!material) return null;

    return {
      id: material.id,
      name: material.name,
      isActive: material.is_active,
    };
  }

  async getMaterialWithStocks(materialId: MaterialId): Promise<MaterialWithStocks | null> {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId.getValue() },
      include: {
        material_in: true,
        material_out: true,
      },
    });

    if (!material) return null;

    return {
      id: material.id,
      name: material.name,
      isActive: material.is_active,
      materialIn: material.material_in.map(mi => ({
        id: mi.id,
        materialId: mi.material_id,
        suplierId: mi.suplier_id ?? undefined,
        quantity: mi.quantity,
        quantityUnit: mi.quantity_unit,
        price: mi.price,
        createdAt: mi.createdAt,
      })),
      materialOut: material.material_out.map(mo => ({
        id: mo.id,
        materialId: mo.material_id,
        quantity: mo.quantity,
      })),
    };
  }

  async getProductInventoriesByMaterial(materialId: number): Promise<ProductInventory[]> {
    const productInventories = await this.prisma.productInventory.findMany({
      where: { material_id: materialId },
      select: { unit_quantity: true },
    });

    return productInventories;
  }

  async createStockIn(data: CreateStockInData): Promise<StockInData> {
    const stockIn = await this.prisma.materialIn.create({
      data: {
        material_id: data.materialId,
        suplier_id: data.suplierId,
        quantity: data.quantity,
        price: data.price,
        quantity_unit: data.quantityUnit,
      },
    });

    return {
      id: stockIn.id,
      materialId: stockIn.material_id,
      suplierId: stockIn.suplier_id ?? undefined,
      quantity: stockIn.quantity,
      quantityUnit: stockIn.quantity_unit,
      price: stockIn.price,
      createdAt: stockIn.createdAt,
    };
  }

  async updateStockIn(id: number, data: UpdateStockInData): Promise<void> {
    await this.prisma.materialIn.update({
      where: { id },
      data: {
        material_id: data.materialId,
        suplier_id: data.suplierId,
        quantity: data.quantity,
        price: data.price,
        quantity_unit: data.quantityUnit,
      },
    });
  }

  async getMaterialInList(
    offset: number,
    limit: number,
    search?: SearchConfig[]
  ): Promise<{ data: MaterialInData[]; total: number }> {
    // Build where clause from search config
    let where: Record<string, unknown> = {};
    if (search && search.length > 0) {
      where = search.reduce((acc, config) => {
        if (config.field === 'material.name') {
          return {
            ...acc,
            material: {
              name: { contains: config.value, mode: 'insensitive' },
            },
          };
        }
        return {
          ...acc,
          [config.field]: { contains: config.value, mode: 'insensitive' },
        };
      }, {});
    }

    const [data, total] = await Promise.all([
      this.prisma.materialIn.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          material: true,
          suplier: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.materialIn.count({ where }),
    ]);

    return {
      data: data.map(mi => ({
        id: mi.id,
        materialId: mi.material_id,
        material: { name: mi.material.name },
        quantity: mi.quantity,
        quantityUnit: mi.quantity_unit,
        price: mi.price,
        suplier: mi.suplier ? { id: mi.suplier.id, name: mi.suplier.name } : null,
        receivedAt: mi.received_at ?? mi.createdAt,
      })),
      total,
    };
  }
}
