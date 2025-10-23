import { BaseSpecification } from "./Specification";
import { TUser } from "../entities/user/user";

/**
 * Specification for active users
 */
export class ActiveUserSpec extends BaseSpecification<TUser> {
  toQuery(): Record<string, unknown> {
    return {
      is_active: true
    };
  }
}

/**
 * Specification for users by role
 */
export class UserByRoleSpec extends BaseSpecification<TUser> {
  constructor(private roleId: number) {
    super();
  }

  toQuery(): Record<string, unknown> {
    return {
      role_id: this.roleId
    };
  }
}

/**
 * Specification for users by username (partial match)
 */
export class UserByUsernameSpec extends BaseSpecification<TUser> {
  constructor(private username: string) {
    super();
  }

  toQuery(): Record<string, unknown> {
    return {
      username: {
        contains: this.username,
        mode: 'insensitive'
      }
    };
  }
}

/**
 * Specification for users by name (partial match)
 */
export class UserByNameSpec extends BaseSpecification<TUser> {
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
