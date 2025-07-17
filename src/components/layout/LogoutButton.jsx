"use client";

import React from 'react';
import { LogOut } from 'lucide-react';

const LogoutButton = ({ className = '' }) => {
  
  const handleLogout = () => {
    // Clear any local storage items
    localStorage.removeItem('medicalAIDemoPatient');
    localStorage.removeItem('theme');
    
    // Redirect to Auth0 logout
    window.location.href = '/auth/logout';
  };
  
  return (
    <button
      onClick={handleLogout}
      className={`
        flex items-center gap-2 px-4 py-2 
        text-sm font-medium text-gray-700
        bg-white 
        border border-gray-300
        rounded-lg hover:bg-gray-50
        transition-colors duration-200
        ${className}
      `}
      aria-label="Logout"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </button>
  );
};

export default LogoutButton;