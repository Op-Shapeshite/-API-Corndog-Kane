# UserRepository Implementation

## Overview
`UserRepository` is the concrete implementation of the `UserRepository` interface from the core layer, extending the base `Repository<TUser>` class and providing user-specific database operations.

## Implementation Details

### Interface Compliance
Implements all methods from `IUserRepository` interface:
- ✅ `findById(id: string): Promise<TUser | null>`
- ✅ `findByUsername(username: string): Promise<TUser | null>`
- ✅ `create(user: TUser): Promise<TUser>`
- ✅ `update(id: string, user: Partial<TUser>): Promise<TUser>`
- ✅ `delete(id: string): Promise<void>`

### Key Features

#### 1. Entity Mapping
- **mapToEntity()** - Protected method that converts database records to domain entities
  - Handles snake_case to camelCase conversion (is_active → isActive)
  - Converts numeric IDs to strings
  - Includes role relation transformation
  - Sets default values for null fields

#### 2. CRUD Operations

**findById(id)**
```typescript
// Finds user by ID with role relation included
const user = await userRepo.findById("1");
```

**findByUsername(username)**
```typescript
// Finds user by unique username
const user = await userRepo.findByUsername("john_doe");
```

**create(user)**
```typescript
// Creates new user with role assignment
const newUser = await userRepo.create({
  name: "John Doe",
  username: "john_doe",
  password: "hashed_password",
  role: { id: "1" },
  isActive: true,
  // ... other fields
});
```

**update(id, user)**
```typescript
// Partial update - only specified fields are updated
const updated = await userRepo.update("1", {
  name: "John Smith",
  isActive: false
});
```

**delete(id)**
```typescript
// Permanently deletes user
await userRepo.delete("1");
```

### Database-Domain Mapping

| Database Field | Domain Field | Notes |
|---------------|--------------|-------|
| id (number) | id (string) | Converted for domain consistency |
| username | username | Direct mapping |
| name | name | Nullable, defaults to empty string |
| password | password | Hashed password |
| role_id | role.id | Joined relation |
| is_active | isActive | Snake to camel case |
| createdAt | createdAt | Direct mapping |
| updatedAt | updatedAt | Direct mapping |

## Usage Example

```typescript
import UserRepository from './src/adapters/postgres/repositories/UserRepository';

const userRepo = new UserRepository();

// Find by ID
const user = await userRepo.findById("123");

// Find by username
const user = await userRepo.findByUsername("admin");

// Create new user
const newUser = await userRepo.create({
  id: "0", // Will be auto-generated
  name: "Jane Doe",
  username: "jane_doe",
  password: await bcrypt.hash("password123", 10),
  role: { id: "3" }, // MANAGER role
  isActive: true,
  lastestLogin: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Update user
const updated = await userRepo.update("123", {
  name: "Jane Smith",
  isActive: false,
});

// Delete user
await userRepo.delete("123");
```

## Architecture

```
┌─────────────────────────────────────┐
│   IUserRepository (Interface)       │
│   src/core/repositories/user.ts     │
└─────────────────┬───────────────────┘
                  │ implements
                  │
┌─────────────────▼───────────────────┐
│   UserRepository (Concrete)         │
│   src/adapters/postgres/            │
│   repositories/UserRepository.ts    │
│                                     │
│   - Extends Repository<TUser>      │
│   - Implements IUserRepository     │
│   - Uses PrismaClient              │
│   - Maps DB ↔ Domain               │
└─────────────────────────────────────┘
```

## Status
✅ All interface methods implemented
✅ Zero TypeScript errors
✅ Proper entity mapping
✅ Type-safe database operations
✅ Follows hexagonal architecture pattern
