# SYMFARMIA (2025 TypeScript Edition)

**Intelligent platform for independent doctors** - A modern, type-safe medical management system built with Next.js 14, TypeScript, and 2025 best practices for managing patients, medical reports, and studies.

## 🏥 Features

- **🩺 Patient Management**: Complete patient profiles with personal information and medical history
- **📋 Medical Reports**: Diagnosis tracking with expiration dates and status management
- **🧪 Studies Management**: Categorized medical studies and test results
- **📁 File Upload**: Secure file storage and PDF generation capabilities
- **🔐 Authentication**: Secure login system powered by Auth0
- **📧 Email Integration**: Automated email notifications and token-based verification
- **🧪 Testing Suite**: Comprehensive Jest tests with React Testing Library
- **🔧 Development Tools**: Error boundaries, logging, and smoke testing

## 🚀 Quick Start

### Prerequisites

- **Node.js 18** with npm 9
- **PostgreSQL database** (optional for demo mode)
- **Auth0 account** (optional for demo mode)
- **EdgeStore account** (optional for demo mode)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd symfarmia
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

The app will start with a clean landing page. For full functionality, set up environment variables (see below).

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **`__tests__/`** - All Jest test files
- **`jest.config.js`** - Jest configuration with Next.js integration
- **`jest.setup.js`** - Test setup with mocks for Auth0, Next.js router, etc.

### Available Tests

- **LandingPage.test.jsx** - Landing page component tests
- **HomePage.test.jsx** - Home page rendering tests  
- **LegacyPage.test.jsx** - Legacy system access tests
- **Layout.test.jsx** - Root layout component tests
- **api.test.js** - API and mock functionality tests

### Front-end Smoke Testing

Click the **purple test icon** in the bottom-right corner of the landing page to run a comprehensive smoke test that validates:

- ✅ API health check
- ✅ Mock data generation
- ✅ Component rendering
- ✅ Browser feature support
- ✅ Local storage functionality
- ✅ Patient/report creation

## 🔧 Development

### Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production  
npm run start       # Start production server
npm run lint        # Run ESLint
npm test           # Run Jest tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

### Development Features

- **Error Boundaries**: Automatic error catching and user-friendly error pages
- **Development Logging**: Enhanced console logging with the `Logger` utility
- **Mock API**: Full mock backend with dummy data for local development
- **Hot Reload**: Next.js fast refresh for instant development feedback

### Demo Mode

SYMFARMIA includes a comprehensive demo mode using the Strategy pattern for seamless switching between live and demo environments:

#### Features
- **Strategy Pattern Implementation**: Clean separation between live and demo data providers
- **In-Memory Mock Data**: Complete dataset with realistic patient, medical report, and study information
- **No External Dependencies**: Works completely offline without database, Auth0, or EdgeStore
- **Visual Demo Banner**: Clear indication when in demo mode with easy exit options
- **Full UI Functionality**: All features work normally with mock data and simulated delays

#### Accessing Demo Mode

1. **URL Parameter**: Add `?demo=true` to any URL (e.g., `http://localhost:3000?demo=true`)
2. **Environment Variable**: Set `NEXT_PUBLIC_APP_MODE=demo` in your `.env.local`
3. **Landing Page Link**: Click "Try Demo Mode" button on the landing page

#### Demo Mode Behavior

- **Data Persistence**: Changes persist in memory during the session
- **Simulated API Delays**: Realistic 300-1500ms delays for better UX testing
- **Safe Operations**: Destructive actions work but only affect mock data
- **Email/PDF Operations**: Console logging instead of real operations
- **Session Storage**: Optional persistence using browser storage

#### Developer Extension

To extend demo functionality:

```javascript
// Add new mock data to DemoAPIProvider.js
initializeDemoData() {
  return {
    // Add your new entities here
    newEntity: [...]
  }
}

// Add corresponding methods
async fetchNewEntity() {
  return this.demoData.newEntity;
}
```

The Strategy pattern makes it easy to add new demo behaviors while keeping live functionality unchanged.

## ⚙️ Full Setup (Optional)

For production use or to access the legacy medical system:

### Environment Variables

Create a `.env.local` file:

