import React from 'react';

interface DemoResetButtonProps {
  onReset: () => void;
  disabled?: boolean;
}

export const DemoResetButton = ({ 
  onReset, 
  disabled = false 
}: DemoResetButtonProps) => {
  return (
    <button 
      onClick={onReset}
      disabled={disabled}
      className="demo-reset-button bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
    >
      Reiniciar Demo
    </button>
  );
};

export default DemoResetButton;