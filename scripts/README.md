# 🛠️ Resource Generator CLI

A powerful CLI tool to scaffold new resources, endpoints, and models in your API following best practices and design patterns.

## 📋 Features

The generator automatically creates all necessary layers for a new resource:

- ✅ **Entity Types** - Zod schemas and TypeScript types
- ✅ **Repository** - Database access layer (Prisma)
- ✅ **Service** - Business logic layer
- ✅ **Controller** - API request handlers
- ✅ **Router** - Express routes with proper documentation
- ✅ **Builder** - Builder pattern for complex object creation
- ✅ **Specifications** - Specification pattern for query logic
- ✅ **Validation Strategies** - Reusable validation strategies

All generated code follows the **7 design patterns** implemented in the codebase:
1. **Factory Pattern** - Service and Repository factories
2. **Dependency Injection** - IoC Container
3. **Chain of Responsibility** - Error handling
4. **Strategy Pattern** - Validation strategies
5. **Observer Pattern** - Event emission
6. **Specification Pattern** - Query specifications
7. **Builder Pattern** - Object builders

## 🚀 Quick Start

### Create a Complete Resource

```bash
npm run create:resource -- --name product
```

This creates:
```
src/
  core/
    entities/product/product.ts          # Types and schemas
    services/ProductService.ts            # Business logic
    builders/ProductBuilder.ts            # Builder pattern
    specifications/ProductSpecifications.ts  # Query specs
    strategies/ProductValidationStrategies.ts  # Validation
  adapters/
    postgres/
      repositories/ProductRepository.ts   # Data access
  transports/
    api/
      controllers/ProductController.ts    # Request handlers
      routers/productRouter.ts            # API routes
```

### Create a New Endpoint

```bash
npm run create:endpoint -- --name activate --resource product
```

Generates code template for a new endpoint method and route.

### Generate Prisma Model

```bash
npm run create:model -- --name product --fields "name:String,price:Float,stock:Int?"
```

Generates a Prisma schema model with specified fields.

## 📚 Commands

### `create:resource`

Create a complete resource with all layers.

```bash
npm run create:resource -- --name <resourceName>
```

**Example:**
```bash
npm run create:resource -- --name product
npm run create:resource -- --name category
npm run create:resource -- --name inventory
```

**What it creates:**
- Entity types with Zod validation
- Repository with CRUD operations
- Service with business logic
- Controller with all endpoints (CRUD)
- Router with documented routes
- Builder for object creation
- Specifications for queries
- Validation strategies
- Prisma model template

**After generation, you need to:**
1. Add Prisma model to your schema
2. Run `npx prisma generate`
3. Run `npx prisma db push` or create migration
4. Update RepositoryFactory to include new repository
5. Update ServiceFactory to include new service
6. Update DI bindings in `bindings.ts`
7. Register router in main router index
8. Add events to EventTypes
9. Export from index files

### `create:endpoint`

Add a new endpoint to an existing resource.

```bash
npm run create:endpoint -- --name <endpointName> --resource <resourceName>
```

**Example:**
```bash
npm run create:endpoint -- --name activate --resource product
npm run create:endpoint -- --name archive --resource category
npm run create:endpoint -- --name restock --resource inventory
```

**What it generates:**
- Controller method template
- Router route template
- Proper error handling
- Success response format

### `create:model`

Generate a Prisma model template.

```bash
npm run create:model -- --name <modelName> --fields "<field:Type,field:Type?>"
```

**Example:**
```bash
npm run create:model -- --name product --fields "name:String,price:Float,stock:Int?"
npm run create:model -- --name user --fields "username:String,email:String,age:Int?"
```

**Field types:**
- `String` - Text field
- `Int` - Integer
- `Float` - Decimal number
- `Boolean` - True/false
- `DateTime` - Date and time
- Add `?` for optional fields

### `generate` (help)

Show help information.

```bash
npm run generate
```

## 🎯 Real-World Example

Let's create a complete **Product** resource:

### Step 1: Generate the resource

```bash
npm run create:resource -- --name product
```

### Step 2: Add Prisma model

The generator outputs a Prisma model template. Add it to `prisma/master.prisma`:

```prisma
model product {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  price       Float
  stock       Int       @default(0)
  sku         String    @unique
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
  deleted_at  DateTime?

  @@map("product")
}
```

### Step 3: Generate Prisma client

```bash
npm run prisma:generate
npm run prisma:push
```

### Step 4: Update RepositoryFactory

Add to `src/core/factories/RepositoryFactory.ts`:

```typescript
import ProductRepository from "../../adapters/postgres/repositories/ProductRepository";

// In the class:
static getProductRepository(): ProductRepository {
  if (!this.repositories.has('product')) {
    this.repositories.set('product', new ProductRepository(prisma));
  }
  return this.repositories.get('product') as ProductRepository;
}
```

### Step 5: Update ServiceFactory

Add to `src/core/factories/ServiceFactory.ts`:

```typescript
import ProductService from "../services/ProductService";

// In the class:
static getProductService(): ProductService {
  if (!this.services.has('product')) {
    const productRepository = RepositoryFactory.getProductRepository();
    this.services.set('product', new ProductService(productRepository));
  }
  return this.services.get('product') as ProductService;
}
```

### Step 6: Update DI bindings

Add to `src/core/di/bindings.ts`:

```typescript
import ProductRepository from "../../adapters/postgres/repositories/ProductRepository";
import ProductService from "../services/ProductService";

// In registerDependencies():
container.singleton('ProductRepository', () => RepositoryFactory.getProductRepository());
container.singleton('ProductService', () => ServiceFactory.getProductService());
```

### Step 7: Register router

Add to `src/transports/api/routers/index.ts`:

