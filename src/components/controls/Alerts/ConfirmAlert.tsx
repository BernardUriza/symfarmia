import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../../ui/alert-dialog';

interface ConfirmationData {
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConfirmAlertProps {
  confirmation: ConfirmationData | null;
}

export default function ConfirmAlert({ confirmation }: ConfirmAlertProps) {
  const { text, onConfirm, onCancel } = confirmation || {};

  return (
    <AlertDialog open={Boolean(confirmation)} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogDescription className="text-lg">
          {text}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
