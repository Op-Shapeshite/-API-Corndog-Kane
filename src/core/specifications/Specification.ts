/**
 * Specification Pattern: Base Specification
 * Encapsulates query logic into reusable, composable objects
 */

export interface Specification<T> {
  toQuery(): Record<string, unknown>;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

/**
 * Composite specification for AND operations
 */
export class AndSpecification<T> implements Specification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {}

  toQuery(): Record<string, unknown> {
    return {
      AND: [this.left.toQuery(), this.right.toQuery()]
    };
  }

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

/**
 * Composite specification for OR operations
 */
export class OrSpecification<T> implements Specification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {}

  toQuery(): Record<string, unknown> {
    return {
      OR: [this.left.toQuery(), this.right.toQuery()]
    };
  }

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

/**
 * Composite specification for NOT operations
 */
export class NotSpecification<T> implements Specification<T> {
  constructor(private spec: Specification<T>) {}

  toQuery(): Record<string, unknown> {
    return {
      NOT: this.spec.toQuery()
    };
  }

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return this.spec; // Double negation cancels out
  }
}

/**
 * Base specification class with helper methods
 */
export abstract class BaseSpecification<T> implements Specification<T> {
  abstract toQuery(): Record<string, unknown>;

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}
