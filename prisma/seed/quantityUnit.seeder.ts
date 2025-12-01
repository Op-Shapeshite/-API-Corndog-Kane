import { PrismaClient, UnitCategory } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedQuantityUnits() {
    console.log("📏 Seeding Quantity Units...");

    // ============================================================================
    // WEIGHT UNITS (Base: gram)
    // ============================================================================

    // Kilogram
    await prisma.quantityUnit.upsert({
        where: { code: "kg" },
        update: {},
        create: {
            name: "Kilogram",
            code: "kg",
            symbol: "kg",
            category: UnitCategory.WEIGHT,
            base_unit: "g",
            conversion_factor: 1000, // 1 kg = 1000 g
            is_base: false,
            is_active: true,
        },
    });

    // Gram (BASE UNIT untuk weight)
    await prisma.quantityUnit.upsert({
        where: { code: "g" },
        update: {},
        create: {
            name: "Gram",
            code: "g",
            symbol: "g",
            category: UnitCategory.WEIGHT,
            base_unit: "g",
            conversion_factor: 1, // 1 g = 1 g (base)
            is_base: true,
            is_active: true,
        },
    });

    // Milligram
    await prisma.quantityUnit.upsert({
        where: { code: "mg" },
        update: {},
        create: {
            name: "Milligram",
            code: "mg",
            symbol: "mg",
            category: UnitCategory.WEIGHT,
            base_unit: "g",
            conversion_factor: 0.001, // 1 mg = 0.001 g
            is_base: false,
            is_active: true,
        },
    });

    console.log("  ✅ Created 3 weight units (kg, g, mg)");

    // ============================================================================
    // VOLUME UNITS (Base: milliliter)
    // ============================================================================

    // Kilo Liter
    await prisma.quantityUnit.upsert({
        where: { code: "kL" },
        update: {},
        create: {
            name: "Kilo Liter",
            code: "kL",
            symbol: "kL",
            category: UnitCategory.VOLUME,
            base_unit: "ml",
            conversion_factor: 1000000, // 1 kL = 1,000,000 ml
            is_base: false,
            is_active: true,
        },
    });

    // Liter
    await prisma.quantityUnit.upsert({
        where: { code: "L" },
        update: {},
        create: {
            name: "Liter",
            code: "L",
            symbol: "L",
            category: UnitCategory.VOLUME,
            base_unit: "ml",
            conversion_factor: 1000, // 1 L = 1000 ml
            is_base: false,
            is_active: true,
        },
    });

    // Milli Liter (BASE UNIT untuk volume)
    await prisma.quantityUnit.upsert({
        where: { code: "ml" },
        update: {},
        create: {
            name: "Milli Liter",
            code: "ml",
            symbol: "ml",
            category: UnitCategory.VOLUME,
            base_unit: "ml",
            conversion_factor: 1, // 1 ml = 1 ml (base)
            is_base: true,
            is_active: true,
        },
    });

    console.log("  ✅ Created 3 volume units (kL, L, ml)");

    // ============================================================================
    // COUNT UNITS (No conversion - standalone)
    // ============================================================================

    // Pieces
    await prisma.quantityUnit.upsert({
        where: { code: "pcs" },
        update: {},
        create: {
            name: "Pieces",
            code: "pcs",
            symbol: "pcs",
            category: UnitCategory.COUNT,
            base_unit: null, // COUNT tidak punya base unit
            conversion_factor: 1, // No conversion
            is_base: true, // Dianggap base karena standalone
            is_active: true,
        },
    });

    console.log("  ✅ Created 1 count unit (pcs)");

    console.log("\n✅ Quantity Units seeding completed!");
    console.log("📊 Summary:");
    console.log("   - 3 Weight units (kg, g, mg)");
    console.log("   - 3 Volume units (kL, L, ml)");
    console.log("   - 1 Count unit (pcs)");
    console.log("   - Total: 7 units");
}

// If running directly (not imported)
if (require.main === module) {
    seedQuantityUnits()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
