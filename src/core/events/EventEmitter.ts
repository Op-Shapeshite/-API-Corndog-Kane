/**
 * Observer Pattern: Event Emitter
 * Allows loose coupling between components through event-driven architecture
 */

type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

export class EventEmitter {
  private static listeners = new Map<string, EventHandler[]>();

  /**
   * Register an event listener
   */
  static on<T = unknown>(event: string, handler: EventHandler<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler as EventHandler);
  }

  /**
   * Register a one-time event listener
   */
  static once<T = unknown>(event: string, handler: EventHandler<T>): void {
    const wrappedHandler = async (data: T) => {
      await handler(data);
      this.off(event, wrappedHandler as EventHandler);
    };
    this.on(event, wrappedHandler);
  }

  /**
   * Remove an event listener
   */
  static off<T = unknown>(event: string, handler: EventHandler<T>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler as EventHandler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all listeners
   */
  static async emit<T = unknown>(event: string, data: T): Promise<void> {
    const handlers = this.listeners.get(event) || [];
    await Promise.all(handlers.map(handler => handler(data)));
  }

  /**
   * Emit an event synchronously
   */
  static emitSync<T = unknown>(event: string, data: T): void {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  /**
   * Remove all listeners for an event
   */
  static removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  static listenerCount(event: string): number {
    return (this.listeners.get(event) || []).length;
  }
}
