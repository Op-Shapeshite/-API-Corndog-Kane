# Configuration-Based Mapping in Repository Pattern

## Overview
The `Repository` base class now supports **configuration-based mapping**, eliminating the need for child repositories to implement `mapToEntity` method. Instead, you provide a mapping configuration in the constructor.

## How It Works

### 1. Base Repository with Generic Mapper
**File:** `src/adapters/postgres/repositories/Repository.ts`

The base class now has a generic `mapToEntity` implementation that uses configuration:

```typescript
export interface FieldMapping {
  dbField: string;        // Database field name (snake_case)
  entityField: string;    // Domain entity field name (camelCase)
  transform?: (value: unknown) => unknown;  // Optional transformation
}

export interface RelationMapping {
  dbField: string;        // Database relation field name
  entityField: string;    // Domain entity field name
  isArray?: boolean;      // Is it a one-to-many relation?
  mapper: (dbRecord: unknown) => unknown;  // How to map the relation
}

export interface EntityMapConfig {
  fields: FieldMapping[];
  relations?: RelationMapping[];
}
```

### 2. UserRepository - No mapToEntity Method!
**File:** `src/adapters/postgres/repositories/UserRepository.ts`

```typescript
export default class UserRepository extends Repository<TUser> implements IUserRepository {
  constructor() {
    const mapConfig: EntityMapConfig = {
      fields: [
        { dbField: 'id', entityField: 'id', transform: (v) => MapperUtil.mapId(v as number) },
        { dbField: 'username', entityField: 'username' },
        { dbField: 'name', entityField: 'name', transform: (v) => MapperUtil.mapNullableString(v as string | null) },
        { dbField: 'password', entityField: 'password' },
        { dbField: 'is_active', entityField: 'isActive' },  // Auto snake_case → camelCase
        { dbField: 'createdAt', entityField: 'createdAt' },
        { dbField: 'updatedAt', entityField: 'updatedAt' },
        { dbField: 'lastestLogin', entityField: 'lastestLogin', transform: () => null },
      ],
      relations: [
        {
          dbField: 'role',
          entityField: 'role',
          mapper: (rel) => {
            const role = rel as DbRoleType;
            return {
              id: MapperUtil.mapId(role.id),
              name: role.name,
              description: role.description,
              createdAt: role.createdAt,
              updatedAt: role.updatedAt,
            } as TRole;
          },
        },
      ],
    };

    super("user", mapConfig);
  }

  // Only user-specific methods here!
  async findByUsername(username: string): Promise<TUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });
    
    if (!user) return null;
    
    return this.mapToEntity(user); // Uses parent's implementation!
  }
}
```

## Benefits

### ✅ Zero boilerplate in child repositories
- No need to implement `mapToEntity` method
- Just provide configuration

### ✅ Declarative and readable
- Configuration clearly shows field mappings
- Easy to understand at a glance

### ✅ Consistent mapping logic
- All repositories use the same generic mapper
- Changes to mapping logic happen in one place

### ✅ Reusable transformations
- Use `MapperUtil` functions for common transforms
- DRY principle applied

### ✅ Type-safe
- TypeScript ensures configuration is correct
- Compile-time error checking

## Example: Creating OutletRepository

```typescript
import { TOutlet } from "../../../core/entities/outlet/outlet";
import { OutletRepository as IOutletRepository } from "../../../core/repositories/outlet";
import Repository, { EntityMapConfig } from "./Repository";
import { MapperUtil } from "./utils/MapperUtil";

export default class OutletRepository extends Repository<TOutlet> implements IOutletRepository {
  constructor() {
    const mapConfig: EntityMapConfig = {
      fields: [
        { dbField: 'id', entityField: 'id', transform: (v) => MapperUtil.mapId(v as number) },
        { dbField: 'name', entityField: 'name' },
        { dbField: 'address', entityField: 'address', transform: (v) => MapperUtil.mapNullableString(v as string | null) },
        { dbField: 'phone', entityField: 'phone', transform: (v) => MapperUtil.mapNullableString(v as string | null) },
        { dbField: 'is_active', entityField: 'isActive' },
        { dbField: 'createdAt', entityField: 'createdAt' },
        { dbField: 'updatedAt', entityField: 'updatedAt' },
      ],
      relations: [
        {
          dbField: 'manager',
          entityField: 'manager',
          mapper: (rel) => {
            const mgr = rel as { id: number; name: string };
            return {
              id: MapperUtil.mapId(mgr.id),
              name: mgr.name,
            };
          },
        },
        {
          dbField: 'employees',
          entityField: 'employees',
          isArray: true,  // One-to-many relation
          mapper: (rel) => {
            const emp = rel as { id: number; name: string; position: string };
            return {
              id: MapperUtil.mapId(emp.id),
              name: emp.name,
              position: emp.position,
            };
          },
        },
      ],
    };

    super("outlet", mapConfig);
  }

  // Outlet-specific methods only
  async findByName(name: string): Promise<TOutlet | null> {
    const outlet = await this.prisma.outlet.findFirst({
      where: { name },
      include: { manager: true, employees: true },
    });
    
    if (!outlet) return null;
    
    return this.mapToEntity(outlet);
  }
}
```

