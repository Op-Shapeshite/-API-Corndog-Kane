import { BaseSpecification } from "./Specification";
import { TEmployee } from "../entities/employee/employee";

/**
 * Specification for active employees
 */
export class ActiveEmployeeSpec extends BaseSpecification<TEmployee> {
  toQuery(): Record<string, unknown> {
    return {
      is_active: true
    };
  }
}

/**
 * Specification for employees by outlet
 */
export class EmployeeByOutletSpec extends BaseSpecification<TEmployee> {
  constructor(private outletId: number) {
    super();
  }

  toQuery(): Record<string, unknown> {
    return {
      outlet_employee: {
        some: {
          outlet_id: this.outletId,
          is_active: true
        }
      }
    };
  }
}

/**
 * Specification for employees hired after a date
 */
export class EmployeeHiredAfterSpec extends BaseSpecification<TEmployee> {
  constructor(private date: Date) {
    super();
  }

  toQuery(): Record<string, unknown> {
    return {
      hire_date: {
        gte: this.date
      }
    };
  }
}

/**
 * Specification for employees by department
 */
export class EmployeeByDepartmentSpec extends BaseSpecification<TEmployee> {
  constructor(private department: string) {
    super();
  }

  toQuery(): Record<string, unknown> {
    return {
      department: this.department
    };
  }
}

/**
 * Specification for employees by name (partial match)
 */
export class EmployeeByNameSpec extends BaseSpecification<TEmployee> {
  constructor(private name: string) {
    super();
  }

  toQuery(): Record<string, unknown> {
    return {
      name: {
        contains: this.name,
        mode: 'insensitive'
      }
    };
  }
}
