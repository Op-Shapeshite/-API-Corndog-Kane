import z from 'zod';

export const productInventoryCreateSchema = z.object({
  body: z.object({
    product_id: z.number().int().positive('Product ID must be a positive integer').optional(),
    product_name: z.string().min(1, 'Product name is required').optional(),
    quantity: z.number().int().nonnegative('Quantity must be a non-negative integer'),
    unit: z.string().min(1, 'Unit is required'),
    category_id: z.number().int().positive('Category ID must be a positive integer'),
    
    materials: z.array(z.object({
      material_id: z.number().int().positive('Material ID must be a positive integer'),
      quantity: z.number().int().nonnegative('Material quantity must be a non-negative integer'),
      unit: z.string().min(1, 'Material unit is required'),
    })),
  }),
});

export const productInventoryUpdateSchema = z.object({
  params: z.object({
    id: z.string().min(1,"id must be required"),
  }),
	body: z.object({
		
		quantity: z
			.number("Quantity must be a integer"),
		unit: z.string().min(1, "Unit is required"),
		
		materials: z.array(
			z.object({
				material_id: z
					.number()
					.int()
					.positive("Material ID must be a positive integer"),
				quantity: z
					.number()
					.int()
					.nonnegative(
						"Material quantity must be a non-negative integer"
					),
				unit: z.string().min(1, "Material unit is required"),
			})
		).optional(),
	}),
});