"use client"

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SimpleSelectOption {
  value: string
  label: string
}

export interface SimpleSelectProps {
  value: string
  onChange: (value: string) => void
  options: SimpleSelectOption[]
  placeholder?: string
  className?: string
}

export default function SimpleSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  className = ""
}: SimpleSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  // Fechar o dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Encontrar a opção selecionada
  const selectedOption = options.find(option => option.value === value)

  return (
    <div 
      ref={selectRef}
      className={`relative ${className}`}
    >
      <div
        className="flex items-center justify-between h-7 px-2 py-1 bg-gray-800 border border-gray-700 rounded-md text-sm text-white cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
          {options.map(option => (
            <div
              key={option.value}
              className={`px-2 py-1 text-sm cursor-pointer hover:bg-gray-700 ${
                option.value === value ? 'bg-gray-700 text-white' : 'text-gray-300'
              }`}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}