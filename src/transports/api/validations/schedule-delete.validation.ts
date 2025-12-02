import { z } from 'zod';

export const deleteScheduleSchema = z.object({
  params: z.object({
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Format tanggal tidak valid",
    }),
    outlet_id: z.string().regex(/^\d+$/, "ID outlet harus berupa angka"),
  }),
});
