import z from "zod";

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, { message: 'Nama harus minimal 3 karakter' })
      .max(50, { message: 'Nama harus maksimal 50 karakter' }),
    
    description: z.string()
      .max(255, { message: 'Deskripsi harus maksimal 255 karakter' })
      .optional(),
    
    is_active: z.boolean()
  })
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, { message: 'Nama harus minimal 3 karakter' })
      .max(50, { message: 'Nama harus maksimal 50 karakter' })
      .optional(),
    
    description: z.string()
      .max(255, { message: 'Deskripsi harus maksimal 255 karakter' })
      .optional(),
    
    is_active: z.boolean()
      .optional()
  })
});

export const deleteRoleSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, { message: 'ID harus berupa angka' })
  })
});