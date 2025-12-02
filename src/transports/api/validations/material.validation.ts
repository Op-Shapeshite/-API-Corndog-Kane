import z from 'zod';

const materialCreateSchema = z.object({
  name: z.string().min(1, 'name is required'),
  is_active: z.boolean().optional(),
});

export const stockInSchema = z.object({
  body: z.object({
    quantity: z.number().positive('quantity must be positive'),
    suplier_id: z.number().int().positive('suplier_id is required'),
    material_id: z.number().int().positive().optional(),
    material: materialCreateSchema.optional(),
    unit_quantity: z.string().min(1, 'unit_quantity is required'),
    price: z.number().positive('price must be positive'),
  }).refine(
    (data) => data.material_id || data.material,
    { message: 'ID material atau material harus disediakan' }
  ),
});

export const stockOutSchema = z.object({
  body: z.object({
    quantity: z.number().positive('quantity must be positive'),
    material_id: z.number().int().positive('material_id is required'),
    unit_quantity: z.string().min(1, 'unit_quantity is required'),
    description: z.string().optional(),  // For manual material out
  }),
});
