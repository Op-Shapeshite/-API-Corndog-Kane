import z from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nama wajib diisi'),
    address: z.string().min(1, 'Alamat wajib diisi'),
    phone: z.string().min(1, 'Telepon wajib diisi'),
    is_active: z.boolean().optional(),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nama wajib diisi').optional(),
    address: z.string().min(1, 'Alamat wajib diisi').optional(),
    phone: z.string().min(1, 'Telepon wajib diisi').optional(),
    is_active: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID supplier tidak valid'),
  }),
});

export const deleteSupplierSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID supplier tidak valid'),
  }),
});