import { PrismaClient } from '@prisma/client';
import { ISupplierRepository, SupplierData } from '../../../core/domain/repositories/IInventoryRepository';
import { SupplierId, MaterialId } from '../../../core/domain/value-objects/InventoryValueObjects';

/**
 * Prisma Supplier Repository Adapter
 * Implements domain repository contract using Prisma
 */
export class PrismaSupplierRepository implements ISupplierRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(supplierId: SupplierId): Promise<SupplierData | null> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId.getValue() },
    });

    if (!supplier) return null;

    return {
      id: supplier.id,
      name: supplier.name,
    };
  }

  async exists(supplierId: SupplierId): Promise<boolean> {
    const count = await this.prisma.supplier.count({
      where: { id: supplierId.getValue() },
    });

    return count > 0;
  }

  async suppliesMaterial(
    _supplierId: SupplierId,
    _materialId: MaterialId
  ): Promise<boolean> {
    // For now, any supplier can supply any material
    // This can be extended with a supplier-material relationship table
    return true;
  }
}
