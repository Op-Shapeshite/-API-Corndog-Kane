import { TErrorResponse } from "../entities/base/response";

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: TErrorResponse[];
}

/**
 * Strategy Pattern: Base Validation Strategy
 * Defines interface for all validation strategies
 */
export interface ValidationStrategy<T> {
  validate(data: T): Promise<ValidationResult> | ValidationResult;
}

/**
 * Composite validation strategy - combines multiple strategies
 */
export class CompositeValidationStrategy<T> implements ValidationStrategy<T> {
  constructor(private strategies: ValidationStrategy<T>[]) {}

  async validate(data: T): Promise<ValidationResult> {
    const allErrors: TErrorResponse[] = [];

    for (const strategy of this.strategies) {
      const result = await strategy.validate(data);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  addStrategy(strategy: ValidationStrategy<T>): void {
    this.strategies.push(strategy);
  }
}
