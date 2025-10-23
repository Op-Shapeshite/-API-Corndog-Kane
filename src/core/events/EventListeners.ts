import { EventEmitter } from "./EventEmitter";
import { 
  Events, 
  UserCreatedEvent, 
  OutletCreatedEvent, 
  EmployeeCreatedEvent,
  EmployeeAssignedEvent,
  LoginEvent
} from "./EventTypes";

/**
 * Register all event listeners
 * This should be called once at application startup
 */
export function registerEventListeners(): void {
  // User created listener - for logging/analytics
  EventEmitter.on<UserCreatedEvent>(Events.USER_CREATED, async (event) => {
    console.log(`[EVENT] User created: ${event.user.name} (ID: ${event.user.id})`);
    // Here you could:
    // - Send welcome email
    // - Create audit log
    // - Notify administrators
    // - Update analytics
  });

  // Outlet created listener
  EventEmitter.on<OutletCreatedEvent>(Events.OUTLET_CREATED, async (event) => {
    console.log(`[EVENT] Outlet created: ${event.outlet.name} (ID: ${event.outlet.id})`);
    // Here you could:
    // - Send notification to managers
    // - Initialize outlet settings
    // - Create audit log
  });

  // Employee created listener
  EventEmitter.on<EmployeeCreatedEvent>(Events.EMPLOYEE_CREATED, async (event) => {
    console.log(`[EVENT] Employee created: ${event.employee.name} (ID: ${event.employee.id})`);
    // Here you could:
    // - Send onboarding email
    // - Create employee file
    // - Notify HR department
  });

  // Employee assigned listener
  EventEmitter.on<EmployeeAssignedEvent>(Events.EMPLOYEE_ASSIGNED, async (event) => {
    console.log(`[EVENT] Employee assigned: Employee ${event.employeeId} to Outlet ${event.outletId}`);
    // Here you could:
    // - Send notification to employee
    // - Update scheduling system
    // - Notify outlet manager
  });

  // User login listener - for security tracking
  EventEmitter.on<LoginEvent>(Events.USER_LOGIN, async (event) => {
    console.log(`[EVENT] User login: ${event.username} from ${event.ipAddress}`);
    // Here you could:
    // - Track login history
    // - Check for suspicious activity
    // - Update last login timestamp
    // - Send login notification
  });
}