```env
# Database (for legacy system)
DATABASE_URL="postgresql://user:password@localhost:5432/symfarmia"

# Auth0 Configuration
AUTH0_SECRET="your-long-random-secret"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://your-domain.auth0.com"
AUTH0_CLIENT_ID="your_auth0_client_id"
AUTH0_CLIENT_SECRET="your_auth0_client_secret"

# EdgeStore (for file uploads)
EDGE_STORE_ACCESS_KEY="your_edgestore_access_key"
EDGE_STORE_SECRET_KEY="your_edgestore_secret_key"
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npm run seed
```

## 🏗️ Architecture (2025 Edition)

This project has been fully migrated to a modern TypeScript architecture following 2025 best practices with strict type safety, modular design, and enterprise-grade code organization.

### New TypeScript Project Structure

```
symfarmia/
├── app/                    # Next.js App Router (legacy .js files)
│   ├── api/auth/          # Auth0 authentication
│   ├── legacy/            # Legacy system access
│   ├── layout.js          # Root layout
│   └── page.js            # Landing page entry point
├── components/            # ✨ NEW: Modern TypeScript Components
│   ├── LandingPage/       # Component folders with index.tsx
│   └── [ComponentName]/   # Colocated components with types
├── hooks/                 # ✨ NEW: Custom React Hooks (TypeScript)
│   ├── useApi.ts          # API operations with typing
│   ├── useConfirmation.ts # Modal confirmations
│   ├── useForm.ts         # Form management with validation
│   ├── useLocalStorage.ts # Type-safe local storage
│   ├── useDebounce.ts     # Performance optimization hooks
│   └── index.ts           # Convenience exports
├── types/                 # ✨ NEW: TypeScript Definitions
│   ├── index.ts           # Core entity types and interfaces
│   ├── api.ts             # API request/response types
│   └── constants.ts       # Typed constants and enums
├── utils/                 # ✨ NEW: Pure Utility Functions (TypeScript)
│   ├── logger.ts          # Enhanced logging with TypeScript
│   ├── date.ts            # Date manipulation utilities
│   ├── validation.ts      # Input validation functions
│   ├── api.ts             # API client and utilities
│   └── index.ts           # Re-exports all utilities
├── legacy_core/          # Original medical system (JavaScript)
│   ├── app/              # Legacy Next.js application
│   ├── prisma/           # Database schema and clients
│   └── README.md         # Legacy system documentation
├── __tests__/            # Jest test suite
└── tsconfig.json         # ✨ Strict TypeScript configuration
```

### 2025 Architecture Principles

