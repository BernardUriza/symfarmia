# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Start Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Generates Prisma client and builds the application
- **Production server**: `npm start` - Start production server
- **Linting**: `npm run lint` - Run Next.js ESLint
- **Deploy**: `npm run deploy` - Generates date and runs git-commit.bat

## Architecture Overview

This is a Next.js 14 medical management system called "SYMFARMIA" that manages patients, medical reports, and studies.

### Database Architecture (Prisma + PostgreSQL)
- **Patient**: Core entity with personal info, medical reports relationship
- **MedicalReport**: Contains diagnosis, dates, belongs to Patient, has multiple Studies
- **Study**: Individual test/procedure, belongs to MedicalReport and StudyType
- **StudyType**: Categorized types of medical studies
- **Category**: Groups StudyTypes

### Key Technology Stack
- **Frontend**: Next.js 14 App Router, React 18, Tailwind CSS
- **Authentication**: Auth0 integration via @auth0/nextjs-auth0
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: EdgeStore for file uploads
- **PDF**: pdf-lib for PDF manipulation
- **Email**: Nodemailer with custom templates
- **UI Components**: @material-tailwind/react, @tremor/react, @heroicons/react

### Directory Structure
- `app/`: Next.js App Router structure
  - `api/`: REST API routes using dynamic routes `[[...param]]`
  - `components/`: Reusable React components (tables, forms, modals)
  - `controls/`: UI control components (alerts, badges, custom inputs)
  - `entities/`: Business logic classes (Patient, MedicalReport, etc.)
  - `useCases/`: Application business logic (fetch/save operations)
  - `providers/`: React context providers (confirmation, loading, formatting)
- `prisma/`: Database schema and client modules
  - Individual client files: `patientsClient.js`, `medicalReportsClient.js`, etc.
  - `schema.prisma`: Database schema definition

### Authentication & Authorization
- Uses Auth0 for authentication
- UserProvider wraps the entire app
- Auth routes handled at `/api/auth/[auth0]`

### Data Flow Pattern
1. **Entities**: Define data structure (app/entities/)
2. **Prisma Clients**: Database operations (prisma/*Client.js)
3. **Use Cases**: Business logic layer (app/useCases/)
4. **API Routes**: HTTP endpoints (app/api/)
5. **Components**: UI presentation layer

### File Upload & Storage
- EdgeStore integration for file uploads
- PDF merging capabilities via `/api/mergePdfs`
- File saving utilities with file-saver

### Email System
- Nodemailer configuration in `app/config/nodemailer.js`
- Email templates and token-based authentication
- Mailer helper API at `/api/mailerHelper`

## Development Notes

- Database operations use individual Prisma client files rather than a single client
- API routes use Next.js 14 App Router convention with `route.js` files
- Dynamic routes use `[[...param]]` syntax for catch-all routes
- Components follow a mix of class-based entities and functional React components
- The app uses both .js and .ts files (mixed TypeScript/JavaScript codebase)
- All database clients export both named functions and default objects
- Form submissions use React state and custom hooks like `useConfirmation`