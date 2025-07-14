# SYMFARMIA Agents.md Guide v3 - Multi-Agent Medical Development

This document provides detailed guidance for **Claudio**, **Codex**, and other AI agents working with the SYMFARMIA medical platform codebase following official Agents.md standards.
For quick instructions and required checks see the root [AGENTS.md](../../AGENTS.md) file. Pro tip: a witty comment here and there keeps everyone awake during long reviews.

## Agent Architecture & Roles

### Claudio (Primary Medical Development Agent)
- **Role**: Senior Medical Frontend Architect
- **Responsibilities**: 
  - React/Next.js medical dashboard development
  - Prisma database operations for patient data
  - Medical UI/UX compliance and accessibility
  - Code reviews for HIPAA compliance
- **Context Management**: Maintains `dev-notes/claudio.md`
- **Activation**: `claude --resume` to restore medical development context

### Codex (Secondary Implementation Agent)
- **Role**: Backend Medical API Specialist
- **Responsibilities**:
  - Medical AI endpoint development (`/api/medical-ai`)
  - Deployment and build processes
  - Database migrations for medical records
  - Performance optimization for rural clinics
- **Context Management**: Maintains `dev-notes/codex.md`
- **Activation**: `codex --approval-mode full-auto` for rapid implementation

## Project Structure for Multi-Agent Navigation

- `/app`: Next.js 13+ medical application structure
  - `/api/medical-ai`: **Codex-managed** medical AI endpoints
  - `/dashboard`: **Claudio-managed** medical dashboard components
  - `/landing`: **Claudio-managed** marketing for medical professionals
  - `/components`: **Shared** reusable medical UI components
- `/hooks`: **Claudio-managed** custom React hooks (memory leak prevention critical)
- `/services`: **Codex-managed** medical AI service integrations
- `/lib`: **Shared** utility functions for medical data processing
- `/translations`: **Claudio-managed** Spanish medical terminology
- `/dev-notes`: **Multi-agent** development coordination
  - `claudio.md`: Claudio's medical development notes
  - `codex.md`: Codex's implementation notes
  - `shared-context.md`: Cross-agent medical context
- `/chronicles`: **Shared** synchronization and deployment logs

## Multi-Agent Workflow Synchronization

### Before Starting Medical Development Work
```bash
# Claudio activation
claude --resume
git pull --rebase origin dev
npm run build
# Check medical compliance status
npm run check:hipaa
# Review shared context
cat dev-notes/shared-context.md

# Codex activation  
codex --approval-mode auto
git pull --tags origin dev --rebase
npm run build
# Verify medical AI endpoints
curl localhost:3000/api/medical-ai/transcription
```

### During Medical Development
1. **Feature branches**: Create from `dev` with medical safety prefixes
   - `medical/feature-name` (Claudio)
   - `api/feature-name` (Codex)
2. **Real-time documentation**: Update respective agent notes
3. **Medical testing**: Test with healthcare compliance requirements
4. **Cross-agent communication**: Use descriptive commit messages
5. **Patient data safety**: Verify HIPAA compliance for any data changes

### After Completing Medical Work
```bash
# Medical compliance verification
npm run test:medical
npm run lint:medical
npm run check:hipaa

# API endpoint verification for medical services
curl localhost:3000/api/medical-ai
curl localhost:3000/api/medical/transcription

# Context preservation
echo "Session complete: [agent-name] - [medical feature]" >> dev-notes/shared-context.md
# Save agent context: "Save your current medical development context to a file"
```

## Medical Software Coding Conventions

### General Medical Development Standards (Both Agents)
- **TypeScript mandatory** for all medical-critical code
- **HIPAA/GDPR compliance** verification required for patient data
- **Defensive programming** for medical safety-critical functions
- **Extensive logging** for medical audit trails
- **Memory leak prevention** essential for medical device reliability

### Claudio-Specific Medical React Guidelines
- Functional components with proper medical timer cleanup
- Medical form validation with healthcare-specific rules
- Accessibility compliance (WCAG 2.1 AA) for medical professionals
- File naming: `MedicalComponent.tsx` for healthcare UI
- Proper patient data state management with secure cleanup

### Codex-Specific Medical API Standards
- All medical AI endpoints must include confidence scores
- Rate limiting for medical AI to prevent abuse
- Error handling with medical-safe fallbacks
- Audit logging for all patient data access
- Input validation for medical safety

## Medical Testing & Verification Protocols

### Claudio Medical UI Testing
```bash
# Medical accessibility testing
npm run test:a11y-medical

# Medical form validation testing
npm run test:medical-forms

# Mobile medical device testing
npm run test:mobile-medical
```

### Codex Medical API Testing
```bash
# Medical AI endpoint testing
npm run test:medical-ai

# HIPAA compliance verification
npm run test:hipaa-endpoints

# Medical performance testing
npm run test:api-performance
```

### Shared Medical Integration Testing
```bash
# Full medical system integration
npm run test:medical-integration

# Rural clinic scenario testing
npm run test:rural-clinic

# Medical emergency workflow testing
npm run test:emergency-medical
```

