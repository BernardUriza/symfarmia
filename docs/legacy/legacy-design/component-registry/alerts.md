# Alerts Registry

Mapping alert components and their migration status.

## SimpleAlert
- **Legacy**: `/legacy_core/app/controls/Alerts/SimpleAlert.js`
- **New**: `/app/controls/Alerts/SimpleAlert.js`
- **UI Components**: 
  - `/app/components/ui/alert-dialog.js`
- **Status**: ✅ Migrated
- **Migration Date**: 2025-01-08
- **Changes**:
  - Replaced @material-tailwind/react Alert with shadcn/ui AlertDialog
  - Uses Radix UI primitives for better accessibility
  - Simplified backdrop and animation handling
  - Consistent with new design system patterns

## LoadingAlert
- **Legacy**: `/legacy_core/app/controls/Alerts/LoadingAlert.js`
- **New**: `/app/controls/Alerts/LoadingAlert.js`
- **UI Components**: 
  - `/app/components/ui/progress.js`
- **Status**: ✅ Migrated
- **Migration Date**: 2025-01-08
- **Changes**:
  - Replaced @material-tailwind/react Alert and Progress
  - Custom loading modal using shadcn/ui patterns
  - Uses existing Progress component with Radix UI
  - Removed animation configuration for simpler implementation

## ConfirmAlert
- **Legacy**: `/legacy_core/app/controls/Alerts/ConfirmAlert.js`
- **New**: `/app/controls/Alerts/ConfirmAlert.js`
- **UI Components**: 
  - `/app/components/ui/alert-dialog.js`
- **Status**: ✅ Migrated
- **Migration Date**: 2025-01-08
- **Changes**:
  - Replaced @material-tailwind/react Alert with AlertDialog
  - Uses proper semantic AlertDialog for confirmations
  - Better keyboard navigation and accessibility
  - Consistent button variants with new design system

## Base UI Components Added
- **Alert**: `/app/components/ui/alert.js`
  - Base alert component for notifications
  - Supports variants: default, destructive
  - From Figma export design system

- **AlertDialog**: `/app/components/ui/alert-dialog.js`
  - Modal dialog for confirmations and simple messages
  - Uses @radix-ui/react-alert-dialog
  - Includes all necessary sub-components