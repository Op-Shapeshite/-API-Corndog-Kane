import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { initializeDIContainer, getDIContainer } from './DIContainer';

/**
 * Hexagonal Architecture Integration
 * Gradually integrates hexagonal components into existing application
 */
export class HexagonalIntegration {
  private app: Express;
  private prisma: PrismaClient;

  constructor(app: Express, prisma: PrismaClient) {
    this.app = app;
    this.prisma = prisma;
  }

  /**
   * Initialize hexagonal architecture components
   */
  async initialize(): Promise<void> {
    try {
      console.log('🏗️  Initializing Hexagonal Architecture...');
      
      // Initialize DI Container
      initializeDIContainer(this.prisma);
      
      console.log('✅ DI Container initialized');
      
      // Setup new hexagonal routes
      this.setupHexagonalRoutes();
      
      console.log('✅ Hexagonal routes registered');
      console.log('🎉 Hexagonal Architecture integration complete!');
      
    } catch (error) {
      console.error('❌ Failed to initialize Hexagonal Architecture:', error);
      throw error;
    }
  }

  /**
   * Setup hexagonal architecture routes alongside existing routes
   */
  private setupHexagonalRoutes(): void {
    const container = getDIContainer();
    const attendanceController = container.getAttendanceController();
    const inventoryController = container.getInventoryController();

    // New hexagonal routes with /v2 prefix to distinguish from legacy routes
    const hexagonalRouter = require('express').Router();

    // Attendance Hexagonal Endpoints
    hexagonalRouter.post('/attendance/checkin', (req: any, res: any, next: any) => {
      attendanceController.checkin(req, res).catch(next);
    });
    
    hexagonalRouter.post('/attendance/checkout', (req: any, res: any, next: any) => {
      attendanceController.checkout(req, res).catch(next);
    });
    
    hexagonalRouter.get('/attendance/today/:employee_id', (req: any, res: any, next: any) => {
      attendanceController.getTodayAttendance(req, res).catch(next);
    });
    
    hexagonalRouter.get('/attendance/:id', (req: any, res: any, next: any) => {
      attendanceController.getAttendanceDetails(req, res).catch(next);
    });
    
    hexagonalRouter.get('/outlet/:outlet_id/attendances', (req: any, res: any, next: any) => {
      attendanceController.getOutletAttendances(req, res).catch(next);
    });
    
    hexagonalRouter.patch('/attendance/:id/approve-late', (req: any, res: any, next: any) => {
      attendanceController.approveLateArrival(req, res).catch(next);
    });
    
    hexagonalRouter.patch('/attendance/:id/reject-late', (req: any, res: any, next: any) => {
      attendanceController.rejectLateArrival(req, res).catch(next);
    });

    // Inventory Hexagonal Endpoints
    hexagonalRouter.post('/inventory/stock-in', (req: any, res: any, next: any) => {
      inventoryController.stockIn(req, res).catch(next);
    });

    hexagonalRouter.get('/inventory/buy-list', (req: any, res: any, next: any) => {
      inventoryController.getBuyList(req, res).catch(next);
    });

    hexagonalRouter.put('/inventory/stock-in/:id', (req: any, res: any, next: any) => {
      inventoryController.updateStockIn(req, res).catch(next);
    });

    hexagonalRouter.get('/inventory/stock/:materialId', (req: any, res: any, next: any) => {
      inventoryController.getMaterialStock(req, res).catch(next);
    });

    hexagonalRouter.post('/inventory/validate', (req: any, res: any, next: any) => {
      inventoryController.validateStockIn(req, res).catch(next);
    });

    // Mount hexagonal routes under /api/v2
    this.app.use('/api/v2', hexagonalRouter);

    console.log('📋 Hexagonal routes registered:');
    console.log('   POST   /api/v2/attendance/checkin');
    console.log('   POST   /api/v2/attendance/checkout');
    console.log('   GET    /api/v2/attendance/today/:employee_id');
    console.log('   GET    /api/v2/attendance/:id');
    console.log('   GET    /api/v2/outlet/:outlet_id/attendances');
    console.log('   PATCH  /api/v2/attendance/:id/approve-late');
    console.log('   PATCH  /api/v2/attendance/:id/reject-late');
    console.log('   POST   /api/v2/inventory/stock-in');
    console.log('   GET    /api/v2/inventory/buy-list');
    console.log('   PUT    /api/v2/inventory/stock-in/:id');
    console.log('   GET    /api/v2/inventory/stock/:materialId');
    console.log('   POST   /api/v2/inventory/validate');
  }

  /**
   * Health check for hexagonal components
   */
  async healthCheck(): Promise<{ status: string; components: Record<string, boolean> }> {
    try {
      const container = getDIContainer();
      
      // Check if all components are initialized
      const components = {
        // Attendance Domain
        attendanceRepository: !!container.getAttendanceRepository(),
        employeeRepository: !!container.getEmployeeRepository(),
        scheduleRepository: !!container.getScheduleRepository(),
        attendanceApplicationService: !!container.getAttendanceApplicationService(),
        attendanceController: !!container.getAttendanceController(),
        // Inventory Domain
        materialRepository: !!container.getMaterialRepository(),
        supplierRepository: !!container.getSupplierRepository(),
        inventoryApplicationService: !!container.getInventoryApplicationService(),
        inventoryController: !!container.getInventoryController(),
        // Infrastructure
        eventBus: !!container.getEventBus(),
        unitOfWork: !!container.getUnitOfWork(),
      };

      const allHealthy = Object.values(components).every(healthy => healthy);

      return {
        status: allHealthy ? 'healthy' : 'unhealthy',
        components
      };
    } catch (error) {
      return {
        status: 'error',
        components: {}
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Hexagonal Architecture...');
    
    try {
      const { disposeDIContainer } = await import('./DIContainer');
      await disposeDIContainer();
      console.log('✅ Hexagonal Architecture shutdown complete');
    } catch (error) {
      console.error('❌ Error during hexagonal shutdown:', error);
    }
  }
}

/**
 * Helper function to integrate hexagonal architecture into Express app
 */
export async function integrateHexagonalArchitecture(
  app: Express, 
  prisma: PrismaClient
): Promise<HexagonalIntegration> {
  const integration = new HexagonalIntegration(app, prisma);
  await integration.initialize();
  
  // Add health check endpoint
  app.get('/api/v2/health/hexagonal', async (req, res) => {
    try {
      const health = await integration.healthCheck();
      res.json(health);
    } catch (error) {
      res.status(500).json({ 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return integration;
}