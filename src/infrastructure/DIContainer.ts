import { PrismaClient } from '@prisma/client';

// Attendance Domain
import { AttendanceApplicationService } from '../core/application/AttendanceApplicationService';
import { IAttendanceRepository } from '../core/domain/repositories/IAttendanceRepository';
import { IEmployeeRepository } from '../core/domain/repositories/IEmployeeRepository';
import { IScheduleRepository } from '../core/domain/repositories/IScheduleRepository';
import { PrismaAttendanceRepository } from '../adapters/postgres/repositories/PrismaAttendanceRepository';
import { PrismaEmployeeRepository } from '../adapters/postgres/repositories/PrismaEmployeeRepository';
import { PrismaScheduleRepository } from '../adapters/postgres/repositories/PrismaScheduleRepository';
import { AttendanceController } from '../transports/api/controllers/AttendanceHexagonalController';

// Inventory Domain
import { InventoryApplicationService } from '../core/application/InventoryApplicationService';
import { IMaterialRepository, ISupplierRepository } from '../core/domain/repositories/IInventoryRepository';
import { PrismaMaterialRepository } from '../adapters/postgres/repositories/PrismaMaterialRepository';
import { PrismaSupplierRepository } from '../adapters/postgres/repositories/PrismaSupplierRepository';
import { LegacyInventoryServiceAdapter } from '../adapters/legacy/LegacyInventoryServiceAdapter';

// Event Bus and Unit of Work
import { IEventBus } from '../core/domain/ports/secondary/IEventBus';
import { IUnitOfWork } from '../core/domain/ports/secondary/IUnitOfWork';
import { NodeEventBusAdapter, AsyncEventBusAdapter } from '../adapters/events/NodeEventBusAdapter';
import { PrismaUnitOfWork, PrismaUnitOfWorkManager } from '../adapters/postgres/PrismaUnitOfWork';

/**
 * Dependency Injection Container
 * Wires up all dependencies according to Hexagonal Architecture principles
 */
export class DIContainer {
  private prisma: PrismaClient;
  
  // Infrastructure
  private eventBus!: IEventBus;
  private unitOfWork!: IUnitOfWork;
  private unitOfWorkManager!: PrismaUnitOfWorkManager;
  
  // Attendance Domain
  private attendanceRepository!: IAttendanceRepository;
  private employeeRepository!: IEmployeeRepository;
  private scheduleRepository!: IScheduleRepository;
  private attendanceApplicationService!: AttendanceApplicationService;
  private attendanceController!: AttendanceController;
  
  // Inventory Domain
  private materialRepository!: IMaterialRepository;
  private supplierRepository!: ISupplierRepository;
  private inventoryApplicationService!: InventoryApplicationService;
  private legacyInventoryAdapter!: LegacyInventoryServiceAdapter;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
    this.initializeInfrastructure();
    this.initializeRepositories();
    this.initializeApplicationServices();
    this.initializeAdapters();
    this.initializeControllers();
  }

  /**
   * Initialize Infrastructure Components
   */
  private initializeInfrastructure(): void {
    // Event Bus - using async version for production
    this.eventBus = new AsyncEventBusAdapter();
    
    // Unit of Work
    this.unitOfWorkManager = new PrismaUnitOfWorkManager(this.prisma);
    this.unitOfWork = this.unitOfWorkManager.create();
  }

  /**
   * Initialize Repository Adapters (Infrastructure Layer)
   */
  private initializeRepositories(): void {
    // Attendance repositories
    this.attendanceRepository = new PrismaAttendanceRepository(this.prisma);
    this.employeeRepository = new PrismaEmployeeRepository(this.prisma);
    this.scheduleRepository = new PrismaScheduleRepository(this.prisma);
    
    // Inventory repositories
    this.materialRepository = new PrismaMaterialRepository(this.prisma);
    this.supplierRepository = new PrismaSupplierRepository(this.prisma);
  }

  /**
   * Initialize Application Services (Application Layer)
   */
  private initializeApplicationServices(): void {
    // Attendance application service
    this.attendanceApplicationService = new AttendanceApplicationService(
      this.attendanceRepository,
      this.employeeRepository,
      this.scheduleRepository
    );
    
    // Inventory application service
    this.inventoryApplicationService = new InventoryApplicationService(
      this.materialRepository,
      this.supplierRepository,
      this.eventBus
    );
  }

  /**
   * Initialize Legacy Adapters (Anti-Corruption Layer)
   */
  private initializeAdapters(): void {
    // Legacy inventory adapter for backward compatibility
    this.legacyInventoryAdapter = new LegacyInventoryServiceAdapter(
      this.inventoryApplicationService
    );
  }

  /**
   * Initialize Controllers (Transport Layer)
   */
  private initializeControllers(): void {
    // Attendance controller
    this.attendanceController = new AttendanceController(this.attendanceApplicationService);
  }

  // ============================================================================
  // Infrastructure Getters
  // ============================================================================
  
  getEventBus(): IEventBus {
    return this.eventBus;
  }

  getUnitOfWork(): IUnitOfWork {
    return this.unitOfWork;
  }

  getUnitOfWorkManager(): PrismaUnitOfWorkManager {
    return this.unitOfWorkManager;
  }

  // ============================================================================
  // Attendance Domain Getters
  // ============================================================================

  getAttendanceRepository(): IAttendanceRepository {
    return this.attendanceRepository;
  }

  getEmployeeRepository(): IEmployeeRepository {
    return this.employeeRepository;
  }

  getScheduleRepository(): IScheduleRepository {
    return this.scheduleRepository;
  }

  getAttendanceApplicationService(): AttendanceApplicationService {
    return this.attendanceApplicationService;
  }

  getAttendanceController(): AttendanceController {
    return this.attendanceController;
  }

  // ============================================================================
  // Inventory Domain Getters
  // ============================================================================

  getMaterialRepository(): IMaterialRepository {
    return this.materialRepository;
  }

  getSupplierRepository(): ISupplierRepository {
    return this.supplierRepository;
  }

  getInventoryApplicationService(): InventoryApplicationService {
    return this.inventoryApplicationService;
  }

  getLegacyInventoryAdapter(): LegacyInventoryServiceAdapter {
    return this.legacyInventoryAdapter;
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    // Clear event handlers
    if (this.eventBus instanceof NodeEventBusAdapter) {
      this.eventBus.clearAllHandlers();
    }
    await this.prisma.$disconnect();
  }
}

/**
 * Global DI Container instance
 */
let containerInstance: DIContainer | null = null;

/**
 * Initialize the DI Container with Prisma client
 */
export function initializeDIContainer(prismaClient: PrismaClient): DIContainer {
  if (containerInstance) {
    throw new Error('DI Container already initialized');
  }
  
  containerInstance = new DIContainer(prismaClient);
  return containerInstance;
}

/**
 * Get the DI Container instance
 */
export function getDIContainer(): DIContainer {
  if (!containerInstance) {
    throw new Error('DI Container not initialized. Call initializeDIContainer first.');
  }
  
  return containerInstance;
}

/**
 * Dispose the DI Container
 */
export async function disposeDIContainer(): Promise<void> {
  if (containerInstance) {
    await containerInstance.dispose();
    containerInstance = null;
  }
}