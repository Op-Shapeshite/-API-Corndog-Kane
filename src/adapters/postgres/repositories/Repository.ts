import RepositoryInterface from "../../../core/repositories/Repository";
import { TUser } from "../../../core/entities/user/user";
import { TOutlet } from "../../../core/entities/outlet/outlet";
import { PrismaClient } from "@prisma/client"; 
import PostgresAdapter from "../instance";
import { EntityMapper } from "./utils/EntityMapper";
import { getEntityMapper } from "./utils/EntityMappers";

export type TEntity = TUser | TOutlet;

// Type for Prisma delegate with CRUD operations
interface PrismaDelegate<T> {
  findUnique(args: { where: { id: number } }): Promise<T | null>;
  findMany(): Promise<T[]>;
  create(args: { data: unknown }): Promise<T>;
  update(args: { where: { id: number }; data: unknown }): Promise<T>;
  delete(args: { where: { id: number } }): Promise<T>;
}

// Type for valid Prisma model names
type PrismaModelName = "user" | "role" | "login" | "outlet" | "outletEmployee" | "product" | "productCategory" | "productOutlet" | "order" | "orderItem" | "employee" | "payroll" | "suplier" | "material" | "materialIn" | "materialOut";

// Field mapping configuration types
export interface FieldMapping {
  dbField: string;
  entityField: string;
  transform?: (value: unknown) => unknown;
}

export interface RelationMapping {
  dbField: string;
  entityField: string;
  isArray?: boolean;
  mapper: (dbRecord: unknown) => unknown;
}

export interface EntityMapConfig {
  fields: FieldMapping[];
  relations?: RelationMapping[];
}

export default abstract class Repository<T extends TEntity> implements RepositoryInterface<T> {
  protected tableName: PrismaModelName;
  protected prisma: PrismaClient;
  protected mapper: EntityMapper<T>;
  
  constructor(tableName: PrismaModelName, mapConfig?: EntityMapConfig) {
    this.tableName = tableName;
    this.prisma = PostgresAdapter.client as PrismaClient;
    const config = mapConfig || getEntityMapper(tableName);
    this.mapper = new EntityMapper<T>(config);
  }
  
  protected getModel(): PrismaDelegate<T> {
    return this.prisma[this.tableName] as unknown as PrismaDelegate<T>;
  }
  
  async getById(id: string): Promise<T | null> {
    const model = this.getModel();
    const record = await model.findUnique({ where: { id: parseInt(id) } });
    return record ? this.mapper.mapToEntity(record) : null;
  }
  
  async getAll(): Promise<T[]> {
    const model = this.getModel();
    const records = await model.findMany();
    return this.mapper.mapToEntities(records);
  }
  
  async update(id: string, item: Partial<T>): Promise<T> {
    const model = this.getModel();
    const updated = await model.update({ 
      where: { id: parseInt(id) }, 
      data: item as unknown
    });
    return this.mapper.mapToEntity(updated);
  }
  
  async delete(id: string): Promise<void> {
    const model = this.getModel();
    await model.delete({ where: { id: parseInt(id) } });
  }
  
  async create(item: T): Promise<T> {
    const model = this.getModel();
    const created = await model.create({ data: item as unknown });
    return this.mapper.mapToEntity(created);
  }
}
