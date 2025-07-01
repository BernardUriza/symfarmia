import React, { useState } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/24/outline';
const TextInputWithIcon = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (onChange) {
      onChange(e.target.value); // Notify the parent component about the change
    }
  };

  const handleDeleteText = () => {
    setInputValue('');
    if (onChange) {
      onChange(''); // Notify the parent component about the change
    }
  };

  return (
    <div className="relative px-2">
      <div className="flex">
        <div className="relative pr-4">
          <button className="absolute left-0 top-0 h-full px-4 flex items-center justify-center text-gray-600">
            <SearchIcon className="h-5 w-5 mx-2" />
          </button>
        </div>
        <input
          type="text"
          className="w-64 px-4 py-2 border border-gray-300 rounded-lg pr-14"
          style={{ paddingLeft: "35px", width: '20vw' }}
          placeholder="Buscar..."
          value={inputValue}
          onChange={handleInputChange}
        />
        {inputValue && (
          <button
            className="absolute right-0 top-0 h-full px-4 flex items-center justify-center text-gray-600 hover:text-red-500"
            onClick={handleDeleteText}
          >
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TextInputWithIcon;