#### 🎯 **Full TypeScript Enforcement**
- **Strict Configuration**: `allowJs: false`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`
- **Path Mapping**: Clean imports using `@/` aliases
- **Type Safety**: All components, hooks, and utilities fully typed

#### 🔧 **Component Architecture**
- **Folder-based Components**: Each component in its own folder with `index.tsx`
- **Proper TypeScript Interfaces**: All props typed with `BaseComponentProps` extension
- **Accessibility**: ARIA labels, focus management, keyboard navigation
- **Performance**: Memoization and optimization patterns

#### 🪝 **Custom Hooks Pattern**
- **Business Logic Separation**: No logic in components, only in hooks
- **Reusable Hooks**: `useApi`, `useForm`, `useConfirmation`, etc.
- **Type-Safe State Management**: Strongly typed state and actions
- **Error Handling**: Built-in error states and recovery

#### 🛠️ **Utility Functions**
- **Pure Functions**: No side effects, easily testable
- **Type Safety**: Input/output validation with TypeScript
- **Performance**: Debouncing, throttling, memoization utilities
- **Comprehensive**: Date, validation, API, logging utilities

#### 📝 **Type System**
- **Domain Models**: Patient, MedicalReport, Study interfaces
- **API Types**: Request/response interfaces for all endpoints
- **Form Types**: Validation and form state management
- **Utility Types**: Generic helpers for common patterns

### Modern Tech Stack (2025)

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5.8
- **Styling**: Tailwind CSS 3.4 with TypeScript integration
- **State Management**: Custom hooks with TypeScript
- **Form Handling**: Type-safe form validation and management
- **API Layer**: Fully typed API client with error handling
- **Testing**: Jest, React Testing Library with TypeScript support
- **Code Quality**: ESLint, Prettier, TypeScript compiler
- **Development**: Hot reload, strict type checking, path mapping

### Development Workflow (2025)

#### 🚀 **Available Scripts**
```bash
npm run dev              # Development server with TypeScript
npm run build            # Type-check + Prisma + build
npm run type-check       # TypeScript compilation check
npm run type-check:watch # Watch mode type checking
npm run lint             # ESLint + TypeScript checks
npm run format           # Prettier formatting
npm run test:type-check  # Tests + type checking
```

#### 🔍 **Type Safety Features**
- **Strict Compilation**: Zero `any` types allowed
- **Path Mapping**: `@/components`, `@/hooks`, `@/utils`, `@/types`
- **Build Integration**: Type checking in CI/CD pipeline
- **IDE Support**: Full IntelliSense and error detection

#### 🧪 **Testing Strategy**
- **Type-Safe Tests**: All test files support TypeScript
- **Component Testing**: Props and behavior validation
- **Hook Testing**: Custom hook logic and state management
- **API Testing**: Request/response type validation

### Migration Benefits

#### ✅ **Developer Experience**
- **IntelliSense**: Full autocomplete and error detection
- **Refactoring**: Safe refactoring with confidence
- **Documentation**: Types serve as living documentation
- **Debugging**: Better error messages and stack traces

#### ✅ **Code Quality**
- **Bug Prevention**: Compile-time error detection
- **Maintainability**: Self-documenting code with types
- **Scalability**: Enterprise-ready architecture patterns
- **Performance**: Tree shaking and dead code elimination

#### ✅ **Team Collaboration**
- **API Contracts**: Clear interfaces between components
- **Consistency**: Enforced coding standards and patterns
- **Onboarding**: New developers understand code faster
- **Code Reviews**: Type-driven reviews focus on logic

### Legacy System Compatibility

The TypeScript migration maintains full backward compatibility:

- **Legacy Core**: Original JavaScript medical system preserved
- **Dual Architecture**: Modern TypeScript + legacy JavaScript coexist
- **Gradual Migration**: Components migrated incrementally
- **Data Compatibility**: Same database schema and APIs

## 🚀 Deployment

### Demo Deployment

The app can be deployed as a static demo without any backend dependencies:

```bash
# Build static version
npm run build

# The app works fully client-side with mock data
# Deploy the .next/static files to any static hosting
```

### Full Production Deployment

1. **Set up environment variables** in your hosting platform
2. **Configure database** (PostgreSQL recommended)
3. **Set up Auth0** application
4. **Configure EdgeStore** for file uploads
5. **Deploy** using your preferred platform (Vercel, Netlify, etc.)

```bash
npm run build
npm start
```

## 🔐 Access Control

- **Public Landing Page**: Available to all visitors at `/`
- **Legacy Medical System**: Requires Auth0 authentication at `/legacy`
- **Demo Mode**: Fully functional without authentication
- **Role-Based Access**: Uses `SYMFARMIA-Admin` role for administrative functions

## 🧪 Testing Strategy

- **Unit Tests**: Component behavior and rendering
- **Integration Tests**: API interactions and data flow
- **Smoke Tests**: End-to-end functionality validation
- **Mock Testing**: Isolated testing with fake data
- **Error Boundary Testing**: Error handling and recovery

## 📝 Development Notes

- **Clean Architecture**: Entity-use case-API pattern maintained
- **Error Handling**: Comprehensive error boundaries and logging
- **Mock Development**: Full functionality without external dependencies  
- **Test Coverage**: Comprehensive test suite for all components
- **TypeScript**: Mixed JS/TS codebase with gradual migration support

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Add tests** for new functionality
4. **Run the test suite**: `npm test`
5. **Ensure lint passes**: `npm run lint`
6. **Submit a pull request**

### Code Standards

- Use the existing entity-use case-API pattern
- Add Jest tests for new components
- Follow established naming conventions
- Include error handling and logging
- Update documentation for new features

## 📄 License

Generated by Ar2Design - Intelligent platform for independent doctors

---

**🎯 Ready to use**: Clone, install, and run `npm run dev` - no additional setup required for demo mode!
