import { z } from 'zod';

export const outletSummarizeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID harus berupa angka"),
  }),
  query: z.object({
    start_date: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Format start_date tidak valid",
    }),
    end_date: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Format end_date tidak valid",
    }),
    status: z.string().optional(),
  }).optional(),
});
