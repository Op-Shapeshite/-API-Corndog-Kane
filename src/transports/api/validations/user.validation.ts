import { z } from 'zod';

/**
 * User validation schemas using Zod
 */

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'Nama wajib diisi'
    })
    .min(2, { message: 'Nama minimal 2 karakter' })
    .max(100, { message: 'Nama maksimal 100 karakter' }),
    
    username: z.string({
      message: 'Username wajib diisi'
    })
    .min(3, { message: 'Username minimal 3 karakter' })
    .max(50, { message: 'Username maksimal 50 karakter' })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: 'Username hanya boleh berisi huruf, angka, garis bawah, dan tanda hubung' }),
    
    password: z.string({
      message: 'Password wajib diisi'
    })
    .min(8, { message: 'Password minimal 8 karakter' })
    .max(100, { message: 'Password maksimal 100 karakter' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: 'Password harus mengandung minimal satu huruf besar, satu huruf kecil, dan satu angka' }),
    
    role_id: z.number({
      message: 'ID Role wajib diisi'
    })
    .int({ message: 'ID Role harus berupa angka' })
    .positive({ message: 'ID Role harus positif' }),
    
    is_active: z.boolean({
      message: 'Status aktif wajib diisi'
    })
  })
});

/**
 * Schema for updating a user
 */
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string({
      message: 'User ID is required'
    })
  }),
  body: z.object({
    name: z.string()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(100, { message: 'Name must not exceed 100 characters' })
      .optional(),
    
    username: z.string()
      .min(3, { message: 'Username must be at least 3 characters' })
      .max(50, { message: 'Username must not exceed 50 characters' })
      .regex(/^[a-zA-Z0-9_-]+$/, { message: 'Username can only contain letters, numbers, underscores, and hyphens' })
      .optional(),
    
    password: z.string()
      .min(4, { message: 'Password must be at least 4 characters' })
      .max(16, { message: 'Password must not exceed 16 characters' })
      .optional(),
    
    role_id: z.number()
      .int({ message: 'Role ID must be an integer' })
      .positive({ message: 'Role ID must be positive' })
      .optional(),
    
    is_active: z.boolean()
      .optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  })
});

/**
 * Schema for getting a user by ID
 */
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string({
      message: 'User ID is required'
    })
  })
});

/**
 * Schema for deleting a user
 */
export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string({
      message: 'User ID is required'
    })
  })
});


export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
