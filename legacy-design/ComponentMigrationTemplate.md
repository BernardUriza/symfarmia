# Component Migration: [Component Name]

## 📍 Figma Reference
- **File**: /legacy-design/current/components/[component-name].jsx
- **Design**: [Figma link]
- **Status**: 🔄 In Progress

## 🔧 Migration Checklist
- [ ] Visual accuracy vs Figma
- [ ] TypeScript conversion
- [ ] Accessibility (ARIA, keyboard nav)
- [ ] Responsive behavior
- [ ] Medical context integration
- [ ] Performance optimization
- [ ] Unit tests

## 🎯 Implementation Notes
```tsx
// Original Figma export (reference only)
// /legacy-design/current/components/PatientCard.jsx

// Migrated version
// /src/components/medical/PatientCard.tsx
import { Patient } from '@/types/medical';

interface PatientCardProps {
  patient: Patient;
  onClick?: (patient: Patient) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onClick,
  variant = 'default'
}) => {
  // TypeScript-ified, accessible, performant version
  // Based on /legacy-design reference
};
```

## 🚨 CRITICAL REQUIREMENTS

- [ ] Visual parity with Figma
- [ ] Medical accessibility standards
- [ ] Performance < 16ms render
- [ ] Mobile responsive
- [ ] Dark mode support
