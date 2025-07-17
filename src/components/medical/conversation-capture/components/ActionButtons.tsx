import React from 'react';
import { Button } from '@/src/components/ui/button';

interface ActionButtonsProps {
  show: boolean;
  onNext: () => void;
  nextLabel: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  show,
  onNext,
  nextLabel
}) => {
  if (!show) return null;

  return (
    <div className="mt-6 flex justify-center">
      <Button 
        onClick={onNext} 
        size="lg" 
        variant="default"
      >
        {nextLabel}
      </Button>
    </div>
  );
};