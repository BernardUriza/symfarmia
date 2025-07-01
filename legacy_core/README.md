# Legacy Core - Original SYMFARMIA Application

This directory contains the original medical management system codebase that was previously known as "Ferboli Móvil" and has been rebranded to SYMFARMIA.

## ⚠️ Legacy Status

This is the **original application logic** that has been moved here for preservation and reference. This code is fully functional but is considered legacy as the project evolves toward a new architecture.

## What's Inside

This directory contains the complete original SYMFARMIA application including:

### 📁 Directory Structure

- **`app/`** - Original Next.js 14 App Router application
  - `api/` - REST API endpoints for all entities
  - `components/` - React UI components (tables, forms, modals)
  - `controls/` - Custom UI controls and widgets
  - `entities/` - Business logic classes (Patient, MedicalReport, etc.)
  - `useCases/` - Application business logic layer
  - `providers/` - React context providers
  - `wrappers/` - React wrapper components

- **`prisma/`** - Database layer
  - Individual client files for each entity
  - Database schema and migrations
  - Seed files for test data

- **`public/`** - Static assets and images

### 🏥 Original Features

The legacy application includes:

- **Patient Management**: Complete patient profiles and medical history
- **Medical Reports**: Diagnosis tracking with dates and status
- **Studies Management**: Categorized medical studies and test results
- **File Upload**: PDF generation and file storage
- **Authentication**: Auth0 integration for secure access
- **Email System**: Automated notifications and token verification

### 🔧 Technical Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth0
- **File Storage**: EdgeStore
- **Email**: Nodemailer

## 🚀 Running the Legacy Application

To run this legacy application:

1. Ensure all environment variables are properly configured
2. The main application routes will need to be redirected to this legacy code
3. All API endpoints are accessible under `/api/` as originally designed
4. The main entry point is through the original `app.js` component

## 🔒 Access Control

- Only authenticated users with proper roles should access this legacy system
- The role system uses 'SYMFARMIA-Admin' for administrative access
- All existing authentication and authorization logic remains unchanged

## 📝 Notes for Developers

- This code uses the original entity-use case-API pattern
- Database operations use individual Prisma client files
- The app uses a mix of .js and .ts files
- All existing functionality is preserved and operational
- Form submissions use React state and custom hooks

## 🎯 Future Considerations

This legacy core will remain available for:
- Reference during new development
- Fallback functionality if needed
- Migration of specific features to new architecture
- Historical codebase preservation

---

*Generated during SYMFARMIA migration - Preserving original medical management system functionality*