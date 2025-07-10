# Legacy System Documentation

This section contains documentation for the original SYMFARMIA system.

## 📋 Available Documents

### 🏛️ [Legacy Core](./legacy-core.md)
Original system documentation:
- Legacy architecture overview
- Database schema (original)
- Component structure
- Migration notes

### 🎨 [Legacy Design System](./legacy-design/)
Design system and components:
- Component registry
- Design tokens
- Figma exports
- Migration templates

## 🔄 Migration Status

The legacy system is being gradually migrated to the new TypeScript architecture:

### ✅ Completed
- Landing page modernization
- TypeScript infrastructure
- Modern build system
- Testing framework

### 🔄 In Progress
- Component migration
- API modernization
- Database schema updates
- UI/UX improvements

### 📋 Pending
- Complete legacy system replacement
- Data migration tools
- Legacy route deprecation

## 📁 Legacy Structure

```
legacy_core/
├── app/                    # Legacy Next.js app
├── prisma/                 # Database clients
├── components/             # Legacy React components
├── controls/               # UI controls
├── providers/              # Context providers
└── useCases/              # Business logic
```

## 🔗 Related Documentation

- [Architecture](../architecture/) - New system architecture
- [Development](../development/) - Migration guides
- [API Documentation](../api/) - Modern API endpoints

## 🚀 Quick Navigation

- [← Back to Documentation Home](../README.md)
- [Architecture →](../architecture/)
- [Development →](../development/)