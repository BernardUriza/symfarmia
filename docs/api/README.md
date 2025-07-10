# API Documentation

This section contains API documentation for SYMFARMIA.

## 📋 Available Documents

### 🏥 [Medical API](./medical-api.md)
Medical AI API documentation:
- AI-powered medical consultation endpoint
- Request/response formats
- Authentication requirements
- Error handling
- Usage examples
- Available models (BERT, Bio_ClinicalBERT)

## 🔌 API Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/medical` | POST | AI medical consultation |
| `/api/patients` | GET, POST, PUT, DELETE | Patient management |
| `/api/medicalReports` | GET, POST, PUT, DELETE | Medical reports |
| `/api/studies` | GET, POST, PUT, DELETE | Medical studies |
| `/api/categories` | GET, POST, PUT, DELETE | Study categories |
| `/api/study-types` | GET, POST, PUT, DELETE | Study types |

## 🔑 Authentication

- **Auth0 Integration**: Secure authentication for production
- **Demo Mode**: No authentication required
- **API Tokens**: Hugging Face token for medical AI

## 📊 Rate Limits

- **Medical AI**: 100 requests per minute
- **Standard APIs**: 1000 requests per minute
- **File Upload**: 10MB per file

## 🔗 Related Documentation

- [Architecture](../architecture/) - System architecture
- [Development](../development/) - Development setup
- [Deployment](../deployment/) - Production configuration

## 🚀 Quick Navigation

- [← Back to Documentation Home](../README.md)
- [Architecture →](../architecture/)
- [Development →](../development/)