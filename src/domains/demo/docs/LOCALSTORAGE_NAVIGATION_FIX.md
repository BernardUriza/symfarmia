# localStorage Navigation Fix for Medical AI Demo

## Problem
The medical-ai-demo was reloading/resetting when selecting a patient from PatientWorkflow for the first time. This was caused by:
- URL parameters triggering component re-renders
- Race conditions between state initialization and URL parsing
- Next.js router behavior with query parameters

## Solution
Replaced URL parameter-based navigation with localStorage:

### 1. PatientWorkflow Changes
```javascript
// Before: URL params
router.push(`/medical-ai-demo?bypass=true&patientData=${encodeURIComponent(JSON.stringify(patientData))}&type=general`);

// After: localStorage
localStorage.setItem('medicalAIDemoPatient', JSON.stringify(patientData));
router.push('/medical-ai-demo');
```

### 2. Medical AI Demo Changes
- Initialize state directly from localStorage (synchronous)
- Remove loading state (no longer needed)
- Clear localStorage after reading to prevent stale data
- Simplified reset logic

## Benefits
1. **No Reloads**: Navigation is smooth without page refreshes
2. **Simpler State**: No complex URL parsing or loading states
3. **Better UX**: Instant navigation with no flashing
4. **Cleaner URLs**: No long encoded parameters in the URL

## Implementation Details

### Storage Key
- Key: `medicalAIDemoPatient`
- Value: JSON stringified patient object with:
  - id, name, age, gender
  - medicalHistory array
  - consultationType ('general' or 'urgent')

### Lifecycle
1. PatientWorkflow stores patient data in localStorage
2. Navigates to /medical-ai-demo
3. Medical AI Demo reads from localStorage on mount
4. Data is cleared after 100ms to prevent stale data
5. Reset button also clears localStorage

## Testing
1. Navigate to PatientWorkflow
2. Select any patient
3. Click "Consulta General" or "Consulta Urgente"
4. Verify smooth navigation without reloads
5. Reset and verify localStorage is cleared