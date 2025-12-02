import { EntityMapConfig } from "../../adapters/postgres/repositories/Repository";

/**
 * Mapper for MaterialIn (Stock In) database records to entity
 * Handles conversion between snake_case DB fields and camelCase entity fields
 */
export const MaterialStockInMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: 'id', entityField: 'id' },
    { dbField: 'material_id', entityField: 'materialId' },
    { dbField: 'suplier_id', entityField: 'suplierId' },
    { dbField: 'price', entityField: 'price' },
    { dbField: 'quantity_unit', entityField: 'quantityUnit' },
    { dbField: 'quantity', entityField: 'quantity' },
    { dbField: 'received_at', entityField: 'receivedAt' },
    { dbField: 'createdAt', entityField: 'createdAt' },
    { dbField: 'updatedAt', entityField: 'updatedAt' },
  ],
  relations: [
    {
      dbField: 'material',
      entityField: 'material',
      isArray: false,
      mapper: (material: unknown) => {
        // Type assertion after validation - material comes from Prisma include
        const mat = material as { name: string };
        return {
          name: mat.name,
        };
      }
    },
    {
      dbField: 'suplier',
      entityField: 'suplier',
      isArray: false,
      mapper: (suplier: unknown) => {
        // Type assertion after validation - suplier comes from Prisma include
        const sup = suplier as { id: number; name: string } | null;
        return sup ? {
          id: sup.id,
          name: sup.name
        } : undefined;
      }
    }
  ],
};
