import { ValidationStrategy, ValidationResult } from "./ValidationStrategy";
import { ServiceFactory } from "../factories/ServiceFactory";

/**
 * Validates that an outlet exists
 */
export class OutletExistsValidationStrategy implements ValidationStrategy<{ outletId: number }> {
  async validate(data: { outletId: number }): Promise<ValidationResult> {
    const outletService = ServiceFactory.getOutletService();
    const outlet = await outletService.findById(data.outletId.toString());

    if (!outlet) {
      return {
        isValid: false,
        errors: [{
          field: 'outletId',
          message: 'Outlet not found',
          type: 'not_found'
        }]
      };
    }

    return {
      isValid: true,
      errors: []
    };
  }
}

/**
 * Validates that an employee exists
 */
export class EmployeeExistsValidationStrategy implements ValidationStrategy<{ employeeId: number }> {
  async validate(data: { employeeId: number }): Promise<ValidationResult> {
    const employeeService = ServiceFactory.getEmployeeService();
    const employee = await employeeService.findById(data.employeeId.toString());

    if (!employee) {
      return {
        isValid: false,
        errors: [{
          field: 'employeeId',
          message: 'Employee not found',
          type: 'not_found'
        }]
      };
    }

    return {
      isValid: true,
      errors: []
    };
  }
}

/**
 * Validates that a user exists
 */
export class UserExistsValidationStrategy implements ValidationStrategy<{ userId: number }> {
  async validate(data: { userId: number }): Promise<ValidationResult> {
    const userService = ServiceFactory.getUserService();
    const user = await userService.findById(data.userId.toString());

    if (!user) {
      return {
        isValid: false,
        errors: [{
          field: 'userId',
          message: 'User not found',
          type: 'not_found'
        }]
      };
    }

    return {
      isValid: true,
      errors: []
    };
  }
}

/**
 * Validates that a role exists
 */
export class RoleExistsValidationStrategy implements ValidationStrategy<{ roleId: number }> {
  async validate(data: { roleId: number }): Promise<ValidationResult> {
    const roleService = ServiceFactory.getRoleService();
    const role = await roleService.findById(data.roleId.toString());

    if (!role) {
      return {
        isValid: false,
        errors: [{
          field: 'roleId',
          message: 'Role not found',
          type: 'not_found'
        }]
      };
    }

    return {
      isValid: true,
      errors: []
    };
  }
}
