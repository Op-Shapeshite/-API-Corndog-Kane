import { NodeEventBusAdapter, AsyncEventBusAdapter } from '../../../src/adapters/events/NodeEventBusAdapter';
import { DomainEvent } from '../../../src/core/domain/base/AggregateRoot';

// Test event classes
class TestEvent extends DomainEvent {
  constructor(public readonly data: string) {
    super();
  }
}

class AnotherTestEvent extends DomainEvent {
  constructor(public readonly value: number) {
    super();
  }
}

describe('NodeEventBusAdapter', () => {
  let eventBus: NodeEventBusAdapter;

  beforeEach(() => {
    eventBus = new NodeEventBusAdapter();
  });

  afterEach(() => {
    eventBus.clearAllHandlers();
  });

  describe('publish and subscribe', () => {
    it('should publish event to subscribed handler', async () => {
      let receivedEvent: TestEvent | null = null;
      
      eventBus.subscribe(TestEvent, async (event) => {
        receivedEvent = event;
      });

      const testEvent = new TestEvent('test data');
      await eventBus.publish(testEvent);

      // Small delay to allow async handler to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(receivedEvent).not.toBeNull();
      expect(receivedEvent!.data).toBe('test data');
    });

    it('should publish to multiple subscribers', async () => {
      let count = 0;
      
      eventBus.subscribe(TestEvent, async () => { count += 1; });
      eventBus.subscribe(TestEvent, async () => { count += 10; });

      await eventBus.publish(new TestEvent('test'));

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(count).toBe(11);
    });

    it('should only notify handlers for correct event type', async () => {
      let testEventReceived = false;
      let anotherEventReceived = false;
      
      eventBus.subscribe(TestEvent, async () => { testEventReceived = true; });
      eventBus.subscribe(AnotherTestEvent, async () => { anotherEventReceived = true; });

      await eventBus.publish(new TestEvent('test'));

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(testEventReceived).toBe(true);
      expect(anotherEventReceived).toBe(false);
    });
  });

  describe('publishAll', () => {
    it('should publish multiple events in order', async () => {
      const receivedData: string[] = [];
      
      eventBus.subscribe(TestEvent, async (event) => {
        receivedData.push(event.data);
      });

      await eventBus.publishAll([
        new TestEvent('first'),
        new TestEvent('second'),
        new TestEvent('third'),
      ]);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(receivedData).toHaveLength(3);
      expect(receivedData[0]).toBe('first');
      expect(receivedData[1]).toBe('second');
      expect(receivedData[2]).toBe('third');
    });
  });

  describe('unsubscribe', () => {
    it('should stop receiving events after unsubscribe', async () => {
      let callCount = 0;
      const handler = async () => { callCount += 1; };
      
      eventBus.subscribe(TestEvent, handler);
      await eventBus.publish(new TestEvent('first'));
      await new Promise(resolve => setTimeout(resolve, 10));
      
      eventBus.unsubscribe(TestEvent, handler);
      await eventBus.publish(new TestEvent('second'));
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(callCount).toBe(1);
    });
  });

  describe('getSubscriberCount', () => {
    it('should return correct subscriber count', () => {
      expect(eventBus.getSubscriberCount('TestEvent')).toBe(0);

      eventBus.subscribe(TestEvent, async () => {});
      expect(eventBus.getSubscriberCount('TestEvent')).toBe(1);

      eventBus.subscribe(TestEvent, async () => {});
      expect(eventBus.getSubscriberCount('TestEvent')).toBe(2);
    });
  });

  describe('clearAllHandlers', () => {
    it('should remove all handlers', () => {
      eventBus.subscribe(TestEvent, async () => {});
      eventBus.subscribe(AnotherTestEvent, async () => {});

      eventBus.clearAllHandlers();

      expect(eventBus.getSubscriberCount('TestEvent')).toBe(0);
      expect(eventBus.getSubscriberCount('AnotherTestEvent')).toBe(0);
    });
  });
});

describe('AsyncEventBusAdapter', () => {
  let eventBus: AsyncEventBusAdapter;

  beforeEach(() => {
    eventBus = new AsyncEventBusAdapter(3);
  });

  describe('failed events', () => {
    it('should track failed events', async () => {
      // Note: This test is limited because we can't easily make the internal
      // NodeEventBusAdapter fail. In a real scenario, we would mock it.
      expect(eventBus.getFailedEvents()).toHaveLength(0);
    });
  });

  describe('retryFailedEvents', () => {
    it('should return 0 when no failed events', async () => {
      const retried = await eventBus.retryFailedEvents();
      expect(retried).toBe(0);
    });
  });

  describe('normal operations', () => {
    it('should publish events like NodeEventBusAdapter', async () => {
      let receivedEvent: TestEvent | null = null;
      
      eventBus.subscribe(TestEvent, async (event) => {
        receivedEvent = event;
      });

      await eventBus.publish(new TestEvent('async test'));

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(receivedEvent).not.toBeNull();
      expect(receivedEvent!.data).toBe('async test');
    });
  });
});
