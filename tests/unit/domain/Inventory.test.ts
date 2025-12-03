import { Inventory, StockInRecord } from '../../../src/core/domain/aggregates/Inventory';
import { MaterialId, SupplierId, Quantity, UnitQuantity, Price } from '../../../src/core/domain/value-objects/InventoryValueObjects';
import { StockInCreatedEvent, LowStockAlertEvent } from '../../../src/core/domain/events/InventoryEvents';

describe('Inventory Aggregate', () => {
  const createMaterialId = (id: number) => MaterialId.create(id);
  const createSupplierId = (id: number) => SupplierId.create(id);
  const createQuantity = (value: number) => Quantity.create(value);
  const createUnitQuantity = (unit: string) => UnitQuantity.create(unit);
  const createPrice = (value: number) => Price.create(value);

  describe('create', () => {
    it('should create a new inventory aggregate', () => {
      const materialId = createMaterialId(1);
      const inventory = Inventory.create(materialId, 'Test Material');

      expect(inventory.getMaterialId()).toEqual(materialId);
      expect(inventory.getMaterialName()).toBe('Test Material');
      expect(inventory.getCurrentStock().getValue()).toBe(0);
      expect(inventory.getStockIns()).toHaveLength(0);
    });

    it('should set default low stock threshold to 10', () => {
      const materialId = createMaterialId(1);
      const inventory = Inventory.create(materialId, 'Test Material');

      expect(inventory.getLowStockThreshold()).toBe(10);
    });

    it('should allow custom low stock threshold', () => {
      const materialId = createMaterialId(1);
      const inventory = Inventory.create(materialId, 'Test Material', 50);

      expect(inventory.getLowStockThreshold()).toBe(50);
    });
  });

  describe('addStockIn', () => {
    it('should add stock in and update total stock', () => {
      const materialId = createMaterialId(1);
      const inventory = Inventory.create(materialId, 'Test Material');

      inventory.addStockIn(
        1,
        createSupplierId(1),
        createQuantity(100),
        createUnitQuantity('kg'),
        createPrice(50000)
      );

      expect(inventory.getCurrentStock().getValue()).toBe(100);
      expect(inventory.getStockIns()).toHaveLength(1);
    });

    it('should raise StockInCreatedEvent', () => {
      const materialId = createMaterialId(1);
      const inventory = Inventory.create(materialId, 'Test Material');

      inventory.addStockIn(
        1,
        createSupplierId(1),
        createQuantity(100),
        createUnitQuantity('kg'),
        createPrice(50000)
      );

      const events = inventory.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(StockInCreatedEvent);

      const stockInEvent = events[0] as StockInCreatedEvent;
      expect(stockInEvent.materialId).toBe(1);
      expect(stockInEvent.quantity).toBe(100);
    });

    it('should accumulate stock from multiple stock ins', () => {
      const materialId = createMaterialId(1);
      const inventory = Inventory.create(materialId, 'Test Material');

      inventory.addStockIn(1, createSupplierId(1), createQuantity(100), createUnitQuantity('kg'), createPrice(50000));
      inventory.addStockIn(2, createSupplierId(2), createQuantity(50), createUnitQuantity('kg'), createPrice(25000));

      expect(inventory.getCurrentStock().getValue()).toBe(150);
      expect(inventory.getStockIns()).toHaveLength(2);
    });
  });

  describe('processStockOut', () => {
    it('should reduce stock when processing stock out', () => {
      const materialId = createMaterialId(1);
      const inventory = Inventory.create(materialId, 'Test Material');

      inventory.addStockIn(1, createSupplierId(1), createQuantity(100), createUnitQuantity('kg'), createPrice(50000));
      inventory.clearEvents();

      inventory.processStockOut(createQuantity(30));

      expect(inventory.getCurrentStock().getValue()).toBe(70);
    });

    it('should throw error when insufficient stock', () => {
      const materialId = createMaterialId(1);
      const inventory = Inventory.create(materialId, 'Test Material');

      inventory.addStockIn(1, createSupplierId(1), createQuantity(50), createUnitQuantity('kg'), createPrice(50000));

      expect(() => {
        inventory.processStockOut(createQuantity(100));
      }).toThrow('Insufficient stock');
    });

    it('should raise LowStockAlertEvent when stock falls below threshold', () => {
      const materialId = createMaterialId(1);
      const inventory = Inventory.create(materialId, 'Test Material', 20);

      inventory.addStockIn(1, createSupplierId(1), createQuantity(50), createUnitQuantity('kg'), createPrice(50000));
      inventory.clearEvents();

      inventory.processStockOut(createQuantity(35));

      const events = inventory.getUncommittedEvents();
      expect(events.some(e => e instanceof LowStockAlertEvent)).toBe(true);
    });
  });

  describe('isLowStock', () => {
    it('should return true when stock is at or below threshold', () => {
      const materialId = createMaterialId(1);
      const inventory = Inventory.create(materialId, 'Test Material', 10);

      inventory.addStockIn(1, createSupplierId(1), createQuantity(10), createUnitQuantity('kg'), createPrice(50000));

      expect(inventory.isLowStock()).toBe(true);
    });

    it('should return false when stock is above threshold', () => {
      const materialId = createMaterialId(1);
      const inventory = Inventory.create(materialId, 'Test Material', 10);

      inventory.addStockIn(1, createSupplierId(1), createQuantity(100), createUnitQuantity('kg'), createPrice(50000));

      expect(inventory.isLowStock()).toBe(false);
    });
  });

  describe('fromPersistence', () => {
    it('should reconstruct inventory from persistence data', () => {
      const materialId = createMaterialId(1);
      const stockIns: StockInRecord[] = [
        {
          id: 1,
          materialId: createMaterialId(1),
          supplierId: createSupplierId(1),
          quantity: createQuantity(100),
          unitQuantity: createUnitQuantity('kg'),
          price: createPrice(50000),
          createdAt: new Date(),
        },
      ];

      const inventory = Inventory.fromPersistence(
        materialId,
        'Test Material',
        stockIns,
        createQuantity(100),
        createQuantity(20)
      );

      expect(inventory.getMaterialId()).toEqual(materialId);
      expect(inventory.getCurrentStock().getValue()).toBe(80);
      expect(inventory.getStockIns()).toHaveLength(1);
    });
  });
});
