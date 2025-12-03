import { EventEmitter } from 'events';
import { DomainEvent } from '../../core/domain/base/AggregateRoot';
import { IEventBus, EventHandler } from '../../core/domain/ports/secondary/IEventBus';

type WrappedHandler = (event: DomainEvent) => void;

/**
 * Node Event Bus Adapter
 * In-memory event bus implementation using Node.js EventEmitter
 */
export class NodeEventBusAdapter implements IEventBus {
  private eventEmitter: EventEmitter;
  private handlers: Map<string, Map<EventHandler<DomainEvent>, WrappedHandler>>;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.handlers = new Map();
    // Increase max listeners to handle many subscribers
    this.eventEmitter.setMaxListeners(100);
  }

  async publish(event: DomainEvent): Promise<void> {
    const eventName = event.constructor.name;
    this.eventEmitter.emit(eventName, event);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe<T extends DomainEvent>(
    eventType: new (...args: unknown[]) => T,
    handler: EventHandler<T>
  ): void {
    const eventName = eventType.name;
    
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Map());
    }
    
    // Create a wrapped handler that we can track
    const wrappedHandler: WrappedHandler = (event: DomainEvent) => {
      (handler as EventHandler<DomainEvent>)(event).catch((error) => {
        console.error(`Error handling event ${eventName}:`, error);
      });
    };
    
    this.handlers.get(eventName)!.set(handler as EventHandler<DomainEvent>, wrappedHandler);
    this.eventEmitter.on(eventName, wrappedHandler);
  }

  unsubscribe<T extends DomainEvent>(
    eventType: new (...args: unknown[]) => T,
    handler: EventHandler<T>
  ): void {
    const eventName = eventType.name;
    
    const handlersMap = this.handlers.get(eventName);
    if (handlersMap) {
      const wrappedHandler = handlersMap.get(handler as EventHandler<DomainEvent>);
      if (wrappedHandler) {
        this.eventEmitter.removeListener(eventName, wrappedHandler);
        handlersMap.delete(handler as EventHandler<DomainEvent>);
      }
    }
  }

  /**
   * Get count of subscribers for an event type
   */
  getSubscriberCount(eventName: string): number {
    return this.eventEmitter.listenerCount(eventName);
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clearAllHandlers(): void {
    this.eventEmitter.removeAllListeners();
    this.handlers.clear();
  }

  /**
   * Dispose - clear all handlers
   */
  dispose(): void {
    this.clearAllHandlers();
  }
}

/**
 * Async Event Bus Adapter
 * Event bus that handles async events with error handling and retry logic
 */
export class AsyncEventBusAdapter implements IEventBus {
  private nodeEventBus: NodeEventBusAdapter;
  private failedEvents: Array<{ event: DomainEvent; error: Error; attempts: number }>;
  private maxRetries: number;

  constructor(maxRetries = 3) {
    this.nodeEventBus = new NodeEventBusAdapter();
    this.failedEvents = [];
    this.maxRetries = maxRetries;
  }

  async publish(event: DomainEvent): Promise<void> {
    try {
      await this.nodeEventBus.publish(event);
    } catch (error) {
      this.failedEvents.push({
        event,
        error: error instanceof Error ? error : new Error(String(error)),
        attempts: 1,
      });
    }
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe<T extends DomainEvent>(
    eventType: new (...args: unknown[]) => T,
    handler: EventHandler<T>
  ): void {
    this.nodeEventBus.subscribe(eventType, handler);
  }

  unsubscribe<T extends DomainEvent>(
    eventType: new (...args: unknown[]) => T,
    handler: EventHandler<T>
  ): void {
    this.nodeEventBus.unsubscribe(eventType, handler);
  }

  /**
   * Get failed events for monitoring/retry
   */
  getFailedEvents(): Array<{ event: DomainEvent; error: Error; attempts: number }> {
    return [...this.failedEvents];
  }

  /**
   * Retry failed events
   */
  async retryFailedEvents(): Promise<number> {
    let retried = 0;
    const stillFailed: typeof this.failedEvents = [];

    for (const failedEvent of this.failedEvents) {
      if (failedEvent.attempts < this.maxRetries) {
        try {
          await this.nodeEventBus.publish(failedEvent.event);
          retried++;
        } catch {
          stillFailed.push({
            ...failedEvent,
            attempts: failedEvent.attempts + 1,
          });
        }
      } else {
        stillFailed.push(failedEvent);
      }
    }

    this.failedEvents = stillFailed;
    return retried;
  }

  /**
   * Dispose - clear all handlers
   */
  dispose(): void {
    this.nodeEventBus.dispose();
    this.failedEvents = [];
  }
}
