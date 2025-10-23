import { TOutletCreate } from "../entities/outlet/outlet";

/**
 * Builder Pattern: OutletBuilder
 * Simplifies creation of complex Outlet objects with settings and users
 */
export class OutletBuilder {
  private outlet: Partial<TOutletCreate> = {
    isActive: true // Default value
  };

  /**
   * Set outlet name (required)
   */
  setName(name: string): this {
    this.outlet.name = name;
    return this;
  }

  /**
   * Set outlet location (required)
   */
  setLocation(location: string): this {
    this.outlet.location = location;
    return this;
  }

  /**
   * Set outlet description
   */
  setDescription(description: string): this {
    this.outlet.description = description;
    return this;
  }

  /**
   * Set PIC (Person In Charge) details
   */
  setPicDetails(picName: string, picPhone: string): this {
    this.outlet.picName = picName;
    this.outlet.picPhone = picPhone;
    return this;
  }

  /**
   * Set active status
   */
  setActive(isActive: boolean): this {
    this.outlet.isActive = isActive;
    return this;
  }

  /**
   * Set existing user ID
   */
  setUserId(userId: number): this {
    this.outlet.userId = userId;
    return this;
  }

  /**
   * Set new user to be created (with all required fields)
   */
  setUser(name: string, username: string, password: string, roleId: number): this {
    this.outlet.user = {
      name,
      username,
      password,
      role_id: roleId,
      is_active: true
    };
    this.outlet.userId = 0; // Indicate new user
    return this;
  }

  /**
   * Set checkin time
   */
  setCheckinTime(checkinTime: string): this {
    this.outlet.checkinTime = checkinTime;
    return this;
  }

  /**
   * Set checkout time
   */
  setCheckoutTime(checkoutTime: string): this {
    this.outlet.checkoutTime = checkoutTime;
    return this;
  }

  /**
   * Set salary
   */
  setSalary(salary: number): this {
    this.outlet.salary = salary;
    return this;
  }

  /**
   * Build the outlet object
   * Validates required fields
   */
  build(): TOutletCreate {
    if (!this.outlet.name) {
      throw new Error('Outlet name is required');
    }

    if (!this.outlet.location) {
      throw new Error('Outlet location is required');
    }

    if (!this.outlet.picName || !this.outlet.picPhone) {
      throw new Error('PIC name and phone are required');
    }

    if (!this.outlet.checkinTime) {
      throw new Error('Checkin time is required');
    }

    if (!this.outlet.checkoutTime) {
      throw new Error('Checkout time is required');
    }

    if (this.outlet.salary === undefined) {
      throw new Error('Salary is required');
    }

    return this.outlet as TOutletCreate;
  }

  /**
   * Reset the builder to start fresh
   */
  reset(): this {
    this.outlet = { isActive: true };
    return this;
  }
}
