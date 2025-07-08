# 🏗️ MODULAR ARCHITECTURE OVERHAUL - SYMFARMIA

**From**: Tech Lead (Architectural Vision)  
**To**: Claude & Codex (AI Development Team)  
**Priority**: ARCHITECTURAL - Foundation for Scale  
**Mission**: Transform monolithic chaos into modular excellence

---

## 🎯 **THE MODULAR VISION**

**Current Reality**: Monolithic spaghetti code with 732kB legacy routes, broken imports, and tangled dependencies.

**Target State**: Clean, modular architecture where each domain is independent, testable, and deployable separately.

**Medical Context**: **Modular = Reliable = Life-saving**. Rural doctors need components that work independently when others fail.

---

## 🏛️ **MODULAR DOMAIN ARCHITECTURE**

### **Core Domains for SYMFARMIA:**

```
/src/
├── domains/
│   ├── medical-ai/          # 🩺 Medical AI & Transcription
│   ├── consultation/        # 👨‍⚕️ Doctor-Patient Interactions  
│   ├── patient-records/     # 📋 Patient Data Management
│   ├── auth/               # 🔐 Authentication & Authorization
│   ├── reporting/          # 📊 Medical Reports & Analytics
│   └── demo/               # 🧪 Demo & Simulation Engine
├── shared/
│   ├── ui/                 # 🎨 Reusable UI Components
│   ├── medical-types/      # 🔬 Medical Domain Types
│   ├── utils/              # 🛠️ Cross-domain Utilities
│   └── providers/          # ⚙️ Global Providers
└── infrastructure/
    ├── api/                # 🌐 API Layer & Routing
    ├── database/           # 💾 Data Access Layer
    └── config/             # ⚙️ Environment & Configuration
```

---

## 🩺 **MEDICAL-AI DOMAIN (Priority 1)**

### **Domain Structure:**
```
/domains/medical-ai/
├── components/
│   ├── TranscriptionPanel.tsx
│   ├── AIAnalysisDisplay.tsx
│   ├── MedicalConfidenceIndicator.tsx
│   └── StrategySelector.tsx
├── hooks/
│   ├── useTranscription.ts
│   ├── useMedicalAI.ts
│   ├── useAudioCapture.ts
│   └── useMedicalValidation.ts
├── services/
│   ├── transcriptionService.ts
│   ├── medicalAIService.ts
│   ├── audioProcessingService.ts
│   └── medicalValidationService.ts
├── types/
│   ├── transcription.types.ts
│   ├── medicalAI.types.ts
│   └── audio.types.ts
├── utils/
│   ├── medicalTerminology.ts
│   ├── confidenceCalculation.ts
│   └── strategyEngine.ts
└── index.ts                # Public API exports
```

### **Public API Design:**
```typescript
// /domains/medical-ai/index.ts
export {
  // Components
  TranscriptionPanel,
  AIAnalysisDisplay,
  MedicalConfidenceIndicator,
  StrategySelector,
  
  // Hooks  
  useTranscription,
  useMedicalAI,
  useAudioCapture,
  
  // Services
  transcriptionService,
  medicalAIService,
  
  // Types
  type TranscriptionResult,
  type MedicalAnalysis,
  type AudioConfig,
  type MedicalSpecialty
} from './internal-exports';

// Domain-specific configuration
export const medicalAIConfig = {
  supportedLanguages: ['es-MX', 'es-ES', 'en-US'],
  confidenceThreshold: 0.75,
  specialties: ['general', 'cardiology', 'pediatrics', 'emergency'],
  maxAudioDuration: 3600 // 1 hour max
};
```

---

## 👨‍⚕️ **CONSULTATION DOMAIN (Priority 2)**

### **Domain Structure:**
```
/domains/consultation/
├── components/
│   ├── ConsultationWorkspace.tsx
│   ├── PatientInfoPanel.tsx
│   ├── SOAPNotesEditor.tsx
│   ├── MedicalHistoryViewer.tsx
│   └── ConsultationTimer.tsx
├── hooks/
│   ├── useConsultation.ts
│   ├── useSOAPNotes.ts
│   ├── usePatientContext.ts
│   └── useConsultationTimer.ts
├── services/
│   ├── consultationService.ts
│   ├── soapNotesService.ts
│   ├── patientService.ts
│   └── medicalHistoryService.ts
├── types/
│   ├── consultation.types.ts
│   ├── soapNotes.types.ts
│   └── patient.types.ts
└── workflows/
    ├── emergencyConsultation.workflow.ts
    ├── routineConsultation.workflow.ts
    └── followUpConsultation.workflow.ts
```

