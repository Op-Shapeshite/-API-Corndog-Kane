# Repository Pattern with Abstract mapToEntity

## Overview
The `Repository` base class now uses an **abstract `mapToEntity` method** that ensures all child repositories implement their own database-to-domain mapping logic while keeping the pattern consistent across the codebase.

## Architecture Changes

### 1. Base Repository (Abstract Class)

**File:** `src/adapters/postgres/repositories/Repository.ts`

```typescript
export default abstract class Repository<T extends TEntity> implements RepositoryInterface<T> {
  // Abstract method - must be implemented by child classes
  protected abstract mapToEntity(dbRecord: unknown): T;
  
  // All CRUD methods now use mapToEntity
  async getById(id: string): Promise<T | null> {
    const record = await model.findUnique({ where: { id: parseInt(id) } });
    return record ? this.mapToEntity(record) : null;
  }
  
  async getAll(): Promise<T[]> {
    const records = await model.findMany();
    return records.map(record => this.mapToEntity(record));
  }
  
  async create(item: T): Promise<T> {
    const created = await model.create({ data: item as unknown });
    return this.mapToEntity(created);
  }
  
  async update(id: string, item: Partial<T>): Promise<T> {
    const updated = await model.update({ where: { id: parseInt(id) }, data: item as unknown });
    return this.mapToEntity(updated);
  }
}
```

### 2. Child Repository Implementation

**File:** `src/adapters/postgres/repositories/UserRepository.ts`

```typescript
export default class UserRepository extends Repository<TUser> implements IUserRepository {
  // Implements the abstract method with User-specific mapping
  protected mapToEntity(dbUser: unknown): TUser {
    // Type assertion and conversion logic
    // Handles: snake_case → camelCase, number IDs → strings, etc.
  }
  
  // User-specific method
  async findByUsername(username: string): Promise<TUser | null> {
    const user = await this.prisma.user.findUnique({ where: { username }, include: { role: true } });
    return user ? this.mapToEntity(user) : null;
  }
}
```

## Benefits

### ✅ Consistency
- All repositories follow the same pattern
- `mapToEntity` is a standard method across all child repositories

### ✅ Type Safety
- Each repository implements its own type-specific mapping
- TypeScript enforces implementation in child classes

### ✅ DRY Principle
- CRUD operations are defined once in the parent class
- No code duplication across repositories

### ✅ Maintainability
- Changes to CRUD logic happen in one place
- Each repository only handles its specific mapping logic

### ✅ Extensibility
- Easy to add new repositories by extending Repository<T>
- Only need to implement `mapToEntity` and any entity-specific methods

## Usage Pattern

When creating a new repository:

```typescript
import Repository from "./Repository";
import { TYourEntity } from "../../../core/entities/your-entity";

export default class YourEntityRepository extends Repository<TYourEntity> {
  constructor() {
    super("yourEntityTableName"); // Prisma model name
  }
  
  // REQUIRED: Implement abstract method
  protected mapToEntity(dbRecord: unknown): TYourEntity {
    const record = dbRecord as any; // Type assertion based on your schema
    
    return {
      id: record.id.toString(),
      // ... map all fields from database to domain entity
      // Handle snake_case → camelCase conversions
      // Convert types as needed (numbers to strings, etc.)
    };
  }
  
  // OPTIONAL: Add entity-specific methods
  async findByCustomField(value: string): Promise<TYourEntity | null> {
    const record = await this.prisma.yourEntity.findUnique({
      where: { customField: value },
    });
    return record ? this.mapToEntity(record) : null;
  }
}
```

## Example: Creating OutletRepository

```typescript
export default class OutletRepository extends Repository<TOutlet> {
  constructor() {
    super("outlet");
  }
  
  protected mapToEntity(dbOutlet: unknown): TOutlet {
    const outlet = dbOutlet as {
      id: number;
      name: string;
      address: string;
      is_active: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    
    return {
      id: outlet.id.toString(),
      name: outlet.name,
      address: outlet.address,
      isActive: outlet.is_active,
      createdAt: outlet.createdAt,
      updatedAt: outlet.updatedAt,
    };
  }
  
  // Outlet-specific methods
  async findByName(name: string): Promise<TOutlet | null> {
    const outlet = await this.prisma.outlet.findFirst({
      where: { name },
    });
    return outlet ? this.mapToEntity(outlet) : null;
  }
}
```

## Status
✅ Repository class is now abstract
✅ mapToEntity is a protected abstract method
✅ All CRUD operations use mapToEntity for consistency
✅ UserRepository correctly implements the pattern
✅ Zero TypeScript errors
✅ Ready for other repositories to follow the same pattern
