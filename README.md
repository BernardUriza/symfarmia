# SYMFARMIA

**Intelligent platform for independent doctors** - A comprehensive medical management system built with Next.js for managing patients, medical reports, and studies.

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

- **Node.js 18+** and npm
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

The app runs in demo mode without any external dependencies:

1. **Mock Data**: Uses `@faker-js/faker` to generate realistic patient data
2. **Local Storage**: Persists demo data in browser storage  
3. **Smoke Tests**: Built-in testing to validate all functionality
4. **No Database Required**: Works completely offline for demonstration

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

## 🏗️ Architecture

### Project Structure

```
symfarmia/
├── app/                    # Next.js App Router
│   ├── api/auth/          # Auth0 authentication
│   ├── legacy/            # Legacy system access
│   ├── layout.js          # Root layout with error boundary
│   └── page.js            # Landing page entry point
├── src/
│   ├── components/        # React components
│   │   ├── ErrorBoundary.jsx
│   │   └── SmokeTest.jsx
│   ├── pages/            # Page components
│   │   └── LandingPage.jsx
│   └── utils/            # Utilities
│       ├── logger.js      # Development logging
│       └── mockApi.js     # Mock backend API
├── legacy_core/          # Original medical system
│   ├── app/              # Legacy Next.js application
│   ├── prisma/           # Database schema and clients
│   └── README.md         # Legacy system documentation
├── __tests__/            # Jest test suite
└── package.json          # Dependencies and scripts
```

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Testing**: Jest, React Testing Library, @testing-library/jest-dom
- **Authentication**: Auth0 (optional)
- **Database**: PostgreSQL with Prisma ORM (optional)
- **Development**: Error boundaries, enhanced logging, mock APIs
- **Legacy System**: Complete medical management application

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
