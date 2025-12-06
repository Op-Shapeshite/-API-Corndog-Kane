import z from "zod";

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, { message: 'Name must be at least 3 characters long' })
      .max(50, { message: 'Name must be at most 50 characters long' }),
    
    description: z.string()
      .max(255, { message: 'Description must be at most 255 characters long' })
      .optional(),
    
    is_active: z.boolean(),
    
    permissions: z.array(z.string())
      .optional()
  })
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, { message: 'Name must be at least 3 characters long' })
      .max(50, { message: 'Name must be at most 50 characters long' })
      .optional(),
    
    description: z.string()
      .max(255, { message: 'Description must be at most 255 characters long' })
      .optional(),
    
    is_active: z.boolean()
      .optional(),
    
    permissions: z.array(z.string())
      .optional()
  }),
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, { message: 'ID must be a number' })
  })
});

export const deleteRoleSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, { message: 'ID must be a number' })
  })
});