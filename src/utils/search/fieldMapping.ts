/**
 * Field mapping configuration for search functionality
 * Maps response field names to database field names for search operations
 */

// Base interface for field mapping
export interface FieldMapping {
  [responseField: string]: string | string[]; // Response field to database field(s) mapping
}

// Common field mappings used across multiple entities
export const CommonFieldMappings = {
  id: 'id',
  name: 'name', 
  description: 'description',
  is_active: 'isActive',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
} as const;

// Specific field mappings for each entity
export const EntityFieldMappings = {
	role: {
		...CommonFieldMappings,
		// No additional fields for roles beyond common ones
	} satisfies FieldMapping,

	permission: {
		...CommonFieldMappings,
		code: "code",
		module: "module",
	} satisfies FieldMapping,

	employee: {
		...CommonFieldMappings,
		nik: "nik",
		name: "name",
		phone: "phone",
		address: "address",
		province_id: "provinceId",
		city_id: "cityId",
		district_id: "districtId",
		subdistrict_id: "subdistrictId",
		merital_status: "meritalStatus",
		religion: "religion",
		birth_date: "birthDate",
		birth_place: "birthPlace",
		blood_type: "bloodType",
		rt: "rt",
		rw: "rw",
		work_type: "workType",
		position: "position",
		notes: "notes",
		image_path: "imagePath",
		gender: "gender",
		hire_date: "hireDate",
	} satisfies FieldMapping,

	outlet: {
		...CommonFieldMappings,
		code: "code",
		location: "location",
		pic_name: "pic_name", // Special handling needed - computed field
		incomeTarget: "incomeTarget",
	} satisfies FieldMapping,

	account: {
		...CommonFieldMappings,
		number: "number",
		balance: "balance",
		transaction_count: "transaction_count", // Special handling needed - computed field
		account_category: ["accountCategory", "name"], // Nested field search
		account_type: ["accountType", "name"], // Nested field search
	} satisfies FieldMapping,

	account_category: {
		...CommonFieldMappings,
		// Uses common fields only
	} satisfies FieldMapping,

	account_type: {
		...CommonFieldMappings,
		// Uses common fields only
	} satisfies FieldMapping,

	product: {
		...CommonFieldMappings,
		image_path: "imagePath",
		hpp: "hpp",
		price: "price",
		name: ["product_master", "name"],
		stock: "stock", // Special handling needed - computed field
		category: ["category", "name"], // Nested field search
	} satisfies FieldMapping,

	material: {
		...CommonFieldMappings,
		unit: "unit",
		stock: "stock", // Special handling needed - computed field
	} satisfies FieldMapping,

	material_inventory: {
		id: "id",
		material_id: "materialId",
		date: "date",
		name: "material.name", // Maps to material relation name field
		first_stock_count: "firstStockCount", // This is computed, not directly searchable
		stock_in_count: "stockInCount", // This is computed, not directly searchable
		stock_out_count: "stockOutCount", // This is computed, not directly searchable
		current_stock: "currentStock", // This is computed, not directly searchable
		unit_quantity: "unitQuantity", // This is computed, not directly searchable
		updated_at: "updatedAt",
		out_times: "outTimes", // This is computed, not directly searchable
		in_times: "inTimes", // This is computed, not directly searchable
	} satisfies FieldMapping,

	material_buy: {
		id: "id",
		date: "receivedAt",
		suplier_name: ["suplier", "name"], // Nested field search
		suplier_id: "suplierId",
		material_id: "materialId",
		material_name: ["material", "name"], // Nested field search
		quantity: "quantity",
		unit_quantity: "quantityUnit",
		price: "price",
		created_at: "createdAt",
		updated_at: "updatedAt",
	} satisfies FieldMapping,

	transaction: {
		...CommonFieldMappings,
		type: "type",
		amount: "amount",
		reference_id: "referenceId",
		account: ["account", "name"], // Nested field search
	} satisfies FieldMapping,

	inventory: {
		id: "id",
		item_type: "itemType", // Not searchable - computed field
		item_id: "materialId",
		item_name: ["material", "name"], // Nested field search - material name
		quantity: "quantity",
		unit_quantity: "quantityUnit",
		price: "price",
		supplier_id: "suplierId",
		supplier_name: ["suplier", "name"], // Nested field search - note: 'suplier' not 'supplier'
		purchased_at: "receivedAt",
	} satisfies FieldMapping,

	order: {
		id: "id",
		invoice_number: "invoiceNumber", // Fixed: Prisma uses camelCase
		date: "createdAt", // Using createdAt as the date field
		total_amount: "totalAmount",
		outlet_name: ["outlet", "name"], // Nested field search
		outlet_id: "outletId",
		status: "status",
		payment_method: "paymentMethod",
		created_at: "createdAt",
		updated_at: "updatedAt",
	} satisfies FieldMapping,

	master_product: {
		...CommonFieldMappings,
		category_id: "categoryId",
		category_name: ["category", "name"], // Nested field search
	} satisfies FieldMapping,

	quantity_unit: {
		...CommonFieldMappings,
		code: "code",
		category: "category",
	} satisfies FieldMapping,

	supplier: {
		...CommonFieldMappings,
		contact: "contact",
		address: "address",
		email: "email",
		phone: "phone",
	} satisfies FieldMapping,

	product_inventory: {
		id: "id",
		product_id: "product_id",
		date: "date",
		name: ["products", "name"], // ProductStock.products (ProductMaster) -> name
		first_stock_count: "firstStockCount", // This is computed, not directly searchable
		stock_in_count: "stockInCount", // This is computed, not directly searchable
		stock_out_count: "stockOutCount", // This is computed, not directly searchable
		current_stock: "currentStock", // This is computed, not directly searchable
		unit_quantity: "unitQuantity", // This is computed, not directly searchable
		updated_at: "updatedAt",
		out_times: "outTimes", // This is computed, not directly searchable
		in_times: "inTimes", // This is computed, not directly searchable
	} satisfies FieldMapping,

	payroll: {
		employee_id: "employee_id",
		employee_name: "employee_name",
		status: "status",
		source: "source",
	} satisfies FieldMapping,
} as const;

// Type for entity names
export type EntityName = keyof typeof EntityFieldMappings;

/**
 * Maps response field name to database field path for search operations
 * @param entityName - Name of the entity (e.g., 'role', 'employee')
 * @param responseField - Field name from the API response
 * @returns Database field path or null if not searchable
 */
export function mapResponseFieldToDbField(entityName: EntityName, responseField: string): string | null {
  const mapping = EntityFieldMappings[entityName] as FieldMapping;
  const dbField = mapping[responseField];
  
  if (!dbField) {
    return null;
  }

  if (Array.isArray(dbField)) {
    return dbField.join('.');
  }
  
  return dbField;
}

/**
 * Get all searchable fields for an entity
 * @param entityName - Name of the entity
 * @returns Array of searchable response field names
 */
export function getSearchableFields(entityName: EntityName): string[] {
  const mapping = EntityFieldMappings[entityName] as FieldMapping;
  return Object.keys(mapping);
}

/**
 * Validate if a field is searchable for the given entity
 * @param entityName - Name of the entity
 * @param responseField - Field name from the API response
 * @returns True if the field is searchable
 */
export function isSearchableField(entityName: EntityName, responseField: string): boolean {
  return mapResponseFieldToDbField(entityName, responseField) !== null;
}