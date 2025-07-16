# Medical AI Demo Loading Fix

## Problem
The medical-ai-demo page was not loading correctly on the first attempt when navigating from the PatientWorkflow. Users had to:
1. Select a patient
2. Dashboard would reset/fail to load
3. Select the patient again for it to work

## Root Causes
1. **Race Condition**: The `showPatientSelector` state was initialized to `true` before checking URL parameters
2. **Async Loading**: The `useDemoPatients` hook has a 1-second delay to simulate loading
3. **State Conflicts**: External patient data from bypass wasn't properly synchronized with the component state

## Solution Implemented

### 1. Lazy Initial State
```javascript
// Check for bypass params before setting initial state
const [initialBypassCheck] = useState(() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('bypass') === 'true' && urlParams.get('patientData');
  }
  return false;
});

const [showPatientSelector, setShowPatientSelector] = useState(!initialBypassCheck);
```

### 2. Loading State
Added a loading state to handle the bypass processing:
```javascript
const [isLoading, setIsLoading] = useState(initialBypassCheck);
```

### 3. Improved useEffect
- Sets loading to false after processing
- Handles errors properly
- Shows patient selector on error

### 4. URL Cleanup
When resetting the demo, we now clear URL parameters to avoid stale data:
```javascript
const url = new URL(window.location.href);
url.searchParams.delete('bypass');
url.searchParams.delete('patientData');
url.searchParams.delete('type');
window.history.replaceState({}, '', url.pathname);
```

## Benefits
- **First Load Works**: The demo loads correctly on the first attempt
- **No Flash**: No patient selector flash when bypassing
- **Clean URLs**: URL parameters are cleaned up on reset
- **Better UX**: Loading state provides feedback during initialization

## Testing
1. Navigate to PatientWorkflow
2. Select a patient
3. Click "Consulta General" or "Consulta Urgente"
4. Verify the demo loads immediately without showing patient selector
5. Reset the demo and verify URL is clean