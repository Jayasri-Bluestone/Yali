import React from 'react';

export function ToggleSwitch({ checked, onChange, activeLabel = 'Active', inactiveLabel = 'Inactive' }) {
  return (
    <label className="flex items-center cursor-pointer group">
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <div className={`block w-11 h-6 rounded-full transition-colors duration-300 ease-in-out ${checked ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out shadow-sm ${checked ? 'translate-x-5' : ''}`}></div>
      </div>
      {(activeLabel || inactiveLabel) && (
        <span className={`ml-3 text-sm font-bold transition-colors ${checked ? 'text-purple-700' : 'text-gray-500'}`}>
          {checked ? activeLabel : inactiveLabel}
        </span>
      )}
    </label>
  );
}
