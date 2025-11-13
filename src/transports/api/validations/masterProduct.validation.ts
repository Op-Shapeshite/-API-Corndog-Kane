import z from 'zod';

export const getMasterProductByIdSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, { message: 'ID must be a valid number' })
      .transform(Number),
  }),
});

export const upsertProductInventorySchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, { message: 'ID must be a valid number' })
      .transform(Number),
  }),
  body: z.array(
    z.object({
      material_id: z.number().int().positive('Material ID must be a positive integer'),
      quantity: z.number().int().positive('Quantity must be a positive integer'),
    })
  ).min(1, 'At least one inventory item is required'),
});