## Example: ProductRepository with Array Relations

```typescript
export default class ProductRepository extends Repository<TProduct> {
  constructor() {
    const mapConfig: EntityMapConfig = {
      fields: [
        { dbField: 'id', entityField: 'id', transform: (v) => MapperUtil.mapId(v as number) },
        { dbField: 'name', entityField: 'name' },
        { dbField: 'description', entityField: 'description', transform: (v) => MapperUtil.mapNullableString(v as string | null) },
        { dbField: 'price', entityField: 'price' },
        { dbField: 'stock', entityField: 'stock' },
        { dbField: 'is_active', entityField: 'isActive' },
        { dbField: 'createdAt', entityField: 'createdAt' },
        { dbField: 'updatedAt', entityField: 'updatedAt' },
      ],
      relations: [
        {
          dbField: 'category',
          entityField: 'category',
          mapper: (rel) => {
            const cat = rel as { id: number; name: string };
            return {
              id: MapperUtil.mapId(cat.id),
              name: cat.name,
            } as TCategory;
          },
        },
        {
          dbField: 'outlets',
          entityField: 'outlets',
          isArray: true,
          mapper: (rel) => {
            const outlet = rel as { id: number; outlet_id: number; outlet: { name: string } };
            return {
              id: MapperUtil.mapId(outlet.outlet_id),
              name: outlet.outlet.name,
            };
          },
        },
      ],
    };

    super("product", mapConfig);
  }
}
```

## Configuration Options

### Field Mapping
```typescript
{
  dbField: 'database_field_name',    // Required: DB column name
  entityField: 'entityFieldName',    // Required: Domain property name
  transform?: (value: unknown) => unknown  // Optional: Transform function
}
```

**Common Transforms:**
- `(v) => MapperUtil.mapId(v as number)` - Number to string ID
- `(v) => MapperUtil.mapNullableString(v as string | null)` - Handle null strings
- `(v) => MapperUtil.mapBoolean(v as boolean | null)` - Handle null booleans
- `() => null` - Always return null (for missing fields)
- `() => []` - Default empty array

### Relation Mapping
```typescript
{
  dbField: 'relation_name',          // Required: DB relation name
  entityField: 'relationName',       // Required: Domain property name
  isArray?: boolean,                 // Optional: true for one-to-many
  mapper: (rel: unknown) => unknown  // Required: How to map the relation
}
```

## When to Override mapToEntity

In rare cases, you might need custom mapping logic that's too complex for configuration. You can still override `mapToEntity`:

```typescript
export default class ComplexRepository extends Repository<TComplex> {
  constructor() {
    super("complex"); // No config provided
  }

  // Override with custom logic
  protected mapToEntity(dbRecord: unknown): TComplex {
    const db = dbRecord as ComplexDbType;
    
    // Complex custom logic here
    // Conditional mapping, complex transformations, etc.
    
    return customEntity;
  }
}
```

## Status
✅ Configuration-based mapping implemented
✅ UserRepository now has NO mapToEntity method
✅ All mapping logic in constructor configuration
✅ Generic mapper in Repository base class
✅ Works with MapperUtil for transformations
✅ Supports single and array relations
✅ Zero TypeScript errors
✅ Ready to use for all other repositories
