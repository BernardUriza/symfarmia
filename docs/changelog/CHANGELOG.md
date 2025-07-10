# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Demo mode implementation using Strategy pattern
  - DemoAPIProvider with comprehensive mock data
  - LiveAPIProvider wrapping existing API calls
  - AppModeProvider for mode management
  - Demo mode banner component
  - URL parameter and environment variable detection
- Comprehensive ESLint configuration (.eslintrc.json)
- Exact version locking for all dependencies (removed ^ and ~ ranges)

### Changed
- **BREAKING**: Updated all dependencies to latest stable versions
- **SECURITY**: Fixed high-severity vulnerabilities:
  - `jsonwebtoken` updated from 8.5.1 to 9.0.2 (fixes signature validation bypass)
  - Removed deprecated `faker` package in favor of `@faker-js/faker`
- Updated Next.js configuration for version 14.2.30 compatibility
- Updated TypeScript configuration for enhanced type safety
- Improved package.json with exact version locks for reproducible builds
- Enhanced landing page with demo mode promotion

### Fixed
- Resolved peer dependency conflicts between React, Next.js, and ESLint
- Fixed package-lock.json inconsistencies
- Removed deprecated dependencies causing build warnings
- Fixed invalid version declarations in package.json
- Resolved filesystem issues during npm installation

### Security
- Addressed 2 high-severity vulnerabilities
- Reduced total vulnerabilities from 5 to 3 (all low severity)
- Remaining vulnerabilities are in third-party dependencies (@edgestore) with no available fixes

### Development
- Added comprehensive dependency audit and maintenance workflow
- Implemented automated security vulnerability checking
- Enhanced error boundaries and logging for development
- Added support for both live and demo modes in development

## [0.1.0] - 2024-XX-XX

### Added
- Initial Next.js 14 medical management system
- Patient, medical report, and study management
- Auth0 authentication integration
- Prisma database integration
- EdgeStore file upload capabilities
- PDF generation and manipulation
- Email notification system
- Comprehensive test suite with Jest
- Error boundaries and logging utilities

---

## Migration Notes

### Breaking Changes in Dependencies

1. **jsonwebtoken 8.5.1 → 9.0.2**
   - Updated algorithm validation for enhanced security
   - No breaking changes in API usage for this project

2. **faker → @faker-js/faker**
   - Deprecated `faker` package replaced with official `@faker-js/faker`
   - All mock data generation updated to use new package

3. **Exact Version Locking**
   - All dependencies now use exact versions (no ^ or ~ ranges)
   - Ensures reproducible builds across environments
   - Run `npm ci` instead of `npm install` for production deployments

### Security Improvements

- **High Priority**: Update any custom JWT implementations to use secure algorithms
- **Medium Priority**: Review any file upload functionality using EdgeStore
- **Low Priority**: Monitor @edgestore packages for security updates

### Development Workflow Changes

- ESLint configuration now enforces stricter rules
- Build process includes security audit checks
- Demo mode available for testing without backend dependencies

## Support

For questions about these changes or migration assistance, please refer to:
- [README.md](./README.md) for updated setup instructions
- [Demo Mode Documentation](./README.md#demo-mode) for new demo functionality
- Project documentation in `/docs` (if available)