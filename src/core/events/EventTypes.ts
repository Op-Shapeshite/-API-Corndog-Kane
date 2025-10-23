/**
 * Event type definitions
 */

import { TUser } from "../entities/user/user";
import { TOutlet } from "../entities/outlet/outlet";
import { TEmployee } from "../entities/employee/employee";
import { TOutletAssignment } from "../entities/outlet/assignment";

export interface UserCreatedEvent {
  user: TUser;
  timestamp: Date;
}

export interface UserUpdatedEvent {
  userId: number;
  changes: Partial<TUser>;
  timestamp: Date;
}

export interface UserDeletedEvent {
  userId: number;
  timestamp: Date;
}

export interface OutletCreatedEvent {
  outlet: TOutlet;
  timestamp: Date;
}

export interface OutletUpdatedEvent {
  outletId: number;
  changes: Partial<TOutlet>;
  timestamp: Date;
}

export interface EmployeeCreatedEvent {
  employee: TEmployee;
  timestamp: Date;
}

export interface EmployeeAssignedEvent {
  assignment: TOutletAssignment;
  outletId: number;
  employeeId: number;
  timestamp: Date;
}

export interface LoginEvent {
  userId: number;
  username: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

/**
 * Event names as constants
 */
export const Events = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  OUTLET_CREATED: 'outlet.created',
  OUTLET_UPDATED: 'outlet.updated',
  EMPLOYEE_CREATED: 'employee.created',
  EMPLOYEE_ASSIGNED: 'employee.assigned',
  USER_LOGIN: 'user.login',
} as const;
