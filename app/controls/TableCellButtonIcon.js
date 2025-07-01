import React, { useState } from 'react';

const TableCellButtonIcon = ({ icon, text, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type='button'
        className="bg-white text-dark p-2 rounded-full mx-3"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={onClick}
      >
        {icon}
      </button>
      {text &&
        <div
          className={`absolute z-10 bg-gray-800 text-white text-sm rounded p-2 -mt-10 right-0 top-0 transform -translate-x-1/2 transition-opacity duration-300 ease-in-out tooltip ${showTooltip ? 'block' : 'hidden'
            }`}
        >
          {text}
        </div>
      }
    </div>
  );
};

export default TableCellButtonIcon;
