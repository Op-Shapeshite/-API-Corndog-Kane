import z from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    master_product_id: z.string()
      .min(1, 'Master Product ID is required')
      .transform((val) => {
        const num = Number(val);
        if (isNaN(num) || num < 1) {
          throw new Error('Invalid Master Product ID');
        }
        return num;
      }),
    price: z.string()
      .min(1, 'Price is required')
      .transform((val) => {
        const num = Number(val);
        if (isNaN(num) || num < 0) {
          throw new Error('Price must be a positive number');
        }
        return num;
      }),
    hpp: z.string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const num = Number(val);
        if (isNaN(num) || num < 0) {
          throw new Error('HPP must be a positive number');
        }
        return num;
      }),
    
    description: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, { message: 'ID must be a valid number' })
      .transform(Number),
  }),
  body: z.object({
    master_product_id: z.union([
      z.number().min(1, 'Invalid Master Product ID'),
      z.string().transform((val) => {
        const num = Number(val);
        if (isNaN(num) || num < 1) {
          throw new Error('Invalid Master Product ID');
        }
        return num;
      })
    ]).optional(),
    description: z.string().optional(),
    price: z.union([
      z.number().min(0, 'Price must be a positive number'),
      z.string().transform((val) => {
        const num = Number(val);
        if (isNaN(num) || num < 0) {
          throw new Error('Price must be a positive number');
        }
        return num;
      })
    ]).optional(),
    hpp: z.union([
      z.number().min(0, 'HPP must be a positive number'),
      z.string().transform((val) => {
        const num = Number(val);
        if (isNaN(num) || num < 0) {
          throw new Error('HPP must be a positive number');
        }
        return num;
      })
    ]).optional(),
    category_id: z.union([
      z.number().min(1, 'Invalid category ID'),
      z.string().transform((val) => {
        const num = Number(val);
        if (isNaN(num) || num < 1) {
          throw new Error('Invalid category ID');
        }
        return num;
      })
    ]).optional(),
  }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, { message: 'ID must be a valid number' })
      .transform(Number),
  }),
});

export const productStockInSchema = z.object({
  body: z.object({
    product_id: z.number().int().positive('Product ID must be a positive integer'),
    quantity: z.number().positive('Quantity must be a positive number'),
    unit_quantity: z.string().min(1, 'Unit quantity is required'),
  }),
});