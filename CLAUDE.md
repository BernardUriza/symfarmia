# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Start Next.js development server on http://localhost:3000
- **Permanent dev server**: `npm run permanent:start` - Start stable dev server on http://localhost:3002 (TypeScript errors bypassed)
- **Permanent server status**: `npm run permanent:status` - Check permanent server status
- **Build**: `npm run build` - Generates Prisma client and builds the application
- **Production server**: `npm start` - Start production server
- **Linting**: `npm run lint` - Run Next.js ESLint
- **Deploy**: `npm run deploy` - Generates date and runs git-commit.bat

### Permanent Development Server

For continuous testing and reviews, use the permanent dev server:

```bash
npm run permanent:start   # Start permanent server on port 3002
npm run permanent:status  # Check if server is running
npm run permanent:stop    # Stop permanent server
npm run permanent:restart # Restart permanent server
npm run permanent:logs    # View server logs
```

**Key features:**
- **Stable URL**: Always available at http://localhost:3002
- **TypeScript bypass**: Runs even with TypeScript errors
- **Process management**: Background process with PID tracking
- **Log monitoring**: Dedicated log file at `/tmp/symfarmia-permanent-dev.log`
- **CI/CD integration**: Works alongside the main CI/CD pipeline

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
## Multi-Agent Workflow

This repository uses two cooperating agents: **Claudio** and **Codex**. To keep context and automation in sync, follow these conventions.

### Common Commands
- `npm run dev` – start the development server on http://localhost:3000
- `npm run build` – generate Prisma client and build the project
- `git pull --tags origin dev --rebase` – update the `dev` branch with tags
- `git pull --ff-only` – fast-forward only when merging

### Branching & Rebase Format
1. Create feature branches from `dev`.
2. Rebase onto `dev` before merging.
3. Use `git pull --rebase` to synchronize local work.
4. Merge into `dev` with fast‑forward when possible.

### Project Conventions
- Keep agent notes under `docs/development/dev-notes/claudo.md` and `docs/development/dev-notes/codex.md`.
- Document synchronization errors in `docs/development/chronicles/dev-sync.md`.
- Start each Claude session with `claude --resume` and save context using `Save your current context to a file`.

## Loop Synchronization

After Codex pushes new commits to `dev`, Claudio should run:

```bash
git pull --rebase
npm run build
npm test
curl localhost:3000/api/medical
```
Resolve conflicts if they occur and record the outcome in the dev notes.

## 📚 Documentation

Complete project documentation is now organized in the [`docs/`](./docs/) directory:

- **[📖 Documentation Hub](./docs/README.md)** - Complete documentation index
- **[🏗️ Architecture](./docs/architecture/)** - System design and structure  
- **[🚀 Deployment](./docs/deployment/)** - Production deployment guides
- **[🛠️ Development](./docs/development/)** - Developer guides and fixes
- **[🔌 API](./docs/api/)** - API endpoints and usage
- **[🏛️ Legacy](./docs/legacy/)** - Original system documentation
- **[🔄 Workflows](./docs/workflows/)** - Process and workflow docs
- **[📝 Changelog](./docs/changelog/)** - Version history and updates
