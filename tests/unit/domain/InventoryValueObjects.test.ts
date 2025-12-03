import { MaterialId, SupplierId, Quantity, UnitQuantity, Price, StockInItem } from '../../../src/core/domain/value-objects/InventoryValueObjects';

describe('Inventory Value Objects', () => {
  describe('MaterialId', () => {
    it('should create a valid material ID', () => {
      const materialId = MaterialId.create(1);
      expect(materialId.getValue()).toBe(1);
    });

    it('should throw error for non-positive ID', () => {
      expect(() => MaterialId.create(0)).toThrow('Material ID must be a positive number');
      expect(() => MaterialId.create(-1)).toThrow('Material ID must be a positive number');
    });

    it('should compare equality correctly', () => {
      const id1 = MaterialId.create(1);
      const id2 = MaterialId.create(1);
      const id3 = MaterialId.create(2);

      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });
  });

  describe('SupplierId', () => {
    it('should create a valid supplier ID', () => {
      const supplierId = SupplierId.create(1);
      expect(supplierId.getValue()).toBe(1);
    });

    it('should throw error for non-positive ID', () => {
      expect(() => SupplierId.create(0)).toThrow('Supplier ID must be a positive number');
    });
  });

  describe('Quantity', () => {
    it('should create a valid quantity', () => {
      const quantity = Quantity.create(100);
      expect(quantity.getValue()).toBe(100);
    });

    it('should throw error for negative quantity', () => {
      expect(() => Quantity.create(-1)).toThrow('Quantity cannot be negative');
    });

    it('should allow zero quantity', () => {
      const quantity = Quantity.create(0);
      expect(quantity.isZero()).toBe(true);
    });

    it('should add quantities correctly', () => {
      const q1 = Quantity.create(50);
      const q2 = Quantity.create(30);
      const sum = q1.add(q2);

      expect(sum.getValue()).toBe(80);
    });

    it('should subtract quantities correctly', () => {
      const q1 = Quantity.create(50);
      const q2 = Quantity.create(30);
      const diff = q1.subtract(q2);

      expect(diff.getValue()).toBe(20);
    });

    it('should throw error when subtracting would result in negative', () => {
      const q1 = Quantity.create(30);
      const q2 = Quantity.create(50);

      expect(() => q1.subtract(q2)).toThrow('Cannot subtract: result would be negative');
    });

    it('should compare quantities correctly', () => {
      const q1 = Quantity.create(50);
      const q2 = Quantity.create(30);

      expect(q1.isGreaterThan(q2)).toBe(true);
      expect(q2.isLessThan(q1)).toBe(true);
    });
  });

  describe('UnitQuantity', () => {
    it('should create a valid unit quantity', () => {
      const unit = UnitQuantity.create('kg');
      expect(unit.getValue()).toBe('kg');
    });

    it('should normalize unit to lowercase', () => {
      const unit = UnitQuantity.create('KG');
      expect(unit.getValue()).toBe('kg');
    });

    it('should throw error for unsupported unit', () => {
      expect(() => UnitQuantity.create('unsupported')).toThrow('Unsupported unit');
    });

    it('should support standard units', () => {
      const supportedUnits = ['kg', 'gram', 'liter', 'ml', 'pcs', 'pack', 'box', 'dus'];
      
      supportedUnits.forEach(unit => {
        expect(() => UnitQuantity.create(unit)).not.toThrow();
      });
    });

    it('should check if unit is supported', () => {
      expect(UnitQuantity.isSupported('kg')).toBe(true);
      expect(UnitQuantity.isSupported('unsupported')).toBe(false);
    });
  });

  describe('Price', () => {
    it('should create a valid price', () => {
      const price = Price.create(50000);
      expect(price.getValue()).toBe(50000);
    });

    it('should throw error for negative price', () => {
      expect(() => Price.create(-1)).toThrow('Price cannot be negative');
    });

    it('should add prices correctly', () => {
      const p1 = Price.create(50000);
      const p2 = Price.create(30000);
      const sum = p1.add(p2);

      expect(sum.getValue()).toBe(80000);
    });

    it('should multiply price correctly', () => {
      const price = Price.create(10000);
      const multiplied = price.multiply(3);

      expect(multiplied.getValue()).toBe(30000);
    });
  });

  describe('StockInItem', () => {
    it('should create a stock in item with existing material', () => {
      const item = StockInItem.create({
        materialId: 1,
        supplierId: 1,
        quantity: 100,
        unitQuantity: 'kg',
        price: 50000,
      });

      expect(item.getMaterialId()?.getValue()).toBe(1);
      expect(item.getSupplierId().getValue()).toBe(1);
      expect(item.getQuantity().getValue()).toBe(100);
      expect(item.isNewMaterial()).toBe(false);
    });

    it('should create a stock in item with new material', () => {
      const item = StockInItem.create({
        materialName: 'New Material',
        supplierId: 1,
        quantity: 100,
        unitQuantity: 'kg',
        price: 50000,
      });

      expect(item.getMaterialId()).toBeNull();
      expect(item.getMaterialName()).toBe('New Material');
      expect(item.isNewMaterial()).toBe(true);
    });
  });
});
