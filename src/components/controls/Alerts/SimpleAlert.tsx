import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '../../ui/alert-dialog';

interface SimpleAlertProps {
  open: boolean;
  onClose: () => void;
  text: string;
}

export function SimpleAlert({ open, onClose, text }: SimpleAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogDescription className="text-lg">
          {text}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
