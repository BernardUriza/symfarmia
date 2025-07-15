# Medical Record Schema v2

This document describes the extended Prisma schema used for SYMFARMIA medical records.

## New Models
- **Consultation** – links a patient with diagnoses, treatments and transcriptions.
- **Diagnosis** – medical assessment tied to a consultation.
- **Treatment** – recommended plan linked to a consultation.
- **Transcription** – voice transcription for a consultation.
- **AuditLog** – basic audit trail capturing user actions.

All models include `createdAt`, `updatedAt` and `version` fields to aid auditing and data versioning.

## Updated Models
- **Patient** now tracks `consultations` and a `consentToAI` flag.
- **User** uses the new `UserRole` enum and is related to `AuditLog` entries.

These changes provide a foundation for a compliant, extensible medical record system.
