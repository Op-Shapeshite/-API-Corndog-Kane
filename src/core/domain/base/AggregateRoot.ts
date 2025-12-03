/**
 * Base Domain Event
 */
export abstract class DomainEvent {
  public readonly occurredAt: Date;

  constructor() {
    this.occurredAt = new Date();
  }
}

/**
 * Aggregate Root base class
 * Provides domain event functionality
 */
export abstract class AggregateRoot {
  private events: DomainEvent[] = [];

  protected raiseEvent(event: DomainEvent): void {
    this.events.push(event);
  }

  public getUncommittedEvents(): DomainEvent[] {
    return [...this.events];
  }

  public clearEvents(): void {
    this.events = [];
  }
}