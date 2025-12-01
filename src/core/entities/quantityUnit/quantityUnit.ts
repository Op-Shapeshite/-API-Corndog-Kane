/**
 * Quantity Unit Entity Types
 * Handles unit conversion system for materials and products
 */

export enum UnitCategory {
    WEIGHT = 'WEIGHT',   // Berat: kg, g, mg
    VOLUME = 'VOLUME',   // Volume: L, ml, kL
    COUNT = 'COUNT',     // Hitungan: pcs (tidak bisa dikonversi)
}

/**
 * Base Quantity Unit Entity (without ID)
 */
export type TQuantityUnit = {
    name: string;              // Nama lengkap: "Kilogram", "Gram"
    code: string;              // Code untuk API: "kg", "g", "L"
    symbol: string | null;     // Simbol: "kg", "g", "L", "ml"
    category: UnitCategory;    // Kategori: WEIGHT, VOLUME, COUNT
    baseUnit: string | null;   // Unit dasar: "g" untuk WEIGHT, "ml" untuk VOLUME
    conversionFactor: number;  // Faktor konversi ke base unit
    isBase: boolean;           // Apakah ini unit dasar
    isActive: boolean;         // Status aktif
    createdAt: Date;
    updatedAt: Date;
};

/**
 * Quantity Unit Entity with ID
 */
export type TQuantityUnitWithID = TQuantityUnit & {
    id: number;
};

/**
 * Response format untuk API GET
 */
export type TQuantityUnitGetResponse = {
    id: number;
    name: string;
    code: string;
    symbol: string | null;
    category: string;          // String untuk response
    base_unit: string | null;
    conversion_factor: number;
    is_base: boolean;
    is_active: boolean;
    created_at: string;        // ISO string
    updated_at: string;        // ISO string
};

/**
 * Conversion Request (internal use only, not exposed via API)
 */
export type TQuantityUnitConversion = {
    fromCode: string;
    toCode: string;
    quantity: number;
    result?: number;           // Hasil konversi
};

/**
 * Query parameters untuk list endpoint
 */
export type TQuantityUnitQuery = {
    category?: UnitCategory;
    is_active?: boolean;
};
