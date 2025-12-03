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

  employee: {
    ...CommonFieldMappings,
    nik: 'nik',
    name: 'name',
    phone: 'phone',
    address: 'address',
    province_id: 'provinceId',
    city_id: 'cityId', 
    district_id: 'districtId',
    subdistrict_id: 'subdistrictId',
    merital_status: 'meritalStatus',
    religion: 'religion',
    birth_date: 'birthDate',
    birth_place: 'birthPlace',
    blood_type: 'bloodType',
    rt: 'rt',
    rw: 'rw',
    work_type: 'workType',
    position: 'position',
    notes: 'notes',
    image_path: 'imagePath',
    gender: 'gender',
    hire_date: 'hireDate',
  } satisfies FieldMapping,

  outlet: {
    ...CommonFieldMappings,
    code: 'code',
    location: 'location',
    pic_name: 'pic_name', // Special handling needed - computed field
    incomeTarget: 'incomeTarget',
  } satisfies FieldMapping,

  account: {
    ...CommonFieldMappings,
    number: 'number',
    balance: 'balance',
    transaction_count: 'transaction_count', // Special handling needed - computed field
    account_category: ['accountCategory', 'name'], // Nested field search
    account_type: ['accountType', 'name'], // Nested field search
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
    image_path: 'imagePath',
    hpp: 'hpp',
    price: 'price',
    stock: 'stock', // Special handling needed - computed field
    category: ['category', 'name'], // Nested field search
  } satisfies FieldMapping,

  material: {
    ...CommonFieldMappings,
    unit: 'unit',
    stock: 'stock', // Special handling needed - computed field  
  } satisfies FieldMapping,

  transaction: {
    ...CommonFieldMappings,
    type: 'type',
    amount: 'amount',
    reference_id: 'referenceId',
    account: ['account', 'name'], // Nested field search
  } satisfies FieldMapping,

  quantity_unit: {
    ...CommonFieldMappings,
    code: 'code',
    category: 'category',
  } satisfies FieldMapping,

  supplier: {
    ...CommonFieldMappings,
    contact: 'contact',
    address: 'address',
    email: 'email',
    phone: 'phone',
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
  
  // Handle nested field mappings
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