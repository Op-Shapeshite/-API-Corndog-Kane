import { BaseSpecification } from "./Specification";
import { TOutlet } from "../entities/outlet/outlet";

/**
 * Specification for active outlets
 */
export class ActiveOutletSpec extends BaseSpecification<TOutlet> {
  toQuery(): Record<string, unknown> {
    return {
      is_active: true
    };
  }
}

/**
 * Specification for outlets by location (partial match)
 */
export class OutletByLocationSpec extends BaseSpecification<TOutlet> {
  constructor(private location: string) {
    super();
  }

  toQuery(): Record<string, unknown> {
    return {
      location: {
        contains: this.location,
        mode: 'insensitive'
      }
    };
  }
}

/**
 * Specification for outlets by name (partial match)
 */
export class OutletByNameSpec extends BaseSpecification<TOutlet> {
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

/**
 * Specification for outlets with minimum salary
 */
export class OutletWithMinSalarySpec extends BaseSpecification<TOutlet> {
  constructor(private minSalary: string) {
    super();
  }

  toQuery(): Record<string, unknown> {
    return {
      setting: {
        some: {
          salary: {
            gte: this.minSalary
          }
        }
      }
    };
  }
}
