-- Move suplier_id from materials table to material_ins table
-- Migration created on: December 2, 2025

-- Add suplier_id column to material_ins table
ALTER TABLE "material_ins" ADD COLUMN "suplier_id" INTEGER;

-- Update existing material_ins records with suplier_id from materials table
UPDATE "material_ins" 
SET "suplier_id" = m.suplier_id 
FROM "materials" m 
WHERE "material_ins".material_id = m.id;

-- Make suplier_id NOT NULL after data migration
ALTER TABLE "material_ins" ALTER COLUMN "suplier_id" SET NOT NULL;

-- Add foreign key constraint to material_ins
ALTER TABLE "material_ins" 
ADD CONSTRAINT "material_ins_suplier_id_fkey" 
FOREIGN KEY ("suplier_id") REFERENCES "supliers"("id");

-- Remove foreign key constraint from materials table
ALTER TABLE "materials" DROP CONSTRAINT IF EXISTS "materials_suplier_id_fkey";

-- Remove suplier_id column from materials table
ALTER TABLE "materials" DROP COLUMN "suplier_id";