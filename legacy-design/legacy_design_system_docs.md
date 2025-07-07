# 🎨 SYMFARMIA Legacy Design System - Documentación Completa

## 📋 **ÍNDICE**

1. [Introducción y Filosofía](#introducción-y-filosofía)
2. [Estructura del Sistema](#estructura-del-sistema)
3. [Reglas y Workflow](#reglas-y-workflow)
4. [Automatización](#automatización)
5. [Proceso de Migración](#proceso-de-migración)
6. [Integración con Figma](#integración-con-figma)
7. [Casos de Uso Prácticos](#casos-de-uso-prácticos)
8. [Scripts y Herramientas](#scripts-y-herramientas)

---

## **INTRODUCCIÓN Y FILOSOFÍA**

### 🎯 **Objetivo Principal**
El directorio `/legacy-design` funciona como **Single Source of Truth visual** para SYMFARMIA, manteniendo la integridad del diseño médico profesional y garantizando consistency across all components.

### ⚕️ **Principios Médicos de Diseño**
- **Accesibilidad crítica**: Interfaces legibles para doctores en turnos nocturnos
- **Claridad informacional**: Datos médicos presentados sin ambigüedad
- **Eficiencia workflow**: Reducir friction en procesos médicos críticos
- **Compliance HIPAA**: Design que protege información sensible de pacientes

### 🔒 **Reglas Fundamentales**
```
❌ PROHIBIDO: Modificar código en /legacy-design
❌ PROHIBIDO: Import directo desde legacy-design a producción
❌ PROHIBIDO: Merge sin validación visual

✅ PERMITIDO: Usar como referencia visual
✅ PERMITIDO: Copy, adapt, y TypeScript-ify components
✅ PERMITIDO: Update entire folder con nuevo Figma export
```

---

## **ESTRUCTURA DEL SISTEMA**

### 📁 **Directory Structure Completa**

```
/legacy-design/
├── README.md                           # Documentation principal
├── .design-hash                        # Hash tracking para automation
├── ComponentMigrationTemplate.md       # Template para migraciones
├── migration-log.md                   # Log de componentes migrados
├── design-validation-checklist.md     # Checklist de validación
│
├── figma-exports/                      # Timestamped exports
│   ├── 2025-01-15-medical-v1/         # Export específico
│   │   ├── components/                # Componentes React exportados
│   │   ├── assets/                    # Imágenes, iconos, etc.
│   │   ├── styles/                    # CSS y tokens básicos
│   │   └── index.js                   # Entry point del export
│   ├── 2025-01-20-dashboard-v2/       # Siguiente export
│   └── current/                       # Symlink → latest export
│
├── design-tokens/                      # Design tokens extraídos
│   ├── colors.json                    # Paleta médica completa
│   ├── typography.json                # Medical typography scale
│   ├── spacing.json                   # Spacing system
│   ├── medical-theme.json             # Tema específico médico
│   └── figma-tokens.json              # Tokens extraídos por API
│
├── component-registry/                 # Mapping Figma → Code
│   ├── buttons.md                     # Estado migración botones
│   ├── cards.md                       # Estado migración cards
│   ├── forms.md                       # Estado migración forms
│   ├── medical-components.md          # Componentes médicos específicos
│   ├── navigation.md                  # Sistema navegación
│   └── layouts.md                     # Layouts principales
│
├── validation-reports/                 # Reports automáticos
│   ├── visual-parity-check.json      # Validación automática
│   ├── accessibility-audit.json      # Audit de accesibilidad
│   └── performance-impact.json       # Impacto de performance
│
└── scripts/                           # Herramientas específicas
    ├── extract-tokens.js              # Extractor de design tokens
    ├── validate-components.js         # Validator de componentes
    └── generate-migration-plan.js     # Generador de plan migración
```

### 🏥 **Medical Design Tokens Structure**

```json
{
  "medical": {
    "colors": {
      "primary": {
        "medical-blue": "#2563eb",
        "health-green": "#10b981",
        "alert-amber": "#f59e0b",
        "critical-red": "#ef4444",
        "info-cyan": "#06b6d4"
      },
      "semantic": {
        "patient-data": "#1f2937",
        "diagnosis-text": "#374151",
        "treatment-highlight": "#3b82f6",
        "emergency-alert": "#dc2626"
      },
      "accessibility": {
        "high-contrast-bg": "#ffffff",
        "high-contrast-text": "#000000",
        "focus-indicator": "#3b82f6",
        "error-state": "#ef4444"
      }
    },
    "typography": {
      "patient-name": {
        "fontSize": "1.125rem",
        "fontWeight": "600",
        "lineHeight": "1.75rem"
      },
      "clinical-data": {
        "fontSize": "0.875rem",
        "fontWeight": "400",
        "lineHeight": "1.5rem",
        "letterSpacing": "0.025em"
      },
      "medical-alert": {
        "fontSize": "0.875rem",
        "fontWeight": "500",
        "lineHeight": "1.25rem"
      }
    },
    "spacing": {
      "consultation-padding": "1.5rem",
      "transcription-margin": "1rem",
      "soap-note-spacing": "1.25rem",
      "critical-alert-padding": "1rem"
    }
  }
}
```

---

## **REGLAS Y WORKFLOW**

### 📋 **Update Process Detallado**

#### **Paso 1: Preparación del Nuevo Export**
```bash
# 1. Export ZIP desde Figma
# 2. Crear directorio timestamped
mkdir legacy-design/figma-exports/2025-01-22-consultation-v3

# 3. Extraer ZIP en nuevo directorio
unzip figma-export.zip -d legacy-design/figma-exports/2025-01-22-consultation-v3/

# 4. Validar estructura
ls -la legacy-design/figma-exports/2025-01-22-consultation-v3/
```

#### **Paso 2: Update Symlink y Hashing**
```bash
# 1. Update symlink
cd legacy-design/figma-exports/
rm current
ln -s 2025-01-22-consultation-v3 current

# 2. Run design watcher para update hash
node scripts/design-watcher.js

# 3. Verificar diary update automático
tail -20 dev-notes/diary.md
```

#### **Paso 3: Validation y Documentation**
```bash
# 1. Run component validation
node scripts/validate-components.js

# 2. Generate migration plan
node scripts/generate-migration-plan.js

# 3. Update migration log
# Manually update legacy-design/migration-log.md
```

### ⚡ **Emergency Design Update Protocol**

Para cambios críticos que afectan UX médica:

```markdown
## 🚨 Emergency Design Update

**Trigger Conditions:**
- Critical medical workflow broken
- Accessibility compliance issue  
- Patient data visibility problem
- Emergency alert malfunction

**Emergency Process:**
1. ⚡ Immediate Figma export
2. 🔄 Direct symlink update (skip timestamping)
3. 📢 Immediate diary notification
4. 🔧 Priority component migration
5. ✅ Validation in staging environment
6. 🚀 Emergency deployment
```

---

## **AUTOMATIZACIÓN**

### 🔍 **Design Watcher System**

#### **Functionality:**
- **Hash-based change detection** en figma-exports/current
- **Automatic diary logging** cuando detecta cambios
- **Team notifications** para critical updates
- **Validation triggers** para component parity

#### **Configuration:**
```javascript
// scripts/design-watcher.config.js
module.exports = {
  watchInterval: 300000, // 5 minutos
  hashAlgorithm: 'md5',
  notificationThresholds: {
    minor: 'log', 
    major: 'diary + slack',
    critical: 'diary + slack + email'
  },
  autoValidation: true,
  generateReports: true
};
```

### 🤖 **Automated Validation System**

#### **Visual Parity Checking:**
```javascript
// Ejemplo de validation automática
const validateVisualParity = async () => {
  const legacyComponents = scanLegacyComponents();
  const currentComponents = scanProductionComponents();
  
  const results = {
    matches: [],
    mismatches: [],
    missing: []
  };
  
  for (const legacy of legacyComponents) {
    const current = findMatchingComponent(legacy);
    
    if (!current) {
      results.missing.push(legacy.name);
    } else {
      const match = await compareVisualProperties(legacy, current);
      if (match.score > 0.85) {
        results.matches.push({ name: legacy.name, score: match.score });
      } else {
        results.mismatches.push({
          name: legacy.name,
          score: match.score,
          differences: match.differences
        });
      }
    }
  }
  
  return results;
};
```

### 📊 **Reporting System**

#### **Weekly Design Health Report:**
```markdown
## 📈 Weekly Design System Health Report

**Period**: 2025-01-15 to 2025-01-22
**Export Version**: v2.3 (2025-01-20-dashboard-v2)

### 📊 Migration Status
- ✅ Completed: 23/47 components (49%)
- 🔄 In Progress: 8/47 components (17%)
- ⏳ Pending: 16/47 components (34%)

### 🎯 Visual Parity Score
- Overall: 87% (Target: >90%)
- Critical Medical Components: 94%
- General UI Components: 82%

### 🚨 Critical Issues
- [ ] Patient card design mismatch (Priority: High)
- [ ] Consultation layout inconsistency (Priority: Medium)
- [ ] Mobile responsiveness gaps (Priority: Medium)

### 📋 Next Week Priorities
1. Complete patient card migration
2. Update consultation layout
3. Mobile responsive fixes
```

---

## **PROCESO DE MIGRACIÓN**

### 📝 **Component Migration Template**

#### **Template Structure:**
```markdown
# Component Migration: [ComponentName]

## 📍 Reference Information
- **Figma Component**: /legacy-design/current/components/[component-name].jsx
- **Target Location**: /src/components/medical/[ComponentName].tsx
- **Designer**: [Designer Name]
- **Migration Date**: [YYYY-MM-DD]
- **Migrated By**: [Developer Name]

## 🎨 Design Analysis
### Visual Properties
- **Colors Used**: [List colors with tokens]
- **Typography**: [List text styles]
- **Spacing**: [Document margins, padding]
- **Responsive Behavior**: [Document breakpoints]

### Medical Context
- **Medical Use Case**: [Describe medical scenario]
- **Accessibility Requirements**: [WCAG compliance notes]
- **Performance Constraints**: [Medical workflow timing]

## 🔧 Migration Checklist
- [ ] **Visual Accuracy** - 100% match with Figma reference
- [ ] **TypeScript Conversion** - Full type safety
- [ ] **Accessibility** - ARIA labels, keyboard navigation
- [ ] **Responsive Design** - Mobile, tablet, desktop
- [ ] **Medical Context** - Appropriate for healthcare use
- [ ] **Performance** - <16ms render time
- [ ] **Testing** - Unit tests + visual regression
- [ ] **Documentation** - Storybook + usage examples

## 💻 Implementation
### Original Reference
```jsx
// FROM: /legacy-design/current/components/PatientCard.jsx
// This is READ-ONLY reference - DO NOT IMPORT
```

### Migrated Version
```tsx
// /src/components/medical/PatientCard.tsx
import React from 'react';
import { Patient } from '@/types/medical';
import { cn } from '@/utils/styles';

interface PatientCardProps {
  patient: Patient;
  onClick?: (patient: Patient) => void;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onClick,
  variant = 'default',
  className
}) => {
  // TypeScript-ified implementation
  // Based on legacy-design reference
  // Medical accessibility compliant
  // Performance optimized
};
```

## ✅ Validation Results
- **Visual Parity**: [Score/100]
- **Accessibility Score**: [Score/100] 
- **Performance**: [Render time in ms]
- **Medical Compliance**: [Pass/Fail with notes]

## 📝 Notes and Decisions
[Document any deviations from Figma design and rationale]
```

### 🔄 **Migration Workflow Phases**

#### **Phase 1: Discovery (1-2 days)**
- Analyze Figma components in current export
- Map components to existing codebase
- Identify medical-specific requirements
- Generate migration priority matrix

#### **Phase 2: Foundation (3-5 days)**
- Extract and migrate design tokens
- Create base component structure
- Implement accessibility framework
- Setup testing infrastructure

#### **Phase 3: Component Migration (2-3 weeks)**
- **Week 1**: Critical medical components (Patient, Consultation, Alerts)
- **Week 2**: Core platform components (Navigation, Forms, Tables)
- **Week 3**: Enhancement components (Animations, Advanced layouts)

#### **Phase 4: Validation (3-5 days)**
- Visual parity testing
- Accessibility audit
- Performance validation  
- Medical workflow testing

#### **Phase 5: Documentation (2-3 days)**
- Update component registry
- Create Storybook documentation
- Generate usage guidelines
- Update medical design standards

---

## **INTEGRACIÓN CON FIGMA**

### 🔗 **Figma API Integration**

#### **Setup y Configuration:**
```javascript
// scripts/figma-integration.js
class FigmaIntegration {
  constructor() {
    this.figmaToken = process.env.FIGMA_ACCESS_TOKEN;
    this.fileKey = process.env.FIGMA_FILE_KEY; // SYMFARMIA Medical Platform
    this.baseURL = 'https://api.figma.com/v1';
  }
  
  async fetchDesignTokens() {
    const fileData = await this.fetchFileData();
    const tokens = this.extractTokens(fileData);
    return this.normalizeMedicalTokens(tokens);
  }
  
  extractMedicalTokens(figmaData) {
    return {
      colors: this.extractMedicalColors(figmaData),
      typography: this.extractMedicalTypography(figmaData),
      spacing: this.extractMedicalSpacing(figmaData),
      components: this.extractMedicalComponents(figmaData)
    };
  }
}
```

#### **Design Token Extraction:**
```javascript
// Extract medical-specific tokens
extractMedicalColors(data) {
  const medicalColors = {
    // Critical medical states
    emergency: '#dc2626',
    warning: '#f59e0b', 
    stable: '#10b981',
    info: '#3b82f6',
    
    // Patient data hierarchy
    primaryData: '#1f2937',
    secondaryData: '#6b7280',
    metaData: '#9ca3af',
    
    // Medical specialties
    cardiology: '#ef4444',
    pediatrics: '#ec4899',
    surgery: '#8b5cf6',
    emergency: '#dc2626'
  };
  
  return medicalColors;
}
```

### 📱 **Plugin Integration**

#### **Recomended Figma Plugins:**
- **Figma to React**: Basic component export
- **Design Tokens**: Automated token extraction
- **Accessibility Checker**: WCAG compliance validation
- **Handoff**: Developer-designer communication

#### **Custom Plugin Configuration:**
```json
{
  "figmaToReact": {
    "outputFormat": "typescript",
    "includeStyles": true,
    "generateStorybook": true,
    "medicalCompliance": true
  },
  "designTokens": {
    "tokenFormat": "json",
    "includeMedicalTokens": true,
    "outputPath": "legacy-design/design-tokens/"
  }
}
```

---

## **CASOS DE USO PRÁCTICOS**

### 🏥 **Caso 1: Nueva Feature Médica**

#### **Scenario**: Implementar nuevo módulo de "Consulta Cardiológica"

```markdown
## 🫀 Implementing Cardiology Consultation Module

### Step 1: Design Reference
1. Check latest Figma export: `/legacy-design/current/`
2. Locate cardiology components in design
3. Document medical requirements specific to cardiology

### Step 2: Component Analysis  
1. Identify required components:
   - CardiologyConsultationPanel
   - ECGViewer
   - HeartRateMonitor
   - CardiacRiskAssessment

### Step 3: Migration Process
1. Use ComponentMigrationTemplate.md for each component
2. Implement with cardiology-specific medical tokens
3. Ensure cardiac data accessibility (rhythm analysis, etc.)

### Step 4: Medical Validation
1. Validate with cardiology workflow requirements
2. Test with realistic cardiac patient data
3. Verify emergency alert systems for critical values
```

### 🔄 **Caso 2: Design System Update**

#### **Scenario**: Figma designer actualiza color palette médica

```markdown
## 🎨 Medical Color Palette Update

### Detection
- design-watcher.js detecta cambio en current/
- Automatic diary entry creada
- Validation report generado

### Analysis  
1. Compare old vs new color tokens
2. Identify components affected by color changes
3. Assess medical compliance impact (contrast ratios, etc.)

### Migration Plan
1. Update design-tokens/colors.json
2. Audit all medical components for color usage
3. Test color changes in critical medical scenarios:
   - Emergency alerts visibility
   - Patient data hierarchy
   - Accessibility in low-light conditions

### Rollout
1. Update staging environment
2. Medical team validation
3. Gradual production rollout
```

### 🚨 **Caso 3: Emergency Design Fix**

#### **Scenario**: Critical bug en patient alert visibility

```markdown
## 🚨 Emergency: Patient Alert Visibility Issue

### Issue
- Critical patient alerts not visible enough
- Risk of missed medical emergencies
- Immediate design fix required

### Emergency Process
1. ⚡ Designer creates emergency Figma update
2. 🔄 Immediate export to legacy-design/emergency/
3. 🏃‍♂️ Skip normal validation - direct implementation
4. 🧪 Rapid testing with medical scenarios
5. 🚀 Emergency deployment
6. 📝 Post-incident documentation in diary

### Post-Emergency
1. Proper migration to timestamped folder
2. Full validation process
3. Update migration log
4. Review emergency process for improvements
```

---

## **SCRIPTS Y HERRAMIENTAS**

### 🛠️ **Core Scripts**

#### **1. design-watcher.js**
```bash
# Uso básico
node scripts/design-watcher.js

# Con opciones
node scripts/design-watcher.js --verbose --report

# Continuous monitoring
npm run design:watch
```

#### **2. figma-integration.js**
```bash
# Fetch latest tokens
node scripts/figma-integration.js --tokens

# Full file analysis
node scripts/figma-integration.js --analyze

# Update current export
node scripts/figma-integration.js --update-export
```

#### **3. validate-components.js**
```bash
# Validate all components
node scripts/validate-components.js

# Validate specific component
node scripts/validate-components.js --component=PatientCard

# Generate validation report
node scripts/validate-components.js --report
```

#### **4. generate-migration-plan.js**
```bash
# Generate complete migration plan
node scripts/generate-migration-plan.js

# Focus on medical components
node scripts/generate-migration-plan.js --medical-only

# Export to JSON
node scripts/generate-migration-plan.js --format=json
```

### 📊 **NPM Scripts Configuration**

```json
{
  "scripts": {
    "design:watch": "node scripts/design-watcher.js --continuous",
    "design:validate": "node scripts/validate-components.js --report",
    "design:sync": "node scripts/figma-integration.js --update-export",
    "design:plan": "node scripts/generate-migration-plan.js",
    "design:health": "npm run design:validate && npm run design:plan",
    "design:emergency": "node scripts/emergency-design-update.js"
  }
}
```

### 🔧 **Advanced Tools**

#### **Visual Regression Testing:**
```javascript
// scripts/visual-regression.js
const { chromium } = require('playwright');

class VisualRegressionTester {
  async compareComponentScreenshots() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    
    // Screenshot legacy design reference
    const legacyPage = await context.newPage();
    await legacyPage.goto('file://legacy-design/current/index.html');
    const legacyScreenshot = await legacyPage.screenshot();
    
    // Screenshot current implementation  
    const currentPage = await context.newPage();
    await currentPage.goto('http://localhost:3000/storybook');
    const currentScreenshot = await currentPage.screenshot();
    
    // Compare and generate diff
    const diff = await this.generateDiff(legacyScreenshot, currentScreenshot);
    return diff;
  }
}
```

#### **Accessibility Audit Automation:**
```javascript
// scripts/accessibility-audit.js
const { AxePuppeteer } = require('@axe-core/puppeteer');

class AccessibilityAuditor {
  async auditMedicalComponents() {
    const results = [];
    
    for (const component of MEDICAL_COMPONENTS) {
      const page = await this.browser.newPage();
      await page.goto(`http://localhost:3000/storybook/?path=/story/${component}`);
      
      const axe = new AxePuppeteer(page);
      const audit = await axe
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
        
      results.push({
        component,
        violations: audit.violations,
        passes: audit.passes.length,
        score: this.calculateAccessibilityScore(audit)
      });
    }
    
    return results;
  }
}
```

---

## **CONCLUSIÓN**

### 🎯 **Objetivos Cumplidos**

El sistema Legacy Design garantiza:

- ✅ **Single Source of Truth** visual mantenido
- ✅ **Automated tracking** de cambios de diseño  
- ✅ **Medical compliance** en todos los componentes
- ✅ **Systematic migration** process documentado
- ✅ **Quality assurance** through validation
- ✅ **Team collaboration** mejorada entre design y dev

### 🚀 **Próximos Pasos**

1. **Implement monitoring dashboard** para design system health
2. **AI-powered component** suggestion based on medical context  
3. **Advanced visual regression** testing con medical scenarios
4. **Integration con medical** workflow testing
5. **Expanded Figma API** integration para automatic updates

### 📞 **Support & Contact**

Para questions about el Legacy Design System:
- 📚 Check this documentation first
- 💬 Review migration-log.md para component status
- 🤖 Consult dev-notes/diary.md para recent updates
- 🎨 Reference Figma file para visual questions

---

**Remember: El Legacy Design System es la foundation visual de SYMFARMIA. Treat it with medical-grade precision y attention to detail. Every component migrated correctly contributes to better healthcare delivery. 🏥⚕️**