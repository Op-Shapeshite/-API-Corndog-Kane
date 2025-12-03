import { PrismaClient } from '@prisma/client';
import { AttendanceApplicationService } from '../core/application/AttendanceApplicationService';
import { IAttendanceRepository } from '../core/domain/repositories/IAttendanceRepository';
import { IEmployeeRepository } from '../core/domain/repositories/IEmployeeRepository';
import { IScheduleRepository } from '../core/domain/repositories/IScheduleRepository';
import { PrismaAttendanceRepository } from '../adapters/postgres/repositories/PrismaAttendanceRepository';
import { PrismaEmployeeRepository } from '../adapters/postgres/repositories/PrismaEmployeeRepository';
import { PrismaScheduleRepository } from '../adapters/postgres/repositories/PrismaScheduleRepository';
import { AttendanceController } from '../transports/api/controllers/AttendanceHexagonalController';

/**
 * Dependency Injection Container
 * Wires up all dependencies according to Hexagonal Architecture principles
 */
export class DIContainer {
  private prisma: PrismaClient;
  private attendanceRepository!: IAttendanceRepository;
  private employeeRepository!: IEmployeeRepository;
  private scheduleRepository!: IScheduleRepository;
  private attendanceApplicationService!: AttendanceApplicationService;
  private attendanceController!: AttendanceController;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
    this.initializeRepositories();
    this.initializeApplicationServices();
    this.initializeControllers();
  }

  /**
   * Initialize Repository Adapters (Infrastructure Layer)
   */
  private initializeRepositories(): void {
    // Infrastructure adapters implementing domain contracts
    this.attendanceRepository = new PrismaAttendanceRepository(this.prisma);
    this.employeeRepository = new PrismaEmployeeRepository(this.prisma);
    this.scheduleRepository = new PrismaScheduleRepository(this.prisma);
  }

  /**
   * Initialize Application Services (Application Layer)
   */
  private initializeApplicationServices(): void {
    // Application services depend on domain repository contracts
    this.attendanceApplicationService = new AttendanceApplicationService(
      this.attendanceRepository,
      this.employeeRepository,
      this.scheduleRepository
    );
  }

  /**
   * Initialize Controllers (Transport Layer)
   */
  private initializeControllers(): void {
    // Controllers depend on application services
    this.attendanceController = new AttendanceController(this.attendanceApplicationService);
  }

  /**
   * Public getters for accessing configured instances
   */
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

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
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