import z from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    account_id: z.number().int().positive('ID akun wajib diisi'),
    amount: z.number().positive('Jumlah harus positif'),
    transaction_type: z.enum(['INCOME', 'EXPENSE']),
    description: z.string().optional(),
    transaction_date: z.string().regex(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/,
      'Tanggal transaksi harus dalam format ISO yang valid'
    ),
    reference_number: z.string().optional(),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
  body: z.object({
    account_id: z.number().int().positive().optional(),
    amount: z.number().positive().optional(),
    transaction_type: z.enum(['INCOME', 'EXPENSE']).optional(),
    description: z.string().optional(),
    transaction_date: z.string().regex(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/
    ).optional(),
    reference_number: z.string().optional(),
  }),
});

export const deleteTransactionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
});

export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
});

export const generateReportSchema = z.object({
  query: z.object({
    type: z.enum(['table', 'pdf', 'xlsx']).optional().default('table'),
    start_date: z.string().regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Tanggal mulai harus dalam format YYYY-MM-DD'
    ),
    end_date: z.string().regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Tanggal akhir harus dalam format YYYY-MM-DD'
    ),
    account_category_ids: z.string().regex(
      /^\d+(,\d+)*$/,
      'ID kategori akun harus berupa angka yang dipisahkan koma'
    ).optional(),
  }),
});
