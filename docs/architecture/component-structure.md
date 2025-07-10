# Component Structure Documentation

This document provides an overview of the component structure and organization within SYMFARMIA.

## 📁 Directory Structure

### `/src/` - Source Code Organization

```
src/
├── apps/                    # Modular applications
├── components/              # Reusable UI components
├── domains/                 # Domain-specific modules
├── infrastructure/          # Infrastructure services
└── shared/                  # Shared utilities and types
```

## 🏗️ Applications (`/src/apps/`)

Modular applications organized by feature:
- **Dashboard** - Main dashboard application
- **Landing** - Landing page components
- **Patients** - Patient management
- **Reports** - Medical reports system
- **Transcription** - Voice transcription features

## 🎨 Components (`/src/components/`)

### Landing Page Components
- **Simple Landing** - Minimalist landing page implementation
- **Enhanced Landing** - Feature-rich landing page with animations
- **Component Structure**:
  - `atoms/` - Basic UI elements (buttons, cards, typography)
  - `molecules/` - Compound components (feature cards, stats)
  - `sections/` - Page sections (hero, features, testimonials)

### Medical Components
- **AI Chat** - Medical AI chat interface
- **Analytics Dashboard** - Medical analytics visualization
- **Consultation Workspace** - Medical consultation interface
- **Patient Management** - Patient record components
- **Medical Reports** - Report viewing and management

## 🏥 Domains (`/src/domains/`)

Domain-driven design modules:

### Authentication (`/src/domains/auth/`)
- User authentication and authorization
- Auth0 integration
- Role-based access control

### Consultation (`/src/domains/consultation/`)
- Medical consultation workflow
- AI-assisted diagnosis
- Transcription services
- Demo mode implementation

### Patient Records (`/src/domains/patient-records/`)
- Patient data management
- Medical history tracking
- Record validation

### Reporting (`/src/domains/reporting/`)
- Medical report generation
- Data visualization
- Export functionality

## 🔧 Infrastructure (`/src/infrastructure/`)

### API (`/src/infrastructure/api/`)
- REST API client
- GraphQL integration
- Request/response handling

### Configuration (`/src/infrastructure/config/`)
- Application configuration
- Environment variable management
- Service initialization

### Database (`/src/infrastructure/database/`)
- Database connection management
- Query optimization
- Migration utilities

## 🔄 Shared (`/src/shared/`)

### Medical Types (`/src/shared/medical-types/`)
- Medical data type definitions
- Validation schemas
- Type utilities

### Providers (`/src/shared/providers/`)
- React context providers
- State management
- Global app state

### Utils (`/src/shared/utils/`)
- Utility functions
- Helper methods
- Common algorithms

## 🎯 Component Design Patterns

### Atomic Design
- **Atoms** - Basic building blocks (buttons, inputs, labels)
- **Molecules** - Simple combinations (form fields, card headers)
- **Organisms** - Complex components (navigation, forms, tables)
- **Templates** - Page layouts and structures
- **Pages** - Complete page implementations

### TypeScript Integration
- Full type safety for all components
- Interface definitions for props
- Generic components with type parameters
- Strict null checking

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## 🔗 Cross-References

- [Architecture Overview](./README.md) - System architecture
- [API Documentation](../api/) - API endpoints
- [Development Notes](../development/) - Implementation details
- [Legacy System](../legacy/) - Original component structure

## 🚀 Quick Navigation

- [← Architecture Documentation](./README.md)
- [API Documentation →](../api/)
- [Development Notes →](../development/)