import { z } from 'zod';

export const createInternalPayrollSchema = z.object({
  employee_id: z.number().int().positive('Employee ID must be a positive integer'),
  salary: z.number().positive('Salary must be a positive number').min(1000000, 'Salary minimum is 1,000,000'),
});

export type TCreateInternalPayrollRequest = z.infer<typeof createInternalPayrollSchema>;