### **Workflow Engine Design:**
```typescript
// Emergency consultation workflow
export class EmergencyConsultationWorkflow {
  constructor(
    private medicalAI: MedicalAIService,
    private consultation: ConsultationService
  ) {}

  async start(patientId: string): Promise<EmergencyConsultation> {
    // 1. Immediate triage assessment
    const triage = await this.medicalAI.triageAssessment(patientId);
    
    // 2. Auto-activate high sensitivity recording
    const audioConfig = { 
      quality: 'ultra',
      emergencyMode: true,
      autoTranscription: true
    };
    
    // 3. Initialize emergency SOAP template
    const soapTemplate = this.generateEmergencySOAP(triage);
    
    return this.consultation.createEmergency({
      patientId,
      triage,
      audioConfig,
      soapTemplate,
      alertLevel: 'critical'
    });
  }
}
```

---

## 📋 **PATIENT-RECORDS DOMAIN (Priority 3)**

### **Domain Structure:**
```
/domains/patient-records/
├── components/
│   ├── PatientSearchbar.tsx
│   ├── PatientProfile.tsx
│   ├── MedicalHistoryTimeline.tsx
│   ├── AllergyManager.tsx
│   └── MedicationTracker.tsx
├── hooks/
│   ├── usePatientSearch.ts
│   ├── usePatientData.ts
│   ├── useMedicalHistory.ts
│   └── usePatientSecurity.ts
├── services/
│   ├── patientDataService.ts
│   ├── medicalHistoryService.ts
│   ├── encryptionService.ts
│   └── auditTrailService.ts
├── types/
│   ├── patient.types.ts
│   ├── medicalHistory.types.ts
│   ├── security.types.ts
│   └── audit.types.ts
└── security/
    ├── hipaaCompliance.ts
    ├── dataEncryption.ts
    └── accessControl.ts
```

---

## 🧪 **DEMO DOMAIN (Current Problem)**

### **Modular Demo Architecture:**
```
/domains/demo/
├── components/
│   ├── DemoModeIndicator.tsx
│   ├── DemoTranscriptionPanel.tsx
│   ├── DemoPatientSelector.tsx
│   └── DemoResetButton.tsx
├── hooks/
│   ├── useDemoMode.ts
│   ├── useDemoTranscription.ts
│   ├── useDemoPatients.ts
│   └── useDemoSettings.ts
├── services/
│   ├── demoDataService.ts
│   ├── demoSimulationService.ts
│   └── demoValidationService.ts
├── strategies/
│   ├── hivPregnancyStrategy.ts
│   ├── emergencyStrategy.ts
│   ├── pediatricStrategy.ts
│   └── generalMedicineStrategy.ts
├── data/
│   ├── demoPatients.json
│   ├── demoTranscriptions.json
│   └── demoScenarios.json
└── types/
    ├── demo.types.ts
    ├── strategy.types.ts
    └── simulation.types.ts
```

### **Demo Strategy Engine:**
```typescript
// /domains/demo/services/demoSimulationService.ts
export class DemoSimulationService {
  private strategies = new Map<string, DemoStrategy>();

  constructor() {
    this.registerStrategy('hiv-pregnancy', new HIVPregnancyStrategy());
    this.registerStrategy('emergency', new EmergencyStrategy());
    this.registerStrategy('pediatric', new PediatricStrategy());
    this.registerStrategy('general', new GeneralMedicineStrategy());
  }

  async simulate(strategyKey: string, input: DemoInput): Promise<DemoResult> {
    const strategy = this.strategies.get(strategyKey);
    if (!strategy) {
      throw new DemoError(`Strategy not found: ${strategyKey}`);
    }

    return strategy.execute(input);
  }

  // Real-time simulation with medical context
  createRealtimeSimulation(strategyKey: string): DemoSimulation {
    return new DemoSimulation(
      this.strategies.get(strategyKey),
      { 
        realtimeMode: true,
        medicalValidation: true,
        confidenceSimulation: true 
      }
    );
  }
}
```

---

## 🎨 **SHARED UI DOMAIN**

### **Component Library Structure:**
```
/shared/ui/
├── atoms/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Modal/
│   └── Loading/
├── molecules/
│   ├── FormField/
│   ├── SearchBar/
│   ├── DataTable/
│   └── NotificationToast/
├── organisms/
│   ├── NavigationBar/
│   ├── Sidebar/
│   ├── Footer/
│   └── ErrorBoundary/
├── templates/
│   ├── DashboardLayout/
│   ├── ConsultationLayout/
│   └── LandingPageLayout/
└── themes/
    ├── medical.theme.ts
    ├── dark.theme.ts
    └── accessibility.theme.ts
```

