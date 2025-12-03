/**
 * Unit Normalizer Utility
 * Converts various unit input formats to standard database codes
 */

export interface UnitMapping {
    [key: string]: string;
}

/**
 * Maps user input variations to standard database unit codes
 */
export const UNIT_NORMALIZER: UnitMapping = {
    // Volume units - normalize to database codes
    'ml': 'ml',
    'mL': 'ml', 
    'ML': 'ml',
    'milliliter': 'ml',
    'millilitre': 'ml',
    
    'l': 'L',
    'L': 'L',
    'liter': 'L',
    'litre': 'L',
    'LITER': 'L',
    
    'kl': 'kL',
    'kL': 'kL',
    'KL': 'kL',
    'kiloliter': 'kL',
    'kilolitre': 'kL',
    
    // Weight units - normalize to database codes
    'g': 'g',
    'G': 'g',
    'gram': 'g',
    'GRAM': 'g',
    
    'kg': 'kg',
    'KG': 'kg',
    'kilogram': 'kg',
    'KILOGRAM': 'kg',
    
    'mg': 'mg',
    'MG': 'mg',
    'milligram': 'mg',
    'MILLIGRAM': 'mg',
    
    // Count units - normalize to database codes
    'pcs': 'pcs',
    'PCS': 'pcs',
    'pieces': 'pcs',
    'PIECES': 'pcs',
    'unit': 'pcs',
    'UNIT': 'pcs',
    'buah': 'pcs',
    'BUAH': 'pcs',
    'biji': 'pcs',
    'BIJI': 'pcs',
    'butir': 'pcs',
    'BUTIR': 'pcs',
    
    // Other units (these might need to be added to database if not present)
    'pack': 'pack',
    'PACK': 'pack',
    'box': 'box',
    'BOX': 'box',
    'karton': 'karton',
    'KARTON': 'karton',
    'gallon': 'gallon',
    'GALLON': 'gallon',
    'ton': 'ton',
    'TON': 'ton',
};

/**
 * Normalizes user input unit to standard database code
 * @param userUnit - The unit string from user input
 * @returns Standard database unit code
 * @throws Error if unit is not recognized
 */
export function normalizeUnit(userUnit: string): string {
    const trimmedUnit = userUnit.trim();
    
    if (!trimmedUnit) {
        throw new Error("Unit tidak boleh kosong. Harap masukkan satuan yang valid");
    }
    
    const normalizedUnit = UNIT_NORMALIZER[trimmedUnit];
    
    if (!normalizedUnit) {
        const allowedUnits = Object.keys(UNIT_NORMALIZER).sort();
        throw new Error(
            `Satuan "${userUnit}" tidak dikenali. ` +
            `Satuan yang diizinkan: ${allowedUnits.join(', ')}. ` +
            `Pastikan menggunakan satuan yang sudah terdaftar di sistem`
        );
    }
    
    return normalizedUnit;
}

/**
 * Validates if a unit is supported (without normalization)
 * @param userUnit - The unit string from user input
 * @returns true if unit is supported
 */
export function isUnitSupported(userUnit: string): boolean {
    const trimmedUnit = userUnit.trim();
    return trimmedUnit in UNIT_NORMALIZER;
}

/**
 * Gets all supported unit variations
 * @returns Array of all supported unit strings
 */
export function getSupportedUnits(): string[] {
    return Object.keys(UNIT_NORMALIZER).sort();
}

/**
 * Gets the database unit codes only (unique normalized values)
 * @returns Array of unique database unit codes
 */
export function getDatabaseUnitCodes(): string[] {
    const codes = new Set(Object.values(UNIT_NORMALIZER));
    return Array.from(codes).sort();
}