```typescript
import productRouter from "./productRouter";

// In the routes:
router.use("/api/product", productRouter);
```

### Step 8: Add events

Add to `src/core/events/EventTypes.ts`:

```typescript
export const Events = {
  // ... existing events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
} as const;
```

### Step 9: Export from indexes

Export from `src/core/repositories/index.ts`:
```typescript
export { default as ProductRepository } from "../../adapters/postgres/repositories/ProductRepository";
```

Export from `src/core/services/index.ts`:
```typescript
export { default as ProductService } from "./ProductService";
```

Export from `src/transports/api/controllers/index.ts`:
```typescript
export { default as ProductController } from "./ProductController";
```

### Step 10: Customize the generated code

Now you can customize:
- Add specific fields to entity types
- Add business logic to service methods
- Add custom validation to strategies
- Add query specifications
- Update builder methods
- Add authentication middleware to routes

### Step 11: Test your API

```bash
npm run start:dev
```

Your endpoints are now available:
- `POST /api/product` - Create product
- `GET /api/product` - List products (with pagination)
- `GET /api/product/:id` - Get product by ID
- `PUT /api/product/:id` - Update product
- `DELETE /api/product/:id` - Delete product (soft delete)

## 🎨 Generated Code Features

### Type Safety
- Full TypeScript support
- Zod validation schemas
- Compile-time type checking

### Best Practices
- Clean Architecture / Hexagonal Architecture
- SOLID principles
- Design patterns (all 7 patterns)
- Separation of concerns

### Error Handling
- Chain of Responsibility pattern
- Prisma error handling
- Validation error handling
- Custom application errors

### Events
- Observer pattern for side effects
- Decoupled event handling
- Event listeners registration

### Validation
- Strategy pattern for reusable validation
- Zod schema validation
- Entity existence validation

### Query Building
- Specification pattern
- Composable query logic
- Type-safe Prisma queries

### Object Creation
- Builder pattern
- Fluent API
- Build-time validation

## 🔧 Advanced Usage

### Adding Custom Fields to Entity

Edit the generated `src/core/entities/<resource>/<resource>.ts`:

```typescript
export const ProductCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  sku: z.string().min(1),
  categoryId: z.number().int().positive(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
```

### Adding Business Logic to Service

Edit `src/core/services/<Resource>Service.ts`:

```typescript
async create(data: TProductCreate): Promise<TProductGet> {
  // Validate SKU is unique
  const existing = await this.productRepository.findBySku(data.sku);
  if (existing) {
    throw new Error("SKU already exists");
  }

  // Check stock level
  if (data.stock < 0) {
    throw new Error("Stock cannot be negative");
  }

  return await this.productRepository.create(data);
}
```

### Adding Custom Specifications

Edit `src/core/specifications/<Resource>Specifications.ts`:

```typescript
export class ProductInStockSpecification extends BaseSpecification<Prisma.productWhereInput> {
  isSatisfiedBy(candidate: Prisma.productWhereInput): boolean {
    return (candidate.stock as number) > 0;
  }

  toPrismaQuery(): Prisma.productWhereInput {
    return { stock: { gt: 0 } };
  }
}

export class ProductByPriceRangeSpecification extends BaseSpecification<Prisma.productWhereInput> {
  constructor(private min: number, private max: number) {
    super();
  }

  isSatisfiedBy(candidate: Prisma.productWhereInput): boolean {
    const price = candidate.price as number;
    return price >= this.min && price <= this.max;
  }

  toPrismaQuery(): Prisma.productWhereInput {
    return {
      price: {
        gte: this.min,
        lte: this.max,
      },
    };
  }
}
```

### Using Specifications in Repository

```typescript
async findInStockProducts(): Promise<TProductGet[]> {
  const spec = new ActiveProductSpecification()
    .and(new ProductInStockSpecification());

  return await this.prisma.product.findMany({
    where: spec.toPrismaQuery(),
  }) as TProductGet[];
}
```

### Adding Custom Validation Strategy

```typescript
export class ProductSkuUniqueValidationStrategy implements ValidationStrategy<{ sku: string }> {
  async validate(data: { sku: string }): Promise<ValidationResult> {
    const productService = ServiceFactory.getProductService();
    const existing = await productService.findBySku(data.sku);

    if (existing) {
      return {
        isValid: false,
        errors: [{
          field: "sku",
          type: "duplicate",
          message: "SKU already exists",
        }],
      };
    }

    return { isValid: true, errors: [] };
  }
}
```

## 📝 Tips & Best Practices

1. **Always run `prisma generate` after adding models**
2. **Use meaningful resource names** (singular form: product, user, category)
3. **Customize generated code** - it's a starting point, not final code
4. **Add authentication middleware** to routes that need protection
5. **Update validation schemas** to match your business rules
6. **Add custom repository methods** for complex queries
7. **Emit events** for important business actions
8. **Write tests** for your services and controllers
9. **Document your API** with proper JSDoc comments
10. **Use specifications** for complex, reusable query logic

## 🐛 Troubleshooting

### "Module not found" errors
- Make sure you updated all factory files
- Check that exports are added to index files
- Run `npm run build` to check for TypeScript errors

### Prisma errors
- Ensure model is added to schema
- Run `npx prisma generate`
- Run `npx prisma db push` or create migration

### Router not found
- Check router is registered in main router index
- Verify import paths are correct

### Type errors
- Update entity types to match your Prisma schema
- Ensure all required fields are included
- Check Zod schemas match TypeScript types

## 📖 Further Reading

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Design Patterns](https://refactoring.guru/design-patterns)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev/)

## 🤝 Contributing

Feel free to customize the generator script to match your specific needs!

---

Happy coding! 🚀
