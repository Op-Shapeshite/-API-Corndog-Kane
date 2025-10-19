# MapperUtil - Reusable Mapping Functions

## Overview
`MapperUtil` is a utility class that provides reusable helper functions for common database-to-domain entity mapping operations. This eliminates code duplication across different repository implementations.

## Location
`src/adapters/postgres/repositories/utils/MapperUtil.ts`

## Available Utilities

### 1. ID Conversion
```typescript
MapperUtil.mapId(id: number | string): string
```
Converts numeric database IDs to string IDs for domain entities.

**Example:**
```typescript
const domainId = MapperUtil.mapId(dbUser.id); // number → string
```

### 2. Field Name Conversion

**Snake to Camel Case:**
```typescript
MapperUtil.snakeToCamel(snakeCase: string): string
```
Converts `is_active` → `isActive`

**Camel to Snake Case:**
```typescript
MapperUtil.camelToSnake(camelCase: string): string
```
Converts `isActive` → `is_active`

### 3. Nullable Field Handlers

**Nullable String:**
```typescript
MapperUtil.mapNullableString(value: string | null, defaultValue = ''): string
```

**Nullable Number:**
```typescript
MapperUtil.mapNullableNumber(value: number | null, defaultValue = 0): number
```

**Nullable Boolean:**
```typescript
MapperUtil.mapBoolean(value: boolean | null, defaultValue = false): boolean
```

**Nullable Date:**
```typescript
MapperUtil.mapDate(value: Date | null): Date | null
```

### 4. Relation Mapping

**Single Relation:**
```typescript
MapperUtil.mapRelation<T>(
  relation: unknown | null | undefined,
  mapper: (rel: unknown) => T
): T | null
```

**Relation Array:**
```typescript
MapperUtil.mapRelationArray<T>(
  relations: unknown[] | null | undefined,
  mapper: (rel: unknown) => T
): T[]
```

### 5. Database Field Conversion

**Domain to Database:**
```typescript
MapperUtil.toDatabaseFields(domainData: Record<string, unknown>): Record<string, unknown>
```
Automatically converts camelCase to snake_case and handles ID conversions.

**Extract Relation ID:**
```typescript
MapperUtil.extractRelationId(relation: { id: string | number } | string | number): number
```

## Usage Examples

### Example 1: UserRepository (Current Implementation)

```typescript
import { MapperUtil } from "./utils/MapperUtil";

export default class UserRepository extends Repository<TUser> {
  protected mapToEntity(dbRecord: unknown): TUser {
    const dbUser = dbRecord as DbUserType;

    return {
      id: MapperUtil.mapId(dbUser.id),
      name: MapperUtil.mapNullableString(dbUser.name),
      username: dbUser.username,
      password: dbUser.password,
      isActive: dbUser.is_active,
      role: MapperUtil.mapRelation(dbUser.role, (rel) => {
        const role = rel as DbRoleType;
        return {
          id: MapperUtil.mapId(role.id),
          name: role.name,
          description: role.description,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        } as TRole;
      }) || {} as TRole,
      lastestLogin: null,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }
}
```

### Example 2: OutletRepository

```typescript
import { MapperUtil } from "./utils/MapperUtil";

export default class OutletRepository extends Repository<TOutlet> {
  protected mapToEntity(dbRecord: unknown): TOutlet {
    const dbOutlet = dbRecord as {
      id: number;
      name: string;
      address: string | null;
      phone: string | null;
      is_active: boolean;
      manager_id: number | null;
      createdAt: Date;
      updatedAt: Date;
      manager?: {
        id: number;
        name: string;
      };
    };

    return {
      id: MapperUtil.mapId(dbOutlet.id),
      name: dbOutlet.name,
      address: MapperUtil.mapNullableString(dbOutlet.address, 'No address'),
      phone: MapperUtil.mapNullableString(dbOutlet.phone),
      isActive: dbOutlet.is_active,
      manager: MapperUtil.mapRelation(dbOutlet.manager, (rel) => {
        const mgr = rel as typeof dbOutlet.manager;
        return {
          id: MapperUtil.mapId(mgr!.id),
          name: mgr!.name,
        };
      }),
      createdAt: dbOutlet.createdAt,
      updatedAt: dbOutlet.updatedAt,
    };
  }

  // For create/update operations
  async create(outlet: TOutlet): Promise<TOutlet> {
    const dbData = {
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone,
      is_active: outlet.isActive,
      manager_id: outlet.manager ? MapperUtil.extractRelationId(outlet.manager) : null,
    };

    const created = await this.prisma.outlet.create({
      data: dbData,
      include: { manager: true },
    });

    return this.mapToEntity(created);
  }
}
```

### Example 3: ProductRepository with Multiple Relations

```typescript
export default class ProductRepository extends Repository<TProduct> {
  protected mapToEntity(dbRecord: unknown): TProduct {
    const dbProduct = dbRecord as {
      id: number;
      name: string;
      description: string | null;
      price: number;
      stock: number;
      is_active: boolean;
      category_id: number;
      createdAt: Date;
      updatedAt: Date;
      category?: DbCategory;
      outlets?: DbProductOutlet[];
    };

    return {
      id: MapperUtil.mapId(dbProduct.id),
      name: dbProduct.name,
      description: MapperUtil.mapNullableString(dbProduct.description),
      price: dbProduct.price,
      stock: dbProduct.stock,
      isActive: dbProduct.is_active,
      category: MapperUtil.mapRelation(dbProduct.category, (rel) => {
        const cat = rel as DbCategory;
        return {
          id: MapperUtil.mapId(cat.id),
          name: cat.name,
        } as TCategory;
      }),
      outlets: MapperUtil.mapRelationArray(dbProduct.outlets, (rel) => {
        const outlet = rel as DbProductOutlet;
        return {
          id: MapperUtil.mapId(outlet.id),
          name: outlet.outlet.name,
        } as TOutletSummary;
      }),
      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
    };
  }
}
```

## Benefits

### ✅ Code Reusability
- Common mapping logic in one place
- No duplication across repositories

### ✅ Consistency
- All repositories use the same conversion rules
- Predictable behavior

### ✅ Maintainability
- Changes to mapping logic happen in one place
- Easy to test utilities independently

### ✅ Type Safety
- Uses TypeScript generics for type-safe mapping
- Catches errors at compile time

### ✅ Readability
- Clean, declarative mapping code
- Self-documenting function names

## When to Use

✅ **Use MapperUtil when:**
- Converting numeric IDs to strings
- Handling nullable fields with defaults
- Mapping snake_case to camelCase
- Mapping relations (single or array)
- Converting domain objects for database operations

❌ **Don't use MapperUtil when:**
- The mapping is too entity-specific
- Complex business logic is involved
- Custom validation is required

## Best Practices

1. **Type Assertions**: Always cast `unknown` to specific types before using
2. **Null Safety**: Use the nullable helpers to provide sensible defaults
3. **Relations**: Use `mapRelation` for optional relations, provide fallback
4. **Arrays**: Use `mapRelationArray` for collection relations
5. **Consistency**: Use the same utilities across all repositories

## Status
✅ MapperUtil created and tested
✅ UserRepository updated to use MapperUtil
✅ Zero TypeScript errors
✅ Ready for use in other repositories
