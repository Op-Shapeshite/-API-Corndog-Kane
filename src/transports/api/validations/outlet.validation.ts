import z from "zod";

// Enum for days validation
const DayEnum = z.enum([
	"MONDAY",
	"TUESDAY",
	"WEDNESDAY",
	"THURSDAY",
	"FRIDAY",
	"SATURDAY",
	"SUNDAY",
]);

// Setting item schema for array
const settingItemSchema = z.object({
	checkin_time: z
		.string()
		.regex(/^\d{2}:\d{2}:\d{2}$/, {
			message: "Waktu check-in harus dalam format HH:MM:SS",
		}),
	checkout_time: z
		.string()
		.regex(/^\d{2}:\d{2}:\d{2}$/, {
			message: "Waktu check-out harus dalam format HH:MM:SS",
		}),
	salary: z.number().int().positive({
		message: "Gaji harus berupa bilangan bulat positif",
	}),
	days: z
		.array(DayEnum)
		.min(1, { message: "Setidaknya satu hari harus ditentukan" }),
});

export const createOutletSchema = z.object({
	body: z.object({
		name: z
			.string()
			.min(3, { message: "Nama harus minimal 3 karakter" })
			.max(50, { message: "Nama harus maksimal 50 karakter" }),
		location: z
			.string()
			.max(100, {
				message: "Lokasi harus maksimal 100 karakter",
			}),
		code: z
			.string()
			.max(50, {
				message: "Kode harus maksimal 50 karakter",
			}),

		description: z
			.string()
			.max(255, {
				message: "Deskripsi harus maksimal 255 karakter",
			})
			.optional(),
		is_active: z.boolean(),
		income_target: z.number().int().nonnegative({
			message: "Target pendapatan harus berupa bilangan non-negatif",
		}),
		setting: z
			.array(settingItemSchema)
			.min(1, { message: "Setidaknya satu pengaturan harus disediakan" }),
		user_id: z
			.number()
			.int({ message: "ID pengguna harus berupa bilangan bulat" })
			.positive({ message: "ID pengguna harus positif" })
			.optional(),
		user: z
			.object({
				name: z
					.string()
					.min(3, {
						message: "Nama pengguna harus minimal 3 karakter",
					})
					.max(100, {
						message: "Nama pengguna harus maksimal 100 karakter",
					}),
				username: z
					.string()
					.min(3, {
						message: "Username harus minimal 3 karakter",
					})
					.max(50, {
						message: "Username harus maksimal 50 karakter",
					})
					.regex(/^[a-zA-Z0-9_-]+$/, {
						message: "Username hanya boleh mengandung huruf, angka, underscore, dan strip",
					}),
				password: z
					.string()
					.min(8, {
						message: "Password harus minimal 8 karakter",
					})
					.max(100, {
						message: "Password harus maksimal 100 karakter",
					}),
				role_id: z
					.number()
					.int({ message: "ID role harus berupa bilangan bulat" })
					.positive({ message: "Role ID must be positive" }),
				is_active: z.boolean().default(true),
			})
			.optional(),
	}),
});

// Setting item schema for update (with optional id)
const settingItemUpdateSchema = settingItemSchema.extend({
	id: z.number().int().positive().optional(),
});

export const updateOutletSchema = z.object({
	body: z.object({
		name: z
			.string()
			.min(3, { message: "Name must be at least 3 characters long" })
			.max(50, { message: "Name must be at most 50 characters long" })
			.optional(),
		location: z
			.string()
			.max(100, { message: "Location must be at most 100 characters long" })
			.optional(),
		code: z
			.string()
			.max(50, { message: "Code must be at most 50 characters long" })
			.optional(),
	
		description: z
			.string()
			.max(255, { message: "Description must be at most 255 characters long" })
			.optional(),
		is_active: z.boolean().optional(),
		income_target: z
			.number()
			.int()
			.nonnegative({
				message: "Income target must be a non-negative integer",
			})
			.optional(),
		setting: z.array(settingItemUpdateSchema).optional(),
	}),
});

export const deleteOutletSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, { message: 'ID must be a number' })
  })
});

export const getOutletByIdSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, { message: 'ID must be a number' })
  })
});