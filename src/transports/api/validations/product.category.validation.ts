import z from 'zod';

export const createProductCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Nama wajib diisi' }),
    is_active: z.boolean().optional(),
  }),
});

export const updateProductCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Nama wajib diisi' }).optional(),
    is_active: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid({ message: 'ID kategori tidak valid' }),
  }),
});

export const deleteProductCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'ID kategori tidak valid' }),
  }),
});
