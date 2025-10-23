import { ErrorHandler } from "./ErrorHandler";
import { PrismaErrorHandler } from "./PrismaErrorHandler";
import { ValidationErrorHandler } from "./ValidationErrorHandler";
import { ApplicationErrorHandler } from "./ApplicationErrorHandler";
import { GenericErrorHandler } from "./GenericErrorHandler";

/**
 * Builds and returns the error handler chain
 * Order matters: specific handlers first, generic last
 */
export class ErrorHandlerChain {
  private static chain: ErrorHandler;

  /**
   * Build the error handler chain (singleton)
   */
  static build(): ErrorHandler {
    if (!this.chain) {
      const prismaHandler = new PrismaErrorHandler();
      const validationHandler = new ValidationErrorHandler();
      const applicationHandler = new ApplicationErrorHandler();
      const genericHandler = new GenericErrorHandler();

      // Chain them together
      prismaHandler
        .setNext(validationHandler)
        .setNext(applicationHandler)
        .setNext(genericHandler);

      this.chain = prismaHandler;
    }

    return this.chain;
  }

  /**
   * Reset the chain (useful for testing)
   */
  static reset(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).chain = undefined;
  }
}
