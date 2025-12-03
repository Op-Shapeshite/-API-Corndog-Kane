import { DomainEvent } from '../../base/AggregateRoot';

/**
 * Event Bus Port (Secondary Port)
 * Defines the contract for publishing domain events
 * Infrastructure adapters must implement this interface
 */
export interface IEventBus {
  /**
   * Publish a domain event to all subscribed handlers
   */
  publish(event: DomainEvent): Promise<void>;

  /**
   * Publish multiple domain events in order
   */
  publishAll(events: DomainEvent[]): Promise<void>;

  /**
   * Subscribe a handler to a specific event type
   */
  subscribe<T extends DomainEvent>(
    eventType: new (...args: unknown[]) => T,
    handler: EventHandler<T>
  ): void;

  /**
   * Unsubscribe a handler from a specific event type
   */
  unsubscribe<T extends DomainEvent>(
    eventType: new (...args: unknown[]) => T,
    handler: EventHandler<T>
  ): void;

  /**
   * Clear all handlers (for cleanup/testing)
   */
  dispose(): void;
}

/**
 * Event Handler function type
 */
export type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

/**
 * Async Event Handler interface for class-based handlers
 */
export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}
