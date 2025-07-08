"use client"

import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface SimpleSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function SimpleSelect({ value, onChange, options, placeholder = "Selecionar" }: SimpleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(() => {
    return options.find(opt => opt.value === value)?.label || placeholder;
  });
  
  const selectRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setSelectedLabel(options.find(opt => opt.value === value)?.label || placeholder);
  }, [value, options, placeholder]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div ref={selectRef} className={`relative w-full dropdown-container ${isOpen ? 'dropdown-open' : ''}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="quantum-field-sm h-7 w-full flex items-center justify-between px-2 py-1 text-sm bg-gray-900/50 border border-gray-600 rounded-md text-white"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 opacity-50 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg simple-dropdown-content">
          <div className="py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-1 text-sm hover:bg-gray-800 ${
                  value === option.value ? 'bg-gray-800 text-white' : 'text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}