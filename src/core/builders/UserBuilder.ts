import { TUserCreate } from "../entities/user/user";

/**
 * Builder Pattern: UserBuilder
 * Simplifies creation of User objects with validation
 */
export class UserBuilder {
  private user: Partial<TUserCreate> = {
    isActive: true // Default value
  };

  /**
   * Set user name (required)
   */
  setName(name: string): this {
    this.user.name = name;
    return this;
  }

  /**
   * Set username (required)
   */
  setUsername(username: string): this {
    this.user.username = username;
    return this;
  }

  /**
   * Set password (required)
   */
  setPassword(password: string): this {
    this.user.password = password;
    return this;
  }

  /**
   * Set role ID (required)
   */
  setRoleId(roleId: number): this {
    this.user.role_id = roleId;
    return this;
  }

  /**
   * Set active status
   */
  setActive(isActive: boolean): this {
    this.user.isActive = isActive;
    return this;
  }

  /**
   * Build the user object
   * Validates required fields
   */
  build(): TUserCreate {
    if (!this.user.name) {
      throw new Error('User name is required');
    }

    if (!this.user.username) {
      throw new Error('Username is required');
    }

    if (!this.user.password) {
      throw new Error('Password is required');
    }

    if (!this.user.role_id) {
      throw new Error('Role ID is required');
    }

    return this.user as TUserCreate;
  }

  /**
   * Reset the builder to start fresh
   */
  reset(): this {
    this.user = { isActive: true };
    return this;
  }
}
