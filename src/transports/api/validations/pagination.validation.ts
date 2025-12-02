import z from "zod";

export const getPaginationSchema = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => val ?? '1',
      z.string()
        .regex(/^\d+$/, { message: 'Halaman harus berupa angka' })
        .transform(Number)
        .refine(val => val > 0, { message: 'Halaman harus lebih besar dari 0' })
    ),
    
    limit: z.preprocess(
      (val) => val ?? '10',
      z.string()
        .regex(/^\d+$/, { message: 'Limit harus berupa angka' })
        .transform(Number)
        .refine(val => val > 0 && val <= 100, { message: 'Limit harus antara 1 dan 100' })
    ),
    
    search_key: z.string()
      .optional(),
    
    search_value: z.string()
      .optional(),
    
    is_active: z.string()
      .regex(/^(true|false)$/, { message: 'is_active harus berupa true atau false' })
      .transform(val => val === 'true')
      .optional(),
    
    category_id: z.string()
      .regex(/^\d+$/, { message: 'category_id harus berupa angka' })
      .transform(Number)
      .optional(),
    
    outlet_id: z.string()
      .regex(/^\d+$/, { message: 'outlet_id harus berupa angka' })
      .transform(Number)
      .optional()
  })
});