## Multi-Agent Conflict Resolution for Medical Code

### When Medical Development Conflicts Occur:
1. **Document immediately** in `chronicles/dev-sync.md`
2. **Medical safety first**: Verify no patient data corruption
3. **Cross-agent communication**: Tag other agent in commit messages
4. **Testing priority**: Medical compliance tests before merge
5. **Context synchronization**: Update `shared-context.md`

### Medical Emergency Conflict Resolution:
```bash
# Emergency medical rollback
npm run emergency:rollback

# Verify medical system integrity
npm run verify:medical-integrity

# Cross-agent coordination
echo "MEDICAL EMERGENCY: [issue]" >> chronicles/dev-sync.md

# Restore last known medical-safe state
git reset --hard last-medical-safe-commit
```

## Medical Pull Request Guidelines for Both Agents

When AI agents create medical PRs:

1. **Medical impact assessment**: Document healthcare implications
2. **HIPAA compliance verification**: Include compliance checklist
3. **Cross-agent review**: Tag appropriate agent for domain review
4. **Rural clinic testing**: Verify low-bandwidth/mobile scenarios
5. **Medical professional accessibility**: Ensure healthcare worker usability
6. **Patient data security**: Audit any patient information handling
7. **Medical AI confidence**: Document AI model confidence thresholds

### PR Template for Medical Features:
```markdown
## Medical Safety Checklist
- [ ] HIPAA compliance verified
- [ ] Patient data encryption confirmed
- [ ] Medical AI confidence scores included
- [ ] Rural clinic compatibility tested
- [ ] Cross-agent review completed
- [ ] Medical accessibility verified

## Agent Coordination
**Primary Agent**: [Claudio/Codex]
**Review Agent**: [Other agent]
**Medical Domain**: [Frontend/Backend/AI/Database]
```

## Agent-Specific Commands & Context Management

### Claudio Commands
```bash
# Context restoration
claude --resume

# Medical frontend development
npm run dev:medical-frontend

# Medical UI compliance check
npm run check:medical-ui

# Save medical frontend context
# "Save current medical UI development context to dev-notes/claudio.md"
```

### Codex Commands  
```bash
# Rapid medical API implementation
codex --approval-mode full-auto "implement medical transcription endpoint"

# Medical database migration
codex "generate Prisma migration for patient data schema"

# Medical AI service integration
codex "integrate Bio_ClinicalBERT with medical consultation API"

# Save medical backend context
# "Save current medical API development context to dev-notes/codex.md"
```

## Medical Domain-Specific Multi-Agent Protocols

### Patient Data Security (Both Agents)
- **Encryption at rest**: Both agents verify patient data encryption
- **Audit trails**: Codex implements, Claudio validates UI compliance
- **Data anonymization**: Shared responsibility for AI training data
- **Access control**: Codex backend + Claudio frontend validation

### Rural Clinic Optimization (Cross-Agent Collaboration)
- **Offline functionality**: Codex backend + Claudio frontend sync
- **Low bandwidth**: Codex API optimization + Claudio UI compression
- **Mobile performance**: Shared testing and optimization
- **Simplified UI**: Claudio design + Codex performance validation

### Medical AI Ethics (Collaborative Oversight)
- **Bias prevention**: Both agents audit AI model outputs
- **Transparency**: Codex confidence scores + Claudio UI display
- **Informed consent**: Claudio UI flows + Codex audit logging
- **Cultural competency**: Shared responsibility for diverse populations

## Emergency Medical Coordination Protocols

### Critical Medical System Issues
```bash
# Multi-agent emergency response
echo "MEDICAL EMERGENCY: [issue] - Agents: Claudio & Codex responding" >> chronicles/emergency-log.md

# Parallel emergency verification
npm run emergency:medical-verification  # Both agents
npm run emergency:patient-data-check    # Codex
npm run emergency:ui-accessibility      # Claudio

# Cross-agent recovery coordination
git checkout medical-emergency-branch
# Both agents coordinate via shared-context.md
```

## Agent Performance Metrics & Accountability

### Claudio Medical Frontend Metrics
- Medical UI accessibility compliance: 100% WCAG 2.1 AA
- Rural clinic mobile performance: <3s load time
- Medical form validation accuracy: 99.9%
- Healthcare professional user satisfaction: >4.5/5

### Codex Medical Backend Metrics  
- Medical API response time: <500ms
- HIPAA compliance score: 100%
- Medical AI endpoint uptime: 99.9%
- Patient data security incidents: 0

### Cross-Agent Collaboration Metrics
- Conflict resolution time: <2 hours
- Cross-agent code review coverage: 100%
- Medical compliance test pass rate: 100%
- Rural clinic deployment success: 100%

---

This AGENTS.md v3 ensures both Claudio and Codex work collaboratively on SYMFARMIA while maintaining medical safety, compliance, and optimal patient care delivery for underserved populations.