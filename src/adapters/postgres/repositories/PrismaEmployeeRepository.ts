import { IEmployeeRepository, Employee } from '../../../core/domain/repositories/IEmployeeRepository';
import { EmployeeId } from '../../../core/domain/value-objects/EmployeeId';
import { OutletId } from '../../../core/domain/value-objects/OutletId';
import { DateTime } from '../../../core/domain/value-objects/DateTime';
import { PrismaClient } from '@prisma/client';

/**
 * Simple Employee Implementation for Domain Repository
 */
class EmployeeImpl implements Employee {
  constructor(
    public id: EmployeeId,
    public name: string,
    public isActive: boolean
  ) {}

  isAssignedToOutlet(outletId: OutletId, date: DateTime): boolean {
    // This would be determined by the query result
    return true; // Simplified for now
  }
}

/**
 * Prisma Employee Repository Adapter
 * Slim repository implementing domain contract - only data access
 */
export class PrismaEmployeeRepository implements IEmployeeRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async findById(id: EmployeeId): Promise<Employee | null> {
    try {
      const prismaEmployee = await this.prisma.employee.findUnique({
        where: { id: id.getValue() },
      });

      if (!prismaEmployee) return null;

      return new EmployeeImpl(
        id,
        prismaEmployee.name,
        prismaEmployee.is_active
      );
    } catch (error) {
      throw new Error(`Failed to find employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findScheduledEmployeeByUserId(userId: number, date: DateTime): Promise<EmployeeId | null> {
    try {
      const startOfDay = date.startOfDay().getValue();
      const endOfDay = date.endOfDay().getValue();

      // Find outlet by user ID, then find assigned employee
      const outlet = await this.prisma.outlet.findFirst({
        where: { user_id: userId },
        include: {
          outlet_employee: {
            where: {
              is_active: true,
              assigned_at: {
                gte: startOfDay,
                lt: endOfDay,
              },
            },
            select: {
              employee_id: true,
            },
            orderBy: {
              assigned_at: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!outlet || outlet.outlet_employee.length === 0) {
        return null;
      }

      return EmployeeId.fromNumber(outlet.outlet_employee[0].employee_id);
    } catch (error) {
      throw new Error(`Failed to find scheduled employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isEmployeeAssignedToOutlet(
    employeeId: EmployeeId,
    outletId: OutletId,
    date: DateTime
  ): Promise<boolean> {
    try {
      const startOfDay = date.startOfDay().getValue();
      const endOfDay = date.endOfDay().getValue();

      const assignment = await this.prisma.outletEmployee.findFirst({
        where: {
          employee_id: employeeId.getValue(),
          outlet_id: outletId.getValue(),
          is_active: true,
          assigned_at: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      return assignment !== null;
    } catch (error) {
      throw new Error(`Failed to check employee assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findEmployeesAssignedToOutlet(outletId: OutletId, date: DateTime): Promise<Employee[]> {
    try {
      const startOfDay = date.startOfDay().getValue();
      const endOfDay = date.endOfDay().getValue();

      const assignments = await this.prisma.outletEmployee.findMany({
        where: {
          outlet_id: outletId.getValue(),
          is_active: true,
          assigned_at: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              is_active: true,
            },
          },
        },
      });

      return assignments.map(assignment => new EmployeeImpl(
        EmployeeId.fromNumber(assignment.employee_id),
        assignment.employee.name,
        assignment.employee.is_active
      ));
    } catch (error) {
      throw new Error(`Failed to find assigned employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}