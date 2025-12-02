import z from 'zod';

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nama wajib diisi'),
    number: z.string().min(1, 'Nomor wajib diisi'),
    account_category_id: z.number().int().positive('ID kategori akun wajib diisi'),
    account_type_id: z.number().int().positive('ID tipe akun wajib diisi'),
    description: z.string().optional(),
  }),
});

export const updateAccountSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    number: z.string().min(1).optional(),
    account_category_id: z.number().int().positive().optional(),
    account_type_id: z.number().int().positive().optional(),
    description: z.string().optional(),
  }),
});

export const deleteAccountSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
});

export const getAccountByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
});
