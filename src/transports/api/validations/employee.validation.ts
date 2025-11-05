import { z } from "zod";
import { MeritalStatus } from "../../../core/entities/employee/employee";

export const createEmployeeSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    nik: z.string().min(16, "NIK must be 16 characters").max(16, "NIK must be 16 characters"),
    address: z.string().min(1, "Address is required"),
    province_id: z.number().int().positive("Province ID must be positive"),
    city_id: z.number().int().positive("City ID must be positive"),
    district_id: z.number().int().positive("District ID must be positive"),
    subdistrict_id: z.number().int().positive("Subdistrict ID must be positive"),
    merital_status: z.nativeEnum(MeritalStatus, { message: "Invalid merital status" }),
    religion: z.string().min(1, "Religion is required"),
    birth_date: z.string().transform((val) => new Date(val)),
    hire_date: z.string().transform((val) => new Date(val)),
    is_active: z.boolean().optional().default(true),
  }),
});

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Employee ID is required"),
  }),
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    phone: z.string().min(1, "Phone is required").optional(),
    nik: z.string().min(16, "NIK must be 16 characters").max(16, "NIK must be 16 characters").optional(),
    address: z.string().min(1, "Address is required").optional(),
    province_id: z.number().int().positive("Province ID must be positive").optional(),
    city_id: z.number().int().positive("City ID must be positive").optional(),
    district_id: z.number().int().positive("District ID must be positive").optional(),
    subdistrict_id: z.number().int().positive("Subdistrict ID must be positive").optional(),
    merital_status: z.nativeEnum(MeritalStatus, { message: "Invalid merital status" }).optional(),
    religion: z.string().min(1, "Religion is required").optional(),
    birth_date: z.string().transform((val) => new Date(val)).optional(),
    hire_date: z.string().transform((val) => new Date(val)).optional(),
    is_active: z.boolean().optional(),
  }),
});

export const getEmployeeByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Employee ID is required"),
  }),
});

export const deleteEmployeeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Employee ID is required"),
  }),
});

export const getEmployeesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
    search_key: z.string().optional(),
    search_value: z.string().optional(),
  }),
});

/**
 * Validation schema for employee check-in
 * Note: File validation is handled by multer middleware
 * This validates that the file was uploaded successfully
 */
export const checkinSchema = z.object({
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string().refine(
      (type) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type),
      { message: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed." }
    ),
    destination: z.string(),
    filename: z.string().min(1, "Check-in image is required"),
    path: z.string().min(1, "Check-in image path is required"),
    size: z.number().max(5 * 1024 * 1024, "File size must not exceed 5MB"),
  }),
});

/**
 * Validation schema for employee checkout
 * Note: File validation is handled by multer middleware
 * This validates that the file was uploaded successfully
 */
export const checkoutSchema = z.object({
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string().refine(
      (type) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type),
      { message: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed." }
    ),
    destination: z.string(),
    filename: z.string().min(1, "Checkout image is required"),
    path: z.string().min(1, "Checkout image path is required"),
    size: z.number().max(5 * 1024 * 1024, "File size must not exceed 5MB"),
  }),
});

/**
 * Validation schema for getting attendances by outlet
 */
export const getAttendancesByOutletSchema = z.object({
  params: z.object({
    outletId: z.string().min(1, "Outlet ID is required"),
  }),
  query: z.object({
    date: z.string().optional().refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      { message: "Date must be in format YYYY-MM-DD" }
    ),
    page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  }),
});
