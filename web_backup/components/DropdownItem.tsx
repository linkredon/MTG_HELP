"use client"

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface DropdownItemProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  danger?: boolean;
}

export default function DropdownItem({ 
  children, 
  icon: Icon, 
  onClick, 
  className = '',
  danger = false
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={`dropdown-item ${danger ? 'text-red-400 hover:bg-red-900/30' : ''} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
}