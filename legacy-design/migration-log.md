# Legacy Design Migration Log

## Timeline
- 2025-01-15: Initial Figma export imported.
- 2025-01-08: Migration status assessment and planning.
- 2025-01-08: Migrated Alert components (SimpleAlert, LoadingAlert, ConfirmAlert) from @material-tailwind to shadcn/ui.

## Component Migration Status

### ✅ Completed Migrations
1. **ClinicalNotes** (medical component)
   - Source: `/legacy-design/figma-exports/2025-01-15-medical-v1/components/ClinicalNotes.tsx`
   - Target: `/app/components/ClinicalNotes.js`
   - Status: Migrated from TypeScript to JavaScript
   - Date: 2025-01-15

2. **ConversationCapture** (medical component)
   - Source: `/legacy-design/figma-exports/2025-01-15-medical-v1/components/ConversationCapture.tsx`
   - Target: `/app/components/ConversationCapture.js`
   - Status: Migrated from TypeScript to JavaScript
   - Date: 2025-01-15

3. **UI Base Components** (shadcn/ui pattern)
   - Location: `/app/components/ui/`
   - Components: button, card, badge, tabs, textarea, progress, alert, alert-dialog
   - Status: Implemented using modern design patterns
   - Tech: Tailwind CSS + class-variance-authority

4. **Alert Components** (migrated from legacy)
   - **SimpleAlert**: `/app/controls/Alerts/SimpleAlert.js`
   - **LoadingAlert**: `/app/controls/Alerts/LoadingAlert.js`
   - **ConfirmAlert**: `/app/controls/Alerts/ConfirmAlert.js`
   - Status: Migrated from @material-tailwind to shadcn/ui
   - Date: 2025-01-08

### 🚧 In Progress
None currently in active development.

### ❌ Pending Migration


#### Medium Priority - Medical Components from Figma
1. **OrderEntry** (`/legacy-design/figma-exports/2025-01-15-medical-v1/components/OrderEntry.tsx`)
   - Medical order entry interface
   - Requires state management integration

2. **DialogueFlow** (`/legacy-design/figma-exports/2025-01-15-medical-v1/components/DialogueFlow.tsx`)
   - Conversation flow management
   - Integration with AI features needed

3. **SummaryExport** (`/legacy-design/figma-exports/2025-01-15-medical-v1/components/SummaryExport.tsx`)
   - Medical report summary and export
   - PDF generation integration required

#### Low Priority - Remaining Legacy Components
- All components in `/legacy_core/app/controls/`
- Legacy form components in `/legacy_core/app/components/`
- Over 30+ UI components in Figma export awaiting migration

## Technical Debt
1. Mixed JavaScript/TypeScript codebase
2. Dual design systems (@material-tailwind + shadcn/ui)
3. Inconsistent component patterns (class vs functional)
4. PropTypes vs TypeScript types

## Next Steps
1. Migrate high-priority Alert components
2. Update component registry with migration status
3. Complete medical component migrations
4. Standardize on TypeScript for new components
5. Remove @material-tailwind dependency after full migration