### **Design System Integration:**
```typescript
// /shared/ui/themes/medical.theme.ts
export const medicalTheme = {
  colors: {
    primary: {
      50: '#eff6ff',   // Light medical blue
      500: '#3b82f6',  // Standard medical blue
      900: '#1e3a8a'   // Dark medical blue
    },
    medical: {
      emergency: '#ef4444',    // Red for emergencies
      warning: '#f59e0b',      // Amber for warnings
      success: '#10b981',      // Green for success
      info: '#3b82f6'          // Blue for information
    },
    semantic: {
      transcriptionActive: '#10b981',
      analysisProcessing: '#f59e0b', 
      criticalAlert: '#ef4444',
      patientSafe: '#10b981'
    }
  },
  spacing: {
    consultation: '2rem',    // Optimal for medical workflows
    emergency: '1rem',       // Compact for urgent scenarios
    comfortable: '3rem'      // Relaxed for routine work
  },
  typography: {
    medical: {
      fontFamily: 'Inter, system-ui, sans-serif',
      sizes: {
        patientName: '1.5rem',
        diagnosis: '1.125rem',
        notes: '1rem',
        metadata: '0.875rem'
      }
    }
  }
};
```

---

## 🛠️ **IMPLEMENTATION STRATEGY**

### **Phase 1: Medical-AI Domain (Week 1)**
```bash
# Claude: Focus on medical-AI modularization
1. Extract all medical AI logic into domain
2. Create clean public API
3. Implement domain-specific tests
4. Document medical context for each component

# Success criteria:
- Medical AI domain completely independent
- All medical functionality through domain API
- Zero circular dependencies
- Medical tests with 90%+ coverage
```

### **Phase 2: Demo Domain Cleanup (Week 2)**
```bash
# Codex: Fix demo domain architecture  
1. Extract demo logic from main components
2. Create demo strategy engine
3. Implement modular demo components
4. Add real-time simulation capabilities

# Success criteria:
- Demo mode completely isolated
- No demo code bleeding into production
- Real demo functionality (not fake)
- Performance optimized
```

### **Phase 3: Consultation Domain (Week 3)**
```bash
# Both: Collaborative consultation domain
1. Design consultation workflows
2. Implement SOAP notes system
3. Create patient context management
4. Build consultation timer and tracking

# Success criteria:
- Complete consultation workflows
- Medical-grade data handling
- Audit trail for compliance
- Real-time collaboration ready
```

### **Phase 4: Infrastructure & Shared (Week 4)**
```bash
# Both: Foundation consolidation
1. Migrate to shared UI components
2. Implement medical theme system
3. Create cross-domain communication
4. Optimize bundle splitting by domain

# Success criteria:
- Bundle size reduced by 60%
- Independent domain deployments
- Shared components library
- Medical design system complete
```

---

## 📊 **MODULAR SUCCESS METRICS**

### **Architecture Goals:**
- **Bundle Size**: Each domain <200KB compressed
- **Load Time**: Domain lazy loading <1s
- **Independence**: Zero cross-domain imports except shared
- **Testability**: Each domain 90%+ test coverage

### **Medical Goals:**
- **Reliability**: Domain failures don't cascade
- **Performance**: Medical workflows <2s response
- **Scalability**: Add specialties without core changes
- **Compliance**: Domain-level audit trails

### **Developer Goals:**
- **Productivity**: New features in single domain
- **Maintenance**: Bug fixes isolated to domain
- **Collaboration**: Claude/Codex can work on different domains
- **Documentation**: Each domain self-documenting

---

## 🎯 **DOMAIN OWNERSHIP MODEL**

### **Claude Domains (Perfectionist Architecture):**
- **medical-ai**: Complex AI logic, medical validation
- **patient-records**: Security, encryption, compliance
- **shared/medical-types**: Type safety, medical standards

### **Codex Domains (Creative UI/UX):**
- **demo**: Interactive simulations, real-time magic
- **shared/ui**: Component library, design system
- **consultation**: User experience, workflow optimization

### **Collaborative Domains:**
- **consultation**: Core medical workflows (both)
- **reporting**: Data + Visualization (both)
- **infrastructure**: API + Performance (both)

---

## 🚀 **CALL TO ACTION**

### **Claude: Start Medical-AI Domain**
1. **Today**: Extract medical AI into `/domains/medical-ai/`
2. **This week**: Complete domain with tests and docs
3. **Commitment**: Medical domain becomes reference architecture

### **Codex: Redeem with Demo Domain**
1. **Today**: Fix current demo disasters
2. **This week**: Build proper modular demo domain
3. **Commitment**: Show that "destructive creation" builds better architecture

### **Both: Modular Medical Excellence**
- **No more monolithic chaos**
- **Domain-driven development**
- **Medical-grade reliability through modularity**
- **Architecture that scales with lives saved**

---

**BUILD DOMAINS THAT SAVE LIVES. ARCHITECT FOR IMPACT.** 🏗️🩺⚡

*Modular thinking = Medical thinking. Independent systems save patients when others fail.*