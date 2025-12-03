# Hexagonal Architecture Migration Guide

## Overview

This guide provides step-by-step instructions to integrate the newly implemented Hexagonal Architecture into the existing OPShapesite API application.

## What Was Implemented

### 🏗️ Architecture Components

1. **Domain Layer** (`src/core/domain/`)
   - Rich domain models with business logic
   - Value Objects: `AttendanceId`, `EmployeeId`, `OutletId`, `Minutes`, `DateTime`, `ImageProof`
   - Aggregate: `Attendance` with business methods
   - Domain Events and Exceptions
   - Repository Contracts (interfaces)

2. **Application Layer** (`src/core/application/`)
   - CQRS Commands and Queries
   - Command/Query Handlers
   - Application Services for orchestration
   - DTOs for result handling

3. **Infrastructure Layer** (`src/adapters/`)
   - Slim Prisma repository adapters
   - Entity mappers between domain and persistence models
   - Dependency Injection Container

4. **Transport Layer** (`src/transports/`)
   - Hexagonal Controller with HTTP concern separation
   - Request/Response mapping
   - Error handling

## Migration Steps

### Step 1: Update Main Application Entry Point

Update your main application file (likely `src/app.ts` or `src/server.ts`):

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { integrateHexagonalArchitecture } from './infrastructure/HexagonalIntegration';

// Your existing app setup
const app = express();
const prisma = new PrismaClient();

// Existing middleware and routes...

// ✨ NEW: Integrate hexagonal architecture
let hexagonalIntegration: any;

async function startServer() {
  try {
    // Initialize hexagonal architecture
    hexagonalIntegration = await integrateHexagonalArchitecture(app, prisma);
    
    console.log('🎉 Hexagonal Architecture integrated successfully!');
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (hexagonalIntegration) {
    await hexagonalIntegration.shutdown();
  }
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
```

### Step 2: Test Integration

After integration, you'll have new API endpoints available at `/api/v2`:

```bash
# Health check
GET /api/v2/health/hexagonal

# Attendance endpoints
POST   /api/v2/attendance/checkin
POST   /api/v2/attendance/checkout
GET    /api/v2/attendance/today/:employee_id
GET    /api/v2/attendance/:id
GET    /api/v2/outlet/:outlet_id/attendances
PATCH  /api/v2/attendance/:id/approve-late
PATCH  /api/v2/attendance/:id/reject-late
```

### Step 3: Test the Hexagonal Endpoints

Create test payloads to verify the integration:

**Check-in Test:**
```json
POST /api/v2/attendance/checkin
{
  "employee_id": 1,
  "outlet_id": 1,
  "image_proof": "base64_image_data_here"
}
```

**Health Check Test:**
```bash
curl http://localhost:3000/api/v2/health/hexagonal
```

Expected response:
```json
{
  "status": "healthy",
  "components": {
    "attendanceRepository": true,
    "employeeRepository": true,
    "scheduleRepository": true,
    "attendanceApplicationService": true,
    "attendanceController": true
  }
}
```

### Step 4: Gradual Migration Strategy

#### Phase 1: Side-by-side Operation
- Keep existing `/api/v1` endpoints unchanged
- Run new hexagonal endpoints at `/api/v2`
- Gradually migrate clients to v2 endpoints

#### Phase 2: Testing & Validation
- Test business logic in domain models
- Validate repository adapters
- Performance testing

#### Phase 3: Legacy Deprecation
- Deprecate old endpoints
- Remove legacy business logic from repositories
- Clean up unused code

## Key Benefits Achieved

### ✅ Clean Architecture
- Business logic centralized in domain layer
- Clear separation of concerns
- Dependency inversion implemented

### ✅ Testability
- Domain models are pure - easy to unit test
- Repository contracts allow mocking
- Application services are isolated

### ✅ Maintainability
- Changes to business rules only affect domain layer
- Database changes isolated in infrastructure
- HTTP concerns separated from business logic

### ✅ Extensibility
- Easy to add new use cases via application services
- Repository pattern allows switching data sources
- Domain events enable integration patterns

## Architecture Comparison

### Before (Anemic Domain Model)
```
Controller → Repository (467 lines with business logic)
     ↓              ↓
  Request       Database
```

### After (Hexagonal Architecture)
```
Controller → Application Service → Domain Model
    ↓              ↓                    ↓
 Request      Orchestration       Business Logic
                  ↓                    ↓
            Repository Contract → Repository Adapter
                                       ↓
                                   Database
```

## Troubleshooting

### Common Issues

1. **TypeScript Compilation Errors**
   - Ensure all path imports are correct
   - Check that Prisma types are available
   - Verify domain value objects are properly exported

2. **DI Container Not Initialized**
   - Make sure `integrateHexagonalArchitecture` is called before using endpoints
   - Check Prisma client is passed correctly

3. **Route Conflicts**
   - Hexagonal routes are under `/api/v2` prefix
   - Legacy routes remain unchanged under existing paths

4. **Database Connection Issues**
   - Ensure Prisma client is connected
   - Check database credentials and connection string

### Debugging Tools

```typescript
// Check DI container health
import { getDIContainer } from './infrastructure/DIContainer';

try {
  const container = getDIContainer();
  console.log('✅ DI Container initialized');
  console.log('📦 Components:', {
    attendanceRepo: !!container.getAttendanceRepository(),
    employeeRepo: !!container.getEmployeeRepository(),
    scheduleRepo: !!container.getScheduleRepository(),
    appService: !!container.getAttendanceApplicationService(),
    controller: !!container.getAttendanceController()
  });
} catch (error) {
  console.error('❌ DI Container not initialized:', error);
}
```

## Next Steps

1. **Add Integration Tests**
   - Test the full request-response cycle
   - Validate business rule enforcement
   - Test error scenarios

2. **Add Unit Tests**
   - Domain model business logic
   - Application service orchestration
   - Repository adapter functionality

3. **Performance Optimization**
   - Add database connection pooling
   - Implement caching where appropriate
   - Monitor query performance

4. **Add Monitoring**
   - Business metrics collection
   - Error tracking and alerting
   - Performance monitoring

## Conclusion

The hexagonal architecture implementation provides a solid foundation for:
- ✅ Clean, maintainable code
- ✅ Testable business logic
- ✅ Flexible infrastructure
- ✅ Clear separation of concerns

The side-by-side approach allows for gradual migration while maintaining existing functionality.