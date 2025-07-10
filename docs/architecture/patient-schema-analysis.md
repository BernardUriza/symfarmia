# Patient Schema Analysis

The initial `Patient` model in `prisma/schema.prisma` contained only a few demographic fields. To support richer patient records, the schema has been extended with additional demographics, medical data and emergency contact information.

## Existing Fields
- `id`, `name`, `email`, `phone`
- `information` (text)
- `dateOfBirth`, `gender`, `status`
- `createdAt`
- Relation to `MedicalReport`

## Added Fields
- `firstName`, `lastName`
- `documentType`, `documentNumber`
- `address` (JSON)
- `bloodType`, `allergies`, `chronicConditions`
- `emergencyContactName`, `emergencyContactRelationship`, `emergencyContactPhone`
- `avatarUrl`, `isActive`

New enums `Gender`, `DocumentType` and `BloodType` were created to standardise the new fields. A migration script is provided in `prisma/migrations/20240707120000_extend_patient` and a small seed script (`prisma/seed.ts`) demonstrates inserting a patient using the new fields.
