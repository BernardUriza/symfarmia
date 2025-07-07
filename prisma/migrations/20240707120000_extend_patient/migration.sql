-- Migration to extend Patient model with additional fields and enums
-- This migration is a best-effort approximation for existing databases.

CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "DocumentType" AS ENUM ('CEDULA', 'PASAPORTE', 'TARJETA_IDENTIDAD');
CREATE TYPE "BloodType" AS ENUM (
  'A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE',
  'AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE','UNKNOWN');

ALTER TABLE "Patient"
  ADD COLUMN "firstName" TEXT,
  ADD COLUMN "lastName" TEXT,
  ADD COLUMN "documentType" "DocumentType" NOT NULL DEFAULT 'CEDULA',
  ADD COLUMN "documentNumber" TEXT UNIQUE,
  ADD COLUMN "address" JSONB,
  ADD COLUMN "bloodType" "BloodType",
  ADD COLUMN "allergies" TEXT[],
  ADD COLUMN "chronicConditions" TEXT[],
  ADD COLUMN "emergencyContactName" TEXT,
  ADD COLUMN "emergencyContactRelationship" TEXT,
  ADD COLUMN "emergencyContactPhone" TEXT,
  ADD COLUMN "avatarUrl" TEXT,
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ALTER COLUMN "gender" TYPE "Gender" USING (UPPER("gender")::"Gender");

