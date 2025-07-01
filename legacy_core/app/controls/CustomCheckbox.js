import React from 'react';
import { CheckIcon } from "@heroicons/react/24/outline";

const CustomCheckbox = ({ checked, onChange, label }) => {

  const handleCheckboxChange = () => {
    const newCheckedState = !checked;
    onChange(newCheckedState); // Pass the new checked state to the parent component.
  };

  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <div
        className={`w-6 h-6 border rounded-md transition-colors duration-300 ease-in-out border-gray-400 ${checked ? 'bg-blue-500 border-blue-500' : ''}`}
        onClick={handleCheckboxChange}
      >
        {checked && (
          <CheckIcon color='white' />
        )}
      </div>
      {label && <span className="text-gray-700">{label}</span>}
    </label>
  );
};

export default CustomCheckbox;
