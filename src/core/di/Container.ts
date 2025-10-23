/**
 * Dependency Injection Container
 * Implements Inversion of Control (IoC) pattern
 * Benefits: Loose coupling, easier testing, centralized dependency management
 */

type Constructor<T = unknown> = new (...args: unknown[]) => T;
type Factory<T = unknown> = () => T;
type Binding<T = unknown> = Constructor<T> | Factory<T>;

export class Container {
  private static bindings = new Map<string, Binding>();
  private static singletons = new Map<string, unknown>();

  /**
   * Bind a constructor or factory function to a key
   */
  static bind<T>(key: string, binding: Constructor<T> | Factory<T>): void {
    this.bindings.set(key, binding);
  }

  /**
   * Bind a singleton instance (creates instance on first resolve)
   */
  static singleton<T>(key: string, binding: Constructor<T> | Factory<T>): void {
    this.bind(key, binding);
    // Mark as singleton by storing placeholder
    if (!this.singletons.has(key)) {
      this.singletons.set(key, Symbol('pending'));
    }
  }

  /**
   * Resolve a dependency by key
   */
  static resolve<T>(key: string): T {
    // Check if it's a singleton and already created
    if (this.singletons.has(key)) {
      const instance = this.singletons.get(key);
      if (instance !== Symbol('pending')) {
        return instance as T;
      }
    }

    // Get the binding
    const binding = this.bindings.get(key);
    if (!binding) {
      throw new Error(`No binding found for key: ${key}`);
    }

    // Create instance
    let instance: T;
    if (this.isConstructor(binding)) {
      instance = new binding() as T;
    } else {
      instance = binding() as T;
    }

    // Store singleton
    if (this.singletons.has(key)) {
      this.singletons.set(key, instance);
    }

    return instance;
  }

  /**
   * Check if a binding exists
   */
  static has(key: string): boolean {
    return this.bindings.has(key);
  }

  /**
   * Clear all bindings (useful for testing)
   */
  static clear(): void {
    this.bindings.clear();
    this.singletons.clear();
  }

  /**
   * Set a mock instance directly (useful for testing)
   */
  static mock<T>(key: string, instance: T): void {
    this.singletons.set(key, instance);
    this.bindings.set(key, () => instance);
  }

  /**
   * Helper to check if binding is a constructor
   */
  private static isConstructor(binding: Binding): binding is Constructor {
    return binding.toString().startsWith('class');
  }